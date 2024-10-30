import { Injectable } from '@angular/core';
import {
    Firestore,
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    orderBy,
    CollectionReference,
    DocumentReference,
    DocumentSnapshot,
    getDoc,
    setDoc,
    arrayUnion,
} from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { NotificationService } from './notification.service';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { catchError, combineLatest, filter, finalize, forkJoin, from, map, Observable, of, switchMap } from 'rxjs';
import moment from 'moment';

import { ClinicStatus } from 'app/_enums/clinicStatus.enum';
import { NotificationType } from 'app/_enums/notificationType.enum';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PortalService {
    constructor(
        private firestore: Firestore,
        private _notificationService: NotificationService,
        private _httpClient: HttpClient,
        private storage: Storage
    ) { }

    // Clinics
    addClinic(data): Promise<DocumentReference<unknown>> {
        const clinicsRef = collection(this.firestore, 'clinics');
        return addDoc(clinicsRef, data);
    }

    updateClinic(id: string, data: any): Promise<void> {
        const clinicRef = doc(this.firestore, 'clinics/' + id);
        return updateDoc(clinicRef, data);
    }

    deleteClinic(id: string): Promise<void> {
        const clinicRef = doc(this.firestore, 'clinics/' + id);
        return deleteDoc(clinicRef);
    }



    getClinics(): Observable<any[]> {
        console.log('Resolver called: Fetching clinics...');

        const clinicsRef = collection(this.firestore, 'appointments');
        return new Observable((observer) => {
            getDocs(clinicsRef)
                .then((snapshot) => {
                    if (snapshot.empty) {
                        console.error('No clinics found in Firestore!');
                        observer.next([]);  // Return an empty array if no documents are found
                    } else {
                        const clinicsData = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        }));
                        console.log('Clinics fetched:', clinicsData); // Log the clinics data
                        observer.next(clinicsData);
                    }
                    observer.complete();
                })
                .catch((error) => {
                    console.error('Error fetching clinics:', error); // Log the error
                    observer.error(error);
                });
        });
    }




    // Staffs
    addStaff(data): Promise<DocumentReference<unknown>> {
        const staffsRef = collection(this.firestore, 'staffs');
        return addDoc(staffsRef, data);
    }

    updateStaff(id: string, data: any): Promise<void> {
        const staffRef = doc(this.firestore, 'staffs/' + id);
        return updateDoc(staffRef, data);
    }

    deleteStaff(id: string): Promise<void> {
        const staffRef = doc(this.firestore, 'staffs/' + id);
        return deleteDoc(staffRef);
    }

    getStaffs(clinic_id: string): Observable<DocumentSnapshot<unknown>[]> {
        const staffsRef = collection(this.firestore, 'staffs');
        const q = query(staffsRef, where('clinic_id', '==', clinic_id));
        return new Observable((observer) => {
            getDocs(q).then((snapshot) => {
                console.log(snapshot.docs);
                observer.next(snapshot.docs.map(doc => doc.data() as DocumentSnapshot<unknown>));
                observer.complete();
            }).catch(error => observer.error(error));
        });
    }

    getStaffList(): Observable<DocumentSnapshot<unknown>[]> {
        const patientsRef = collection(this.firestore, 'staff');
        return new Observable((observer) => {
            getDocs(patientsRef).then((snapshot) => {
                observer.next(snapshot.docs.map(doc => doc.data() as DocumentSnapshot<unknown>));
                observer.complete();
            }).catch(error => observer.error(error));
        });
    }

    // Patients
    addPatient(data): Promise<DocumentReference<unknown>> {
        data.status = ClinicStatus.ACTIVE; // Ensure the patient is active
        return this.addPatientInAuth(data).toPromise();
    }

    getPatients(): Observable<DocumentSnapshot<unknown>[]> {
        const patientsRef = collection(this.firestore, 'patients');
        return new Observable((observer) => {
            getDocs(patientsRef).then((snapshot) => {
                observer.next(snapshot.docs.map(doc => doc.data() as DocumentSnapshot<unknown>));
                observer.complete();
            }).catch(error => observer.error(error));
        });
    }

    getPatientById(patientId: string): Observable<any> {
        const patientDocRef = doc(this.firestore, `patients/${patientId}`);
        return from(getDoc(patientDocRef)).pipe(
            map((docSnap) => (docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null))
        );
    }

    createPatient(data: any): Promise<any> {
        const patientsRef = collection(this.firestore, 'patients');
        return addDoc(patientsRef, data); // Automatically generates a new document ID
    }

    updatePatient(patientId: string, data: any): Promise<void> {
        // Create a reference to the specific patient document
        const patientDocRef = doc(this.firestore, `patients/${patientId}`);
        // Update the document with the new data
        return updateDoc(patientDocRef, data);
    }


    // Upload file to Firebase Storage
    async uploadFile(file: File, folder: string, patientId: string): Promise<string> {
        const filePath = `${folder}/${patientId}/${file.name}`;
        const fileRef = ref(this.storage, filePath);

        console.log("Uploading file to:", filePath);

        // Upload file
        await uploadBytes(fileRef, file);

        // Retrieve the download URL
        const downloadURL = await getDownloadURL(fileRef);
        console.log("File uploaded with URL:", downloadURL);

        return downloadURL;
    }

    deletePatient(id: string): Promise<void> {
        const patientRef = doc(this.firestore, 'patients/' + id);
        return deleteDoc(patientRef);
    }

    addPatientInAuth(payload: any): Observable<any> {
        payload = {
            ...payload,
            languages: payload.languages.split(','),
            dental_needs: payload.dental_needs.split(','),
            fromClinic: true,
            dob: moment(payload.dob).valueOf(),
        };
        return this._httpClient.post<any>(
            `${environment.firebase.cloudFunctionUrl}/app/api/patients/patient`,
            payload
        );
    }

    getFamilyByPatientRef(patientRefPath: string): Observable<any> {
        const familiesRef = collection(this.firestore, 'families');
        const patientRef = doc(this.firestore, patientRefPath);

        // Query to get family data based on patient_id reference
        const q = query(familiesRef, where('patient_id', '==', patientRef));

        return from(getDocs(q)).pipe(
            map((snapshot) => {
                return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            })
        );
    }

    async addFamilyMember(patientId: string, memberData: any): Promise<void> {
        const familiesRef = collection(this.firestore, 'families');

        // Query to check if a family document exists for this patient
        const q = query(familiesRef, where('patientsIds', 'array-contains', patientId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            // No family exists, create a new family document
            const newFamilyData = {
                patient_id: doc(this.firestore, `patients/${patientId}`), // Reference to the patient
                patientsIds: [patientId], // Array of patient IDs (includes the current patient ID)
                memberDetails: [memberData] // Add the new family member
            };

            // Use addDoc to create a new document with generated ID
            await addDoc(familiesRef, newFamilyData);
        } else {
            // Family document exists, update it by adding the new member
            const familyDoc = snapshot.docs[0].ref;

            // Add the new member to the existing family document
            await updateDoc(familyDoc, {
                memberDetails: arrayUnion(memberData)
            });
        }
    }

    getFamilyByPatientId(patientId: string): Observable<any> {
        const familiesRef = collection(this.firestore, 'families');
        console.log(familiesRef);

        // Query to get family data where patientsIds array contains the patient ID
        const q = query(familiesRef, where('patientsIds', 'array-contains', patientId));

        return from(getDocs(q)).pipe(
            map((snapshot) => {
                return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            })
        );
    }

    getFamilyMemberById(patientId: string, familyMemberId: string): Observable<any> {
        const familiesRef = collection(this.firestore, 'families');

        // Query to find the family document where patientId is part of patientsIds array
        const q = query(familiesRef, where('patientsIds', 'array-contains', patientId));

        return from(getDocs(q)).pipe(
            map((snapshot) => {
                if (snapshot.empty) return null;

                // Assuming there is only one family document for each patient
                const familyDoc = snapshot.docs[0].data();
                const memberDetails = familyDoc.memberDetails || [];

                // Find the specific family member by familyMemberId
                const familyMember = memberDetails.find(
                    (member: any) => member.patientId === familyMemberId
                );

                return familyMember || null; // Return null if the family member is not found
            })
        );
    }

    updatePatientInAuth(payload: any, id: string): Observable<any> {
        payload = {
            ...payload,
            languages: payload.languages,
            fromClinic: true,
            dob: moment(payload.dob).valueOf(),
        };
        return this._httpClient.put<any>(
            `${environment.firebase.cloudFunctionUrl}/app/api/patients/patient/${id}`,
            payload
        );
    }

    // Appointments
    async addAppointment(data): Promise<any> {
        const appointmentsRef = collection(this.firestore, 'appointments');
        const appointmentRef = await addDoc(appointmentsRef, data);
        await this._notificationService.sendNotification({
            type: NotificationType.APPOINTMENT,
            referenceId: appointmentRef.id,
        }).toPromise();
    }

    async updateAppointment(id: string, data: any): Promise<any> {
        const appointmentRef = doc(this.firestore, 'appointments/' + id);
        await updateDoc(appointmentRef, data);
        return this._notificationService.sendNotification({
            type: NotificationType.APPOINTMENT,
            referenceId: id,
        }).toPromise();
    }

    getAppointments(): Observable<any[]> {
        const appointmentsRef = collection(this.firestore, 'appointments');

        return from(getDocs(appointmentsRef)).pipe(
            switchMap((snapshot) => {
                const appointments = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Create an array of observables for fetching patient and provider data
                const appointmentObservables = appointments.map((appointment: any) => {
                    const patientRef = appointment.patient_id ? from(getDoc(appointment.patient_id)) : of(null); // Return null observable if patient_id is missing
                    const providerRef = appointment.provider_id ? from(getDoc(appointment.provider_id)) : of(null); // Return null observable if provider_id is missing

                    // Resolve both patient and provider and return the enriched appointment
                    return forkJoin({
                        patient: patientRef.pipe(map((snap) => (snap?.exists() ? snap.data() : null))),
                        provider: providerRef.pipe(map((snap) => (snap?.exists() ? snap.data() : null))),
                        appointment: of(appointment), // Wrap appointment in an observable
                    }).pipe(
                        map(({ patient, provider, appointment }) => ({
                            ...appointment,
                            patient,
                            provider,
                        }))
                    );
                });

                // Combine all the appointment observables
                return forkJoin(appointmentObservables);
            })
        );
    }


    getAppointmentsByPatientId(patientId: string): Observable<any[]> {
        const patientRef = doc(this.firestore, `patients/${patientId}`);
        const appointmentsRef = collection(this.firestore, 'appointments');
        const q = query(appointmentsRef, where('patient_id', '==', patientRef));

        return from(getDocs(q)).pipe(
            switchMap((snapshot) => {
                // Filter out appointments without a provider
                const appointments = snapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter((appointment: any) => appointment.provider_id);

                const appointmentObservables = appointments.map((appointment: any) => {
                    const patientRef = from(getDoc(appointment.patient_id));
                    const providerRef = from(getDoc(appointment.provider_id));

                    return forkJoin({
                        patient: patientRef.pipe(map((snap) => (snap?.exists() ? snap.data() : null))),
                        provider: providerRef.pipe(map((snap) => (snap?.exists() ? snap.data() : null))),
                        appointment: of(appointment),
                    }).pipe(
                        map(({ patient, provider, appointment }) => ({
                            ...appointment,
                            patient,
                            provider,
                        }))
                    );
                });

                return forkJoin(appointmentObservables);
            })
        );
    }


    getAppointmentsByDate(startDate: Date, endDate: Date): Observable<DocumentSnapshot<unknown>[]> {
        const appointmentsRef = collection(this.firestore, 'appointments');
        const q = query(
            appointmentsRef,
            where('confirmed_date', '>=', startDate),
            where('confirmed_date', '<=', endDate)
        );
        return new Observable((observer) => {
            getDocs(q).then((snapshot) => {
                observer.next(snapshot.docs.map(doc => doc.data() as DocumentSnapshot<unknown>));
                observer.complete();
            }).catch(error => observer.error(error));
        });
    }

    getAlongWithPendingAppointments(): Observable<any[]> {
        const appointmentsRef = collection(this.firestore, 'appointments');
        const q = query(
            appointmentsRef,
            where('status', '==', ClinicStatus.PENDING),  // Filter for pending appointments
            orderBy('createdAt', 'desc')                 // Sort by createdAt in descending order
        );

        return new Observable((observer) => {
            getDocs(q).then((snapshot) => {
                observer.next(snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));
                observer.complete();
            }).catch((error) => observer.error(error));
        });
    }


    getVirtualOperatingHours(): Observable<DocumentSnapshot<unknown>> {
        const appointmentRef = doc(this.firestore, 'clinic/virtualOperatingHours');
        return new Observable((observer) => {
            getDoc(appointmentRef).then((snapshot) => {
                if (snapshot.exists()) {
                    observer.next(snapshot.data() as DocumentSnapshot<unknown>);
                } else {
                    observer.error('No such document!');
                }
                observer.complete();
            }).catch(error => observer.error(error));
        });
    }

    saveVirtualOperatingHours(data): Promise<void> {
        // Reference to the specific document in Firestore
        const docRef = doc(this.firestore, 'clinic/virtualOperatingHours');
        // Use setDoc to either create or update the document
        return setDoc(docRef, data, { merge: true });
    }


    getInsuranceList(): Observable<DocumentSnapshot<unknown>[]> {
        const patientsRef = collection(this.firestore, 'insurance');
        return new Observable((observer) => {
            getDocs(patientsRef).then((snapshot) => {
                observer.next(snapshot.docs.map(doc => doc.data() as DocumentSnapshot<unknown>));
                observer.complete();
            }).catch(error => observer.error(error));
        });
    }


    getOperatingHoursNew(): Observable<DocumentSnapshot<unknown>> {
        const appointmentRef = doc(this.firestore, 'clinic/operatingHours');
        return new Observable((observer) => {
            getDoc(appointmentRef).then((snapshot) => {
                if (snapshot.exists()) {
                    observer.next(snapshot.data() as DocumentSnapshot<unknown>);
                } else {
                    observer.error('No such document!');
                }
                observer.complete();
            }).catch(error => observer.error(error));
        });
    }

    saveOperatingHours(data): Promise<void> {
        // Reference to the specific document in Firestore
        const docRef = doc(this.firestore, 'clinic/operatingHours');
        // Use setDoc to either create or update the document
        return setDoc(docRef, data, { merge: true });
    }


    getClinic(): Observable<DocumentSnapshot<unknown>> {
        const appointmentRef = doc(this.firestore, 'clinic/details');
        return new Observable((observer) => {
            getDoc(appointmentRef).then((snapshot) => {
                if (snapshot.exists()) {
                    observer.next(snapshot.data() as DocumentSnapshot<unknown>);
                } else {
                    observer.error('No such document!');
                }
                observer.complete();
            }).catch(error => observer.error(error));
        });
    }

    saveClinicDetails(data): Promise<void> {
        // Reference to the specific document in Firestore
        const docRef = doc(this.firestore, 'clinic/details');
        // Use setDoc to either create or update the document
        return setDoc(docRef, data, { merge: true });
    }


    // uploadImage(file: File): Observable<string> {
    //     const filePath = `clinic/${file.name}_${new Date().getTime()}`;
    //     const fileRef = this.storage.ref(filePath);
    //     const uploadTask = this.storage.upload(filePath, file);

    //     return uploadTask.snapshotChanges().pipe(
    //         finalize(() => console.log(`Uploaded single image: ${file.name}`)),
    //         switchMap(() => fileRef.getDownloadURL())
    //     );
    // }

    //   // Function to upload multiple images to Firebase Storage
    //   uploadGallery(data: FormData): Observable<string[]> {
    //     const url = 'your-upload-url';  // Adjust this to your upload endpoint

    //     return this._httpClient.post<string[]>(url, data, {
    //         reportProgress: true,
    //         observe: 'events'
    //     }).pipe(
    //         filter(event => event.type === HttpEventType.Response),
    //         map((event: HttpResponse<string[]>) => event.body || [])
    //     );
    // }


    getAppointmentsWithId(id: string): Observable<DocumentSnapshot<unknown>> {
        const appointmentRef = doc(this.firestore, 'appointments', id);
        return new Observable((observer) => {
            getDoc(appointmentRef).then((snapshot) => {
                if (snapshot.exists()) {
                    observer.next(snapshot.data() as DocumentSnapshot<unknown>);
                } else {
                    observer.error('No such document!');
                }
                observer.complete();
            }).catch(error => observer.error(error));
        });
    }


    deleteAppointment(id: string): Promise<void> {
        const appointmentRef = doc(this.firestore, 'appointments/' + id);
        return deleteDoc(appointmentRef);
    }

    // Announcements
    addAnnouncement(data): Promise<DocumentReference<unknown>> {
        const announcementsRef = collection(this.firestore, 'announcements');
        return addDoc(announcementsRef, data);
    }

    updateAnnouncement(id: string, data: any): Promise<void> {
        const announcementRef = doc(this.firestore, 'announcements/' + id);
        return updateDoc(announcementRef, data);
    }

    getAnnouncements(): Observable<any[]> {
        const announcementsRef = collection(this.firestore, 'announcements');

        return new Observable((observer) => {
            getDocs(announcementsRef).then((snapshot) => {
                // Map each document into an array of objects
                observer.next(snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));
                observer.complete();
            }).catch((error) => observer.error(error));
        });
    }


    deleteAnnouncement(id: string): Promise<void> {
        const announcementRef = doc(this.firestore, 'announcements/' + id);
        return deleteDoc(announcementRef);
    }
    getNotifications(): Observable<any> {
        const notificationsRef = doc(this.firestore, 'notifications/ClinicAll');
        return from(getDoc(notificationsRef)).pipe(
            map((snapshot) => snapshot.exists() ? snapshot.data() : null)
        );
    }


    addNotification(data): Promise<DocumentReference<unknown>> {
        const notificationsRef = collection(this.firestore, 'notifications');
        return addDoc(notificationsRef, data);
    }

    updateNotification(id: string, data: any): Promise<void> {
        const notificationRef = doc(this.firestore, 'notifications/' + id);
        return updateDoc(notificationRef, data);
    }

    deleteNotification(id: string): Promise<void> {
        const notificationRef = doc(this.firestore, 'notifications/' + id);
        return deleteDoc(notificationRef);
    }
}
