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
} from '@angular/fire/firestore';
import { NotificationService } from './notification.service';
import { HttpClient } from '@angular/common/http';
import { forkJoin, from, map, Observable, of, switchMap } from 'rxjs';
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
        private _httpClient: HttpClient
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

    updatePatient(id: string, data: any): Promise<any> {
        return this.updatePatientInAuth(data, id).toPromise();
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

    getAlongWithPendingAppointments(): Observable<DocumentSnapshot<unknown>[]> {
        const appointmentsRef = collection(this.firestore, 'appointments');
        const q = query(
            appointmentsRef,
            where('status', '==', ClinicStatus.PENDING), // Filter for pending appointments
            orderBy('createdAt', 'desc') // Sort by createdAt in descending order
        );

        return new Observable((observer) => {
            getDocs(q).then((snapshot) => {
                observer.next(snapshot.docs.map(doc => doc.data() as DocumentSnapshot<unknown>));
                observer.complete();
            }).catch((error) => observer.error(error));
        });
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

    // Announcements
    addAnnouncement(data): Promise<DocumentReference<unknown>> {
        const announcementsRef = collection(this.firestore, 'announcements');
        return addDoc(announcementsRef, data);
    }

    updateAnnouncement(id: string, data: any): Promise<void> {
        const announcementRef = doc(this.firestore, 'announcements/' + id);
        return updateDoc(announcementRef, data);
    }

    getAnnouncements(): Observable<DocumentSnapshot<unknown>[]> {
        const announcementsRef = collection(this.firestore, 'announcements');
        return new Observable((observer) => {
            getDocs(announcementsRef).then((snapshot) => {
                observer.next(snapshot.docs.map(doc => doc.data() as DocumentSnapshot<unknown>));
                observer.complete();
            }).catch(error => observer.error(error));
        });
    }

    deleteAnnouncement(id: string): Promise<void> {
        const announcementRef = doc(this.firestore, 'announcements/' + id);
        return deleteDoc(announcementRef);
    }

    // Notifications
    getNotifications(): Observable<DocumentSnapshot<unknown>> {
        const notificationsRef = doc(this.firestore, 'notifications/ClinicAll');
        return new Observable((observer) => {
            getDoc(notificationsRef).then((snapshot) => {
                if (snapshot.exists()) {
                    observer.next(snapshot.data() as DocumentSnapshot<unknown>);
                } else {
                    observer.error('No such document!');
                }
                observer.complete();
            }).catch(error => observer.error(error));
        });
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
