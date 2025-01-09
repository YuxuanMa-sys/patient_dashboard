import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import { environment } from 'environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { ApexOptions, ChartComponent } from 'ng-apexcharts';
import { AppointmentsListService } from '../appointments-list.service';
import { MatDialog } from '@angular/material/dialog';

import { cloneDeep } from 'lodash';
import { AppointmentDetailModalComponent } from 'app/modules/landing/common/appointment-detail/appointment-detail.component';
import { ActivatedRoute } from '@angular/router';

import { PortalService } from 'app/modules/portal/portal.service';
import { ClinicStatus } from 'app/_enums/clinicStatus.enum';
import { DocumentReference, getDoc } from 'firebase/firestore';
import { AvailabilityModalComponent } from 'app/modules/landing/common/availability/availability.component';
import { TextFieldModule } from '@angular/cdk/text-field';
import { NgFor, NgClass, NgIf, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';



@Component({
    selector: 'app-upcoming-appointments',
    templateUrl: './appointments.component.html',
    styleUrls: ['./appointments.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatTableModule,
        MatInputModule,
        TextFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatDatepickerModule,
        MatSortModule,
        NgFor,
        NgClass,
        NgIf,
        DatePipe
    ],
})
export class AppointmentsComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('btcChartComponent') btcChartComponent: ChartComponent;
    appConfig: any;
    btcOptions: ApexOptions = {};
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    products$: Observable<any[]>;
    readonly avatar: string = environment.cloudFront + 'public/users/profile/';
    readonly url: string = environment.assets + 'utitlity/';
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['name', 'date', 'type', 'for', 'doctor', 'issue_seeking', 'status', 'action'];
    data: any[] = [];
    today: any;
    upcoming: any;
    clinics: any[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    allClinics: any[];
    appointments: any[];
    sortedData: any[];

    loading: boolean = true;
    /**
     * Constructor
     */
    constructor(
        private _matDialog: MatDialog,
        private _appointmentsListService: AppointmentsListService,
        private route: ActivatedRoute,
        private _portalService: PortalService,
        private cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {

        this.getAppointments();

    }

    getAppointments(): void {
        this._portalService.getUpcomingAppointments().subscribe({
            next: (res) => {
                this.appointments = res; // Contains enriched appointments with patient and doctor data
                this.loading = false;
                this.cdr.detectChanges();
                console.log('Enriched Appointments:', this.appointments);
            },
            error: (err) => {
                console.error('Error fetching appointments:', err);
            }
        });
    }



    sortData(sort: Sort) {
        const data = this.appointments.slice();
        if (!sort.active || sort.direction === '') {
            this.sortedData = data;
            return;
        }
        this.sortedData = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'patient_name': return this.compare(a.patient.fname, b.patient.fname, isAsc);
                case 'appointmentType': return this.compare(a.appointmentType, b.appointmentType, isAsc);
                case 'appointmentReason': return this.compare(a.appointmentReason, b.appointmentReason, isAsc);
                case 'status': return this.compare(a.status, b.status, isAsc);
                case 'doctor_name': return this.compare(a.provider.name, b.provider.name, isAsc);
                case 'date': return this.compareDate(a, b, isAsc);
                default: return 0;
            }
        });
    }

    compareDate(a: any, b: any, isAsc: boolean) {
        if (b.date) return 1;
        if (a.date) return -1;
        if (b.date && a.date) return isAsc ? a.date.toDate().getTime() - b.date.toDate().getTime() : b.date.toDate().getTime() - a.date.toDate().getTime();
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }


    openApptDetailDialog(data: any): void {
        const dialogRef = this._matDialog.open(AppointmentDetailModalComponent, {
            autoFocus: false,
            data: cloneDeep(data)
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);

            // Yahan par aap modal se wapas aaya data result mein prapt kar sakte hain.
            // this.form.get('availability_id').setValue(result.availability_id);
            // this.form.get('availability_slot_id').setValue(result.availability_slot_id);
            // this.form.get('dated').setValue(result.dated);
            // this.form.get('start_time').setValue(result.start_time);
            // this.form.get('end_time').setValue(result.end_time);
            // this.form.get('type').setValue(result.type);
        });
    }

    createAppointment(data: any) {

        const dialogRef = this._matDialog.open(AvailabilityModalComponent, {
            autoFocus: false,
            data: cloneDeep(data)
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
        });
    }

    openApptCompleteDialog(data: any): void {
        // const dialogRef = this._matDialog.open(AppointmentCompleteModalComponent, {
        //   autoFocus: false,
        //   data: cloneDeep(data)
        // });

        // dialogRef.afterClosed().subscribe(result => {
        //   console.log(result);

        //   // Yahan par aap modal se wapas aaya data result mein prapt kar sakte hain.
        //   // this.form.get('availability_id').setValue(result.availability_id);
        //   // this.form.get('availability_slot_id').setValue(result.availability_slot_id);
        //   // this.form.get('dated').setValue(result.dated);
        //   // this.form.get('start_time').setValue(result.start_time);
        //   // this.form.get('end_time').setValue(result.end_time);
        //   // this.form.get('type').setValue(result.type);
        // });
    }
    /**
     * After view init
     */
    ngAfterViewInit(): void {

    }


    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    /**
   * On destroy
   */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
