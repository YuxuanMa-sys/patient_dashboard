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

import { Auth, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential, RecaptchaVerifier } from 'firebase/auth';
import { signInWithPhoneNumber } from '@angular/fire/auth';
import { Service } from './services/services.types';

@Injectable({
    providedIn: 'root',
})
export class PortalService {
    private auth: Auth;
    constructor(
        private firestore: Firestore,
        private _notificationService: NotificationService,
        private _httpClient: HttpClient,
        private storage: Storage,

    ) {
        this.auth = getAuth();
    }

    // Clinics
    // Deprecated or needs adjustment if clinics are stored differently
    // addClinic(data): Promise<DocumentReference<unknown>> {
    //     const clinicsRef = collection(this.firestore, 'clinics');
    //     return addDoc(clinicsRef, data);
    // }

    // updateClinic(id: string, data: any): Promise<void> {
    //     const clinicRef = doc(this.firestore, 'clinics/' + id);
    //     return updateDoc(clinicRef, data);
    // }

    // Method to get data specifically from clinic/details
    getClinicDetails(): Observable<any> {
        const detailsDocRef = doc(this.firestore, 'clinic/details');
        return from(getDoc(detailsDocRef)).pipe(
            map(snapshot => snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null)
        );
    }

    // Method to update data specifically in clinic/details
    updateClinicDetails(data: any): Promise<void> {
        const detailsDocRef = doc(this.firestore, 'clinic/details');
        // Use setDoc with merge: true to create or update the document
        return setDoc(detailsDocRef, data, { merge: true });
    }

    getClinic(){
       return this.getClinicDetails();
    }
    // deleteClinic(id: string): Promise<void> {
    //     const clinicRef = doc(this.firestore, 'clinics/' + id);
    //     return deleteDoc(clinicRef);
    // }

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

    createPatientWithAuth(patientData: any, password: string): Promise<any> {
        // 1. Create the user in Firebase Authentication
        return this.createAuthUser(patientData.email, password)
          .then((userCredential: UserCredential) => {
            // 2. Once the user is created, capture the uid
            const uid = userCredential.user.uid;

            // 3. Add that uid to your patient data
            const fullPatientData = {
              ...patientData,
              uid,
              createdAt: new Date()
            };

            // 4. Create the patient document in Firestore with the uid
            const patientsRef = collection(this.firestore, 'patients');
            return addDoc(patientsRef, fullPatientData)
              .then((docRef: DocumentReference) => {
                // 5. Return the newly created document ID along with the data
                return { id: docRef.id, ...fullPatientData };
              });
          })
          .catch(error => {
            console.error('Error creating patient with Auth:', error);
            throw error; // re-throw for further handling
          });
      }



    createAuthUser(email: string, password: string): Promise<UserCredential> {
        return createUserWithEmailAndPassword(this.auth, email, password);
    }


    // Staffs
    addStaff(data): Promise<DocumentReference<unknown>> {
        const staffsRef = collection(this.firestore, 'staff');
        return addDoc(staffsRef, data);
    }

    updateStaff(id: string, data: any): Promise<void> {
        const staffRef = doc(this.firestore, 'staff/' + id);
        return updateDoc(staffRef, data);
    }

    deleteStaff(id: string): Promise<void> {
        const staffRef = doc(this.firestore, 'staff/' + id);
        return deleteDoc(staffRef);
    }


    getStaffList(): Observable<any[]> {
        const patientsRef = collection(this.firestore, 'staff');
        return new Observable((observer) => {
            getDocs(patientsRef)
                .then((snapshot) => {
                    const patients = snapshot.docs.map((doc) => ({
                        id: doc.id, // Add document ID here
                        ...doc.data(),
                    }));
                    observer.next(patients);
                    observer.complete();
                })
                .catch((error) => observer.error(error));
        });
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

    createPatient(data: any): Promise<any> {
        const patientsRef = collection(this.firestore, 'patients');
        return addDoc(patientsRef, data).then((docRef: DocumentReference) => {
            // Patient object with the ID added
            return { id: docRef.id, ...data }; // ID is added to the patient object
        });
    }


    createPatientWithPhone(data: any, smsCode: string): Promise<any> {
        // ReCAPTCHA container ke liye ensure karein ke aapke HTML me <div id="recaptcha-container"></div> ho.
        const appVerifier = new RecaptchaVerifier(
            this.auth,             // pehla argument: Auth instance
            'recaptcha-container', // doosra argument: container id ya HTMLElement
            { size: 'invisible' }  // teesra argument: configuration object
        );

        // SMS bhejte hain
        return signInWithPhoneNumber(this.auth, data.number, appVerifier)
            .then((confirmationResult) => {
                // SMS code ko confirm karte hain.
                return confirmationResult.confirm(smsCode);
            })
            .then((userCredential: UserCredential) => {
                // Ab user create ho chuka hai. Auth user ka UID Firestore ke patient data me add kar dete hain.
                data.uid = userCredential.user.uid;
                const patientsRef = collection(this.firestore, 'patients');
                return addDoc(patientsRef, data);
            })
            .then((docRef: DocumentReference) => {
                return { id: docRef.id, ...data };
            });
    }



    // Patients
    addPatient(data: any): Promise<any> {
        data.status = ClinicStatus.ACTIVE; // Ensure the patient is active
        return this.addPatientInAuth(data).toPromise();
    }

    getPatients(): Observable<any[]> {
        const patientsRef = collection(this.firestore, 'patients');
        return new Observable((observer) => {
            getDocs(patientsRef)
                .then((snapshot) => {
                    const patients = snapshot.docs.map((doc) => ({
                        id: doc.id, // Add document ID here
                        ...doc.data(),
                    }));
                    observer.next(patients);
                    observer.complete();
                })
                .catch((error) => observer.error(error));
        });
    }


    getPatientById(patientId: string): Observable<any> {
        const patientDocRef = doc(this.firestore, `patients/${patientId}`);
        return from(getDoc(patientDocRef)).pipe(
            map((docSnap) => (docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null))
        );
    }



    updatePatient(patientId: string, data: any): Promise<void> {
        // Create a reference to the specific patient document
        const patientDocRef = doc(this.firestore, `patients/${patientId}`);
        // Update the document with the new data
        return updateDoc(patientDocRef, data);
    }

    async uploadFiles(files: File[], folder: string, patientId: string): Promise<{ url: string, type: string, name: string }[]> {
        const uploadPromises = files.map(async (file) => {
            const filePath = `${folder}/${patientId}/${file.name}`;
            const fileRef = ref(this.storage, filePath);

            console.log("Uploading file to:", filePath);

            // Upload each file
            await uploadBytes(fileRef, file);

            // Retrieve the download URL for each file
            const downloadURL = await getDownloadURL(fileRef);

            // Map MIME type to a readable format
            const fileType = this.mapMimeTypeToFileType(file.type);

            return {
                url: downloadURL,
                type: fileType,
                name: file.name
            };
        });

        return Promise.all(uploadPromises);
    }

    // Helper function to map MIME types to file types
    private mapMimeTypeToFileType(mimeType: string): string {
        switch (mimeType) {
            case 'application/pdf':
                return 'PDF';
            case 'image/jpeg':
            case 'image/jpg':
            case 'image/png':
                return 'JPG';
            case 'text/csv':
                return 'CSV';
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                return 'XLSX';
            default:
                return 'OTHER';
        }
    }

    async uploadFileWithoutId(file: File, folder: string): Promise<string> {
        const filePath = `${folder}/${Date.now()}_${file.name}`; // Unique filename with timestamp
        const fileRef = ref(this.storage, filePath);

        console.log("Uploading file to:", filePath);

        // Upload file
        await uploadBytes(fileRef, file);

        // Retrieve the download URL
        const downloadURL = await getDownloadURL(fileRef);
        console.log("File uploaded with URL:", downloadURL);

        return downloadURL;
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
        const familyDocRef = doc(familiesRef, patientId); // Use patient ID as family document ID

        // Generate a unique ID for the family member if it's not provided
        if (!memberData.familyMemberId) {
            const uniqueId = doc(collection(this.firestore, 'families')).id;
            memberData.familyMemberId = uniqueId;
        }

        const familyDoc = await getDoc(familyDocRef);

        if (!familyDoc.exists()) {
            // Create a new family document if it doesn't exist
            const newFamilyData = {
                patient_id: doc(this.firestore, `patients/${patientId}`),
                patientsIds: [patientId],
                memberDetails: [memberData],
            };
            await setDoc(familyDocRef, newFamilyData);
        } else {
            // If the family document exists, update it by adding the new member
            await updateDoc(familyDocRef, {
                memberDetails: arrayUnion(memberData),
            });
        }
    }


    getFamilyMembers(patientId: string): Observable<any[]> {
        return from(getDoc(doc(this.firestore, `families/${patientId}`))).pipe(
            map(docSnap => docSnap.exists() ? (docSnap.data().memberDetails || []) : [])
        );
    }

    updateFamilyMember(patientId: string, familyMemberId: string, updatedData: any): Promise<void> {
        const familiesRef = collection(this.firestore, 'families');

        // Query to find the family document that includes the given patient ID
        const q = query(familiesRef, where('patientsIds', 'array-contains', patientId));

        return getDocs(q).then(snapshot => {
            if (snapshot.empty) {
                throw new Error('Family document not found');
            }

            // Get the first (and ideally only) matching family document
            const familyDocRef = snapshot.docs[0].ref;
            const familyData = snapshot.docs[0].data();

            // Check if memberDetails array includes the familyMemberId
            const memberDetails = familyData.memberDetails.map((member: any) => {
                // Update the specified family member
                if (member.familyMemberId === familyMemberId) {
                    return { ...member, ...updatedData };
                }
                return member; // Leave other members unchanged
            });

            // Update the family document with the modified memberDetails
            return updateDoc(familyDocRef, { memberDetails });
        });
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
        const q = query(familiesRef, where('patientsIds', 'array-contains', patientId));

        return from(getDocs(q)).pipe(
            map((snapshot) => {
                if (snapshot.empty) return null;

                // Assuming only one family document for each patient
                const familyDoc = snapshot.docs[0].data();
                const memberDetails = familyDoc.memberDetails || [];

                // Find the specific family member by their unique familyMemberId
                const familyMember = memberDetails.find(
                    (member: any) => member.familyMemberId === familyMemberId
                );

                return familyMember || null; // Return null if the family member is not found
            })
        );
    }

    deleteFamilyMember(patientId: string, familyMemberId: string): Promise<void> {
        const familiesRef = collection(this.firestore, 'families');
        const q = query(familiesRef, where('patientsIds', 'array-contains', patientId));

        return getDocs(q).then(snapshot => {
            if (snapshot.empty) {
                throw new Error('Family document not found');
            }

            // Get the family document and retrieve its data
            const familyDocRef = snapshot.docs[0].ref;
            const familyData = snapshot.docs[0].data();

            // Filter out the family member to be deleted
            const updatedMemberDetails = familyData.memberDetails.filter(
                (member: any) => member.familyMemberId !== familyMemberId
            );

            // Update Firestore document with the modified list of members
            return updateDoc(familyDocRef, { memberDetails: updatedMemberDetails });
        });
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


    updateAppointment(appointmentId: string, data: any): Promise<void> {
        const appointmentRef = doc(this.firestore, 'appointments', appointmentId);
        return updateDoc(appointmentRef, data);
    }

    getAppointments(): Observable<any[]> {
        const appointmentsRef = collection(this.firestore, 'appointments');

        return from(getDocs(appointmentsRef)).pipe(
            switchMap((snapshot) => {
                const appointments = snapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                    .filter((appointment: any) => {
                        const appointmentDate = new Date(appointment.date); // Convert date string to Date object
                        return appointmentDate > new Date(); // Filter for future appointments
                    });

                // Array of observables to enrich appointments with patient and doctor data
                const appointmentObservables = appointments.map((appointment: any) => {
                    // Check if `patientId` and `doctorId` are stored as strings
                    const patientRef = typeof appointment.patientId === 'string'
                        ? doc(this.firestore, 'patients', appointment.patientId) // Create reference manually
                        : appointment.patientId;
                    const doctorRef = typeof appointment.doctorId === 'string'
                        ? doc(this.firestore, 'staff', appointment.doctorId) // Create reference manually
                        : appointment.doctorId;

                    // Fetch patient and doctor data
                    const patientData = patientRef ? from(getDoc(patientRef)).pipe(map((snap) => snap.exists() ? snap.data() : null)) : of(null);
                    const doctorData = doctorRef ? from(getDoc(doctorRef)).pipe(map((snap) => snap.exists() ? snap.data() : null)) : of(null);

                    // Enrich each appointment with patient and doctor data
                    return forkJoin({
                        patient: patientData,
                        doctor: doctorData,
                        appointment: of(appointment),
                    }).pipe(
                        map(({ patient, doctor, appointment }) => ({
                            ...appointment,
                            patient,
                            doctor,
                        }))
                    );
                });

                // Combine all enriched appointment observables
                return forkJoin(appointmentObservables);
            })
        );
    }

    private getEnrichedAppointments(appointments: any[]): Observable<any[]> {
        const appointmentObservables = appointments.map((appointment: any) => {
            const patientRef = typeof appointment.patientId === 'string'
                ? doc(this.firestore, 'patients', appointment.patientId)
                : appointment.patientId;
            const doctorRef = typeof appointment.doctorId === 'string'
                ? doc(this.firestore, 'staff', appointment.doctorId)
                : appointment.doctorId;

            const patientData = patientRef ? from(getDoc(patientRef)).pipe(map((snap) => snap.exists() ? snap.data() : null)) : of(null);
            const doctorData = doctorRef ? from(getDoc(doctorRef)).pipe(map((snap) => snap.exists() ? snap.data() : null)) : of(null);

            return forkJoin({
                patient: patientData,
                doctor: doctorData,
                appointment: of(appointment),
            }).pipe(
                map(({ patient, doctor, appointment }) => ({
                    ...appointment,
                    patient,
                    doctor,
                }))
            );
        });

        return forkJoin(appointmentObservables);
    }

    getUpcomingAppointments(): Observable<any[]> {
        const appointmentsRef = collection(this.firestore, 'appointments');
        return from(getDocs(appointmentsRef)).pipe(
            switchMap((snapshot) => {
                const appointments = snapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                    .filter((appointment: any) => {
                        const appointmentDate = new Date(appointment.date);
                        return appointment.status === 'Upcoming' && appointmentDate > new Date();
                    });

                return this.getEnrichedAppointments(appointments);
            })
        );
    }

    // 2. Get Past Appointments
    getPastAppointments(): Observable<any[]> {
        const appointmentsRef = collection(this.firestore, 'appointments');
        return from(getDocs(appointmentsRef)).pipe(
            switchMap((snapshot) => {
                const appointments = snapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                    .filter((appointment: any) => {
                        const appointmentDate = new Date(appointment.date);
                        return appointment.status === 'Upcoming' && appointmentDate < new Date();
                    });

                return this.getEnrichedAppointments(appointments);
            })
        );
    }

    // 3. Get Cancelled Appointments
    getCancelledAppointments(): Observable<any[]> {
        const appointmentsRef = collection(this.firestore, 'appointments');
        return from(getDocs(appointmentsRef)).pipe(
            switchMap((snapshot) => {
                const appointments = snapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                    .filter((appointment: any) => appointment.status === 'Cancelled');

                return this.getEnrichedAppointments(appointments);
            })
        );
    }

    // 4. Get Completed Appointments
    getCompletedAppointments(): Observable<any[]> {
        const appointmentsRef = collection(this.firestore, 'appointments');
        return from(getDocs(appointmentsRef)).pipe(
            switchMap((snapshot) => {
                const appointments = snapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                    .filter((appointment: any) => appointment.status === 'Completed');

                return this.getEnrichedAppointments(appointments);
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
        return from(getDocs(appointmentsRef)).pipe(
            switchMap((snapshot) => {
                const appointments = snapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                    .filter((appointment: any) => appointment.status === ClinicStatus.PENDING);

                return this.getEnrichedAppointments(appointments);
            })
        );

        // const appointmentsRef = collection(this.firestore, 'appointments');
        // const q = query(
        //     appointmentsRef,
        //     where('status', '==', ClinicStatus.PENDING),  // Filter for pending appointments
        //     // orderBy('createdAt', 'desc')                 // Sort by createdAt in descending order
        // );

        // return new Observable((observer) => {
        //     getDocs(q).then((snapshot) => {
        //         observer.next(snapshot.docs.map(doc => ({
        //             id: doc.id,
        //             ...doc.data()
        //         })));
        //         observer.complete();
        //     }).catch((error) => observer.error(error));
        // });
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


    createInsurance(data: any): Promise<any> {
        const patientsRef = collection(this.firestore, 'insurance');
        return addDoc(patientsRef, data).then((docRef: DocumentReference) => {
            // Patient object with the ID added
            return { id: docRef.id, ...data }; // ID is added to the patient object
        });
    }

    updateInsurance(appointmentId: string, data: any): Promise<void> {
        const appointmentRef = doc(this.firestore, 'insurance', appointmentId);
        return updateDoc(appointmentRef, data);
    }

    getInsuranceList(): Observable<any[]> {
        const patientsRef = collection(this.firestore, 'insurance');
        return new Observable((observer) => {
            getDocs(patientsRef)
                .then((snapshot) => {
                    const patients = snapshot.docs.map((doc) => ({
                        id: doc.id, // Add document ID here
                        ...doc.data(),
                    }));
                    observer.next(patients);
                    observer.complete();
                })
                .catch((error) => observer.error(error));
        });
    }


    deleteInsurancet(id: string): Promise<void> {
        const appointmentRef = doc(this.firestore, 'insurance/' + id);
        return deleteDoc(appointmentRef);
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

    createAnnouncements(data: any): Promise<any> {
        const patientsRef = collection(this.firestore, 'announcements');
        return addDoc(patientsRef, data).then((docRef: DocumentReference) => {
            // Patient object with the ID added
            return { id: docRef.id, ...data }; // ID is added to the patient object
        });
    }

    updateAnnouncements(appointmentId: string, data: any): Promise<void> {
        const appointmentRef = doc(this.firestore, 'announcements', appointmentId);
        return updateDoc(appointmentRef, data);
    }


    deleteAnnouncements(id: string): Promise<void> {
        const appointmentRef = doc(this.firestore, 'announcements/' + id);
        return deleteDoc(appointmentRef);
    }

    getPromotion(): Observable<any[]> {
        const announcementsRef = collection(this.firestore, 'promotion');
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

    createPromotion(data: any): Promise<any> {
        const patientsRef = collection(this.firestore, 'promotion');
        return addDoc(patientsRef, data).then((docRef: DocumentReference) => {
            // Patient object with the ID added
            return { id: docRef.id, ...data }; // ID is added to the patient object
        });
    }

    updatePromotion(appointmentId: string, data: any): Promise<void> {
        const appointmentRef = doc(this.firestore, 'promotion', appointmentId);
        return updateDoc(appointmentRef, data);
    }


    deletePromotion(id: string): Promise<void> {
        const appointmentRef = doc(this.firestore, 'promotion/' + id);
        return deleteDoc(appointmentRef);
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

    updateClinicOperatingHours(data): Promise<void> {
        // Reference to the specific document in Firestore
        const docRef = doc(this.firestore, 'clinic/virtualOperatingHours');
        // Use setDoc to either create or update the document
        return setDoc(docRef, data, { merge: true });
    }

    // Services CRUD
    addService(data: Service): Promise<DocumentReference<Service>> {
        const servicesRef = collection(this.firestore, 'services') as CollectionReference<Service>;;
        // Add default values if needed, e.g., isActive
        const dataToAdd = { ...data, isActive: data.isActive !== undefined ? data.isActive : true };
        return addDoc(servicesRef, dataToAdd);
    }

    updateService(id: string, data: Partial<Service>): Promise<void> {
        const serviceRef = doc(this.firestore, 'services/' + id);
        return updateDoc(serviceRef, data);
    }

    deleteService(id: string): Promise<void> {
        // Consider soft delete (setting isActive to false) instead of hard delete
        // return this.updateService(id, { isActive: false });
        const serviceRef = doc(this.firestore, 'services/' + id);
        return deleteDoc(serviceRef);
    }

    getServices(): Observable<Service[]> {
        const servicesRef = collection(this.firestore, 'services');
        // Optionally add query, e.g., where('isActive', '==', true)
        const servicesQuery = query(servicesRef, orderBy('name')); // Order by name for consistency
        return from(getDocs(servicesQuery)).pipe(
            map((snapshot) => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)))
        );
    }
    // End Services CRUD
}
