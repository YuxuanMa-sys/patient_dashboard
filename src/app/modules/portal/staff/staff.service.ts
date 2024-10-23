import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment as env } from 'environments/environment';
@Injectable({ providedIn: 'root' })
export class StaffService {
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    private _contact: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _booking: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _bookings: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _request: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any> {
        return this._data.asObservable();
    }

    /**
 * Getter for contact
 */
    get contact$(): Observable<any> {
        return this._contact.asObservable();
    }

    /**
     * Getter for contacts
     */
    get contacts$(): Observable<any[]> {
        return this._contacts.asObservable();
    }
    get requests$(): Observable<any[]> {
        return this._request.asObservable();
    }

    get bookings$(): Observable<any[]> {
        return this._bookings.asObservable();
    }
    get booking$(): Observable<any[]> {
        return this._booking.asObservable();
    }

    /**
 * Get contacts
 */
    getAll(id): Observable<any[]> {
        return this._httpClient.get<any[]>(`${env.apiUrl}doctor/doctor_datas/${id}/patients`).pipe(
            // eslint-disable-next-line @typescript-eslint/no-shadow
            tap((contacts) => {
                this._contacts.next(contacts);
            })
        );
    }

    getPatientRequesst(doctor, id: any): Observable<any> {
        return this._httpClient.get(`${env.apiUrl}doctor/doctor_datas/${doctor}/patient/${id}/patient_requests`).pipe(
            // eslint-disable-next-line @typescript-eslint/no-shadow
            tap((contacts) => {
                this._request.next(contacts);
            })
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getById(id: any): Observable<any> {
        return this._httpClient.get(`${env.apiUrl}doctor/doctor_datas/patients/${id}`).pipe(
            tap((res) => {
                this._contact.next(res);
            })
        );
    }

    getAppointmentRecordsById(id: any): Observable<any> {
        return this._httpClient.get(`${env.apiUrl}doctor/bookings/patient/${id}/appointments`).pipe(
            tap((res) => {
                this._bookings.next(res);
            })
        );
    }

    getAppointmentDetailsById(id: any): Observable<any> {
        return this._httpClient.get(`${env.apiUrl}doctor/bookings/single/${id}`).pipe(
            tap((res) => {
                this._booking.next(res);
            })
        );
    }

    /**
     * Search contacts with given query
     *
     * @param query
     */
    search(query: string): Observable<any[]> {
        return this._httpClient.post<any[]>(`${env.apiUrl}categories/search`, {
            query
        }).pipe(
            // eslint-disable-next-line @typescript-eslint/no-shadow
            tap((contacts) => {
                this._contacts.next(contacts['data']);
            })
        );
    }

    /**
     * Get contact by id
     */
    getSingleById(id: string): Observable<any> {
        return this._contacts.pipe(
            take(1),
            // eslint-disable-next-line @typescript-eslint/no-shadow
            map((contacts) => {
                console.log(contacts);
                console.log(id);

                // Find the contact
                // eslint-disable-next-line eqeqeq
                const contact = contacts.find(item => item.id == id) || null;
                console.log(contact);

                // Update the contact
                this._contact.next(contact);

                // Return the contact
                return contact;
            }),
            switchMap((contact) => {

                if (!contact) {
                    return throwError('Could not found contact with id of ' + id + '!');
                }

                return of(contact);
            })
        );
    }


}
