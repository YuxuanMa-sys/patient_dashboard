import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment as env } from 'environments/environment';
@Injectable({ providedIn: 'root' })
export class AppointmentsService {
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    private _contact: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

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
  }
