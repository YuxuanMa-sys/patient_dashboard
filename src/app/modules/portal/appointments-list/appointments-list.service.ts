import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment as env } from 'environments/environment';
@Injectable({ providedIn: 'root' })
export class AppointmentsListService {
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    private _contact: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _upcoming: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _past: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _today: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _cancelled: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

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

    get upcoming$(): Observable<any> {
        return this._upcoming.asObservable();
    }

    get past$(): Observable<any> {
        return this._past.asObservable();
    }

    get cancelled$(): Observable<any> {
        return this._cancelled.asObservable();
    }

    get today$(): Observable<any> {
        return this._today.asObservable();
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getData(): Observable<any> {
        return this._httpClient.get('api/dashboards/finance').pipe(
            tap((response: any) => {
                this._data.next(response);
            }),
        );
    }

    upcoming(): Observable<any[]> {
        return this._httpClient.get<any[]>(`${env.apiUrl}doctor/bookings/upcoming-appointments`).pipe(
            // eslint-disable-next-line @typescript-eslint/no-shadow
            tap((contacts) => {
                this._upcoming.next(contacts);
            })
        );
    }


    past(): Observable<any[]> {
        return this._httpClient.get<any[]>(`${env.apiUrl}doctor/bookings/past-appointments`).pipe(
            // eslint-disable-next-line @typescript-eslint/no-shadow
            tap((contacts) => {
                this._past.next(contacts);
            })
        );
    }


    today(): Observable<any[]> {
        return this._httpClient.get<any[]>(`${env.apiUrl}doctor/bookings/today-appointments`).pipe(
            // eslint-disable-next-line @typescript-eslint/no-shadow
            tap((contacts) => {
                this._today.next(contacts);
            })
        );
    }


    cancelled(): Observable<any[]> {
        return this._httpClient.get<any[]>(`${env.apiUrl}doctor/bookings/cancelled-appointments`).pipe(
            // eslint-disable-next-line @typescript-eslint/no-shadow
            tap((contacts) => {
                this._cancelled.next(contacts);
            })
        );
    }

    /**
 * Get contacts
 */
    getAll(): Observable<any[]> {
        return this._httpClient.get<any[]>(`${env.apiUrl}categories`).pipe(
            // eslint-disable-next-line @typescript-eslint/no-shadow
            tap((contacts) => {
                this._contacts.next(contacts['data']);
            })
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getById(id: any): Observable<any> {
        return this._httpClient.get(`${env.apiUrl}patients/${id}`).pipe(
            tap((res) => {
                this._contact.next(res);
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

    /**
 * Update contact
 *
 * @param id
 * @param contact
 */
    updateContact(id: string, contact: any): Observable<any> {
        return this.contacts$.pipe(
            take(1),
            // eslint-disable-next-line @typescript-eslint/no-shadow
            switchMap(contacts => this._httpClient.put<any>(`${env.apiUrl}patients/${id}`, contact).pipe(
                map((updatedContact) => {
                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.id === id);
                    // Update the contact
                    contacts[index] = updatedContact;
                    // Update the contacts
                    this._contacts.next(contacts);
                    // Return the updated contact
                    return updatedContact;
                }),
                switchMap(updatedContact => this.contact$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._contact.next(updatedContact);

                        // Return the updated contact
                        return updatedContact;
                    })
                ))
            ))
        );
    }
}
