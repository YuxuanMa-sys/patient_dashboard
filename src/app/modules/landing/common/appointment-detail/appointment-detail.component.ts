import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { debounceTime, map, Observable, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { environment } from 'environments/environment';
import { FuseAlertType } from '@fuse/components/alert';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PortalService } from 'app/modules/portal/portal.service';

@Component({
    selector: 'appointment-detail',
    templateUrl: './appointment-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatButtonModule, MatIconModule, FormsModule,
        TextFieldModule, NgFor, MatCheckboxModule,
        RouterLink,
        NgClass, MatRippleModule, MatMenuModule, MatDialogModule, AsyncPipe, DatePipe,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
})
export class AppointmentDetailModalComponent implements OnInit, OnDestroy, AfterViewInit {
    note$: Observable<any>;
    single: any;
    readonly url: string = environment.assets + 'utitlity/';
    readonly avatar: string = environment.cloudFront + 'public/users/profile/';
    readonly attachment: string = environment.cloudFront + 'public/patient/attachment/';
    singleAvailibity: any;
    dashboard: any;
    labels$: Observable<any[]>;
    buttonStatus: boolean;
    formValue = {};
    form: FormGroup;
    formConvert: FormGroup;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    showAlert: boolean;
    noteChanged: Subject<any> = new Subject<any>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();



    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<AppointmentDetailModalComponent>,
        private _formBuilder: FormBuilder,
        private _portalService: PortalService
    ) {
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.single = this.data;
        console.log(this.single);

        this.form = this._formBuilder.group({
            notes: [''],
            status: ['Completed'],
        });

        this.formConvert = this._formBuilder.group({
            status: ['Upcoming'],
        });

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

    getAge(dob: any): number | null {
        if (!dob || !dob.seconds) {
            return null; // Return null if dob is not provided or invalid
        }

        // Convert seconds to milliseconds
        const birthDate = new Date(dob.seconds * 1000);

        // Calculate age
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        // Adjust age if the current month/day is before the birth month/day
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    save(): void {

        if (this.form.valid) {
            const updatedData = this.form.value;
            const appointmentId = this.single.id;

            this._portalService.updateAppointment(appointmentId, updatedData)
              .then(() => {
                this.alert = {
                    type: 'success',
                    message: 'Appointment updated successfully',
                };
                this.dialogRef.close();
                console.log('Appointment updated successfully');
              })
              .catch((error) => {
                console.error('Error updating appointment:', error);
              });
          }
    }


    convertAppointmnet(): void {

        if (this.form.valid) {
            const updatedData = this.formConvert.value;
            const appointmentId = this.single.id;

            this._portalService.updateAppointment(appointmentId, updatedData)
              .then(() => {
                this.alert = {
                    type: 'success',
                    message: 'Appointment updated successfully',
                };
                this.dialogRef.close();
                console.log('Appointment updated successfully');
              })
              .catch((error) => {
                console.error('Error updating appointment:', error);
              });
          }
    }


    booknow() {
        this.dialogRef.close(this.formValue);
    }



    close() {
        if (this.form.valid) {
            const updatedData = this.form.value;
            const appointmentId = this.single.id;
            updatedData.status = 'Cancelled';

            this._portalService.updateAppointment(appointmentId, updatedData)
              .then(() => {
                this.alert = {
                    type: 'success',
                    message: 'Appointment updated successfully',
                };
                this.dialogRef.close();
                console.log('Appointment updated successfully');
              })
              .catch((error) => {
                console.error('Error updating appointment:', error);
              });
          }
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
