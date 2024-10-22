import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { catchError, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    private _angularFireAuth = inject(Auth);
    private isAuthenticatedValue: boolean = false;


    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // constructor(
    //     private _angularFireAuth: AngularFireAuth,
    // ) {
    // }

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // Call this method on successful login
    login() {
        this.isAuthenticatedValue = true;
    }

    // Call this method on logout
    logout() {
        this.isAuthenticatedValue = false;
    }

    isAuthenticated(): boolean {
        return this.isAuthenticatedValue;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */


    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return from(signInWithEmailAndPassword(this._angularFireAuth, credentials.email, credentials.password)).pipe(
            switchMap((userCredential) => {
                // Extract necessary properties from userCredential
                const user = {
                    id: userCredential.user.uid, // Assuming 'uid' is the unique identifier
                    name: userCredential.user.displayName || 'Anonymous', // Assuming 'displayName' is the name
                    email: userCredential.user.email,
                    avatar: userCredential.user.photoURL,
                    // Add any other properties you need
                };

                // Store the access token in the local storage
                this.accessToken = userCredential.user.refreshToken;
                localStorage.setItem('authenticated', 'true');

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                // localStorage.setItem('user', JSON.stringify(user));
                this._userService.user = JSON.stringify(user);

                // Return a new observable with the user
                return of(user);
            })
        );
    }


    signInOld(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post('api/auth/sign-in', credentials).pipe(
            switchMap((response: any) => {
                // Store the access token in the local storage
                this.accessToken = response.accessToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        const token = this.accessToken;
        if (!token) {
            return of(false);
        }

        console.log('signInUsingToken', token);

        return this._httpClient.post('api/auth/sign-in-with-token', { accessToken: token })
            .pipe(
                catchError((error) => {
                    console.log('Error in signInUsingToken:', error);
                    // Sign out if the token is invalid
                    this.signOut();
                    return of(false);
                }),
                switchMap((response: any) => {
                    if (response.accessToken) {
                        this.accessToken = response.accessToken;
                    }

                    this._authenticated = true;
                    this._userService.user = response.user;

                    return of(true);
                })
            );
    }



    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */


    check(): Observable<boolean> {
        const isAuthenticated = localStorage.getItem('authenticated') === 'true';
        if (isAuthenticated) {
            this._authenticated = true; // Set local state if stored state is true
            return of(true);
        }
        const token = this.accessToken;
        if (!token) {
            return of(false);
        }
        if (AuthUtils.isTokenExpired(token)) {
            // this.signOut(); // Sign out if the token is expired
            return of(false);
        }
        return this.signInUsingToken(); // Attempt to sign in using the stored token
    }


    // check(): Observable<boolean> {
    //     // Check if the user is logged in
    //     console.log('check 1');
    //     if (this._authenticated) {
    //         return of(true);
    //     }
    //     console.log('check 2');
    //     // Check the access token availability
    //     if (!this.accessToken) {
    //         return of(false);
    //     }

    //     console.log('check 3');
    //     // Check the access token expire date
    //     if (AuthUtils.isTokenExpired(this.accessToken)) {
    //         return of(false);
    //     }

    //     console.log('check 4');
    //     // If the access token exists, and it didn't expire, sign in using it
    //     return this.signInUsingToken();
    // }
}
