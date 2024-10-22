import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { catchError, debounceTime, map, Observable, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { cloneDeep } from 'lodash';

import { FuseAlertComponent, FuseAlertType } from '@3DexCRM/components/alert';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { PhoneVerifiedModalComponent } from '../phone-verified/phone-verified.component';


@Component({
    selector: 'update-phone',
    templateUrl: './update-phone.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, FormsModule,
        TextFieldModule, NgFor, MatCheckboxModule,
        RouterLink,
        NgClass, MatRippleModule, MatMenuModule, MatDialogModule, AsyncPipe, ReactiveFormsModule,
        FuseAlertComponent,
    ],
})
export class UpdatePhoneModalComponent implements OnInit, OnDestroy, AfterViewInit {
    readonly avatar: string = environment.cloudFront + 'public/users/profile/';
    note$: Observable<any>;
    item: any;
    singleAvailibity: any;
    form: FormGroup;
    showAlert: boolean;
    labels$: Observable<any[]>;
    buttonStatus: boolean;
    formValue = {};
    error: any;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };

    noteChanged: Subject<any> = new Subject<any>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();



    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<UpdatePhoneModalComponent>,

        private router: Router,
        private route: ActivatedRoute,
        private _matDialog: MatDialog,
        private _authService: AuthService,
    ) {
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.item = this.data;
        this.form = this._formBuilder.group({
            phone_no: ['', Validators.required],
        });
        this.form.get('phone_no').setValue(this.item);
    }


    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {

    }


    booknow() {
        this.dialogRef.close(this.formValue);
    }

    submitForm() {
        const value = this.form.value;
        this._authService.updateUserPhone(value).subscribe(
            response => {
                // Handle the API response
                this.alert = {
                    type: 'success',
                    message: response.message,
                };
                // this.dialogRef.close();
                this.showAlert = true;

                this._authService.getUserByToken()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((res) => {
                });

                this._authService.getProfile()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((res) => {
                    this._changeDetectorRef.markForCheck();
                });
                this.dialogRef.close();
                const dialogRef =   this._matDialog.open(PhoneVerifiedModalComponent, {
                    autoFocus: false,
                    data: cloneDeep(this.item)
                });

                
                // Redirect after the countdown
                this._changeDetectorRef.markForCheck();
            },
            error => {
                this.alert = {
                    type: 'error',
                    message: error.error.error,
                };
                this.showAlert = true;
                this._changeDetectorRef.markForCheck();
            }
        );
    }


    // submitForm(): void {
    //     const value = this.form.value;
    //     this._authService.phoneOtpVerify(value).pipe(
    //         map((res) => {
    //             this.dialogRef.close();
    //             this.alert = {
    //                 type: 'success',
    //                 message: res['message'] + '',
    //             };

    //         }),
    //         catchError((error) => {
    //             // const errorMessages = error.error.errors;
    //             const errorMessages = Object.values(error.error.errors);

    //             errorMessages.forEach((messages: []) => {
    //                 messages.forEach((message) => {
    //                     this.error = message;
    //                     this.alert = {
    //                         type: 'error',
    //                         message: message + '',
    //                     };
    //                     this.showAlert = true;
    //                 });
    //                 this._changeDetectorRef.markForCheck();
    //             });

    //             return [];
    //         })
    //     ).subscribe();

    // }


    close() {
        this.dialogRef.close();
    }
    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
