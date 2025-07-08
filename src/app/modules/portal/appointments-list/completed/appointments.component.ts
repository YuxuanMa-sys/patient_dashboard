import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import { environment } from 'environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { ApexOptions, ChartComponent } from 'ng-apexcharts';

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
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
    selector: 'app-completed-appointments',
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
    @ViewChild(MatSort) sort: MatSort;
    
    appConfig: any;
    btcOptions: ApexOptions = {};
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    products$: Observable<any[]>;
    readonly avatar: string = environment.cloudFront + 'public/users/profile/';
    readonly url: string = environment.assets + 'utitlity/';
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    displayedColumns: string[] = ['name', 'date', 'type', 'for', 'doctor', 'issue_seeking', 'status', 'action'];
    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    data: any[] = [];
    today: any;
    upcoming: any;
    clinics: any[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    allClinics: any[];
    appointments: any[];
    sortedData: any[];

    loading: boolean = true;
    
    // Form properties
    changeAppointmentForm: FormGroup;
    
    // Modal properties
    showDetailsModal: boolean = false;
    selectedAppointment: any = null;
    
    // Sorting properties
    currentSortField: string = '';
    currentSortDirection: 'asc' | 'desc' = 'asc';
    
    // Image loading state management
    imageLoadingStates: Map<string, boolean> = new Map();

    // Sample data for completed appointments
    sampleCompletedAppointments = [
        {
            id: 1,
            patient: { id: 'pat_8', fname: 'Emma', lname: 'Watson', profilePictureUrl: 'images/avatars/female-04.jpg' },
            doctor: { name: 'Dr. Jamie Garcia' },
            appointmentType: 'General Checkup',
            status: 'Completed',
            appointmentFor: 'Teledentistry',
            date: new Date('2021-06-30'),
            selectedSlot: '09:00 AM',
            appointmentReason: 'Routine dental examination - completed successfully'
        },
        {
            id: 2,
            patient: { id: 'pat_9', fname: 'John', lname: 'Smith', profilePictureUrl: 'images/avatars/male-05.jpg' },
            doctor: { name: 'Dr. Olivia Wilde' },
            appointmentType: 'Cavity Fillings',
            status: 'Completed',
            appointmentFor: 'In-Person',
            date: new Date('2021-06-29'),
            selectedSlot: '02:00 PM',
            appointmentReason: 'Cavity treatment - completed successfully'
        },
        {
            id: 3,
            patient: { id: 'pat_10', fname: 'Lisa', lname: 'Anderson', profilePictureUrl: 'images/avatars/female-05.jpg' },
            doctor: { name: 'Dr. Anderson Phillips' },
            appointmentType: 'Consultation',
            status: 'Completed',
            appointmentFor: 'Teledentistry',
            date: new Date('2021-06-28'),
            selectedSlot: '11:00 AM',
            appointmentReason: 'Dental consultation - completed successfully'
        }
    ];

    /**
     * Constructor
     */
    constructor(
        private _matDialog: MatDialog,
        private route: ActivatedRoute,
        private _portalService: PortalService,
        private cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {
        this.getAppointments();
        this.initializeTable();
    }

    getAppointments(): void {
        this.loading = true;
        
        // Filter sample data to show only completed appointments
        this.appointments = this.sampleCompletedAppointments.filter(app => app.status === 'Completed');
        this.dataSource.data = this.appointments;
        this.loading = false;
        this.initializeImageLoadingStates();
        this.cdr.detectChanges();
        console.log('Completed appointments loaded:', this.appointments);
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
        if (this.sort) {
            this.dataSource.sort = this.sort;
        }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    /**
   * On destroy
   */
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private initializeTable(): void {
        this.dataSource = new MatTableDataSource(this.appointments);
        if (this.sort) {
            this.dataSource.sort = this.sort;
        }
    }

    // Image loading state management
    initializeImageLoadingStates(): void {
        this.appointments.forEach(appointment => {
            if (appointment.patient && appointment.patient.id) {
                this.imageLoadingStates.set(appointment.patient.id, true);
            }
        });
    }
    
    isImageLoading(patientId: string): boolean {
        return this.imageLoadingStates.get(patientId) || false;
    }
    
    onImageLoad(patientId: string): void {
        this.imageLoadingStates.set(patientId, false);
        this.cdr.detectChanges();
    }
    
    onImageError(patientId: string): void {
        this.imageLoadingStates.set(patientId, false);
        this.cdr.detectChanges();
    }

    // Modal methods
    openAppointmentDetails(appointment: any): void {
        this.selectedAppointment = appointment;
        this.showDetailsModal = true;
    }

    closeDetailsModal(): void {
        this.showDetailsModal = false;
        this.selectedAppointment = null;
    }

    // Patient helper methods
    getPatientAvatar(patient: any): string {
        if (patient?.profilePictureUrl) {
            return patient.profilePictureUrl;
        }
        
        // Use different default avatars based on gender or patient ID
        const defaultAvatars = [
            'images/avatars/male-01.jpg',
            'images/avatars/female-01.jpg',
            'images/avatars/male-02.jpg',
            'images/avatars/female-02.jpg',
            'images/avatars/male-03.jpg',
            'images/avatars/female-03.jpg'
        ];
        
        // Use patient ID to consistently assign the same default avatar
        const index = patient?.id ? patient.id.length % defaultAvatars.length : 0;
        return defaultAvatars[index];
    }

    getPatientFullName(patient: any): string {
        if (!patient) return 'Unknown Patient';
        
        const firstName = patient.fname || patient.firstName || '';
        const lastName = patient.lname || patient.lastName || '';
        
        return `${firstName} ${lastName}`.trim() || 'Unknown Patient';
    }

    // Sorting methods
    sortBy(field: string): void {
        if (this.currentSortField === field) {
            // Toggle direction if clicking the same field
            this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // Set new field and default to ascending
            this.currentSortField = field;
            this.currentSortDirection = 'asc';
        }

        this.sortAppointments();
    }

    private sortAppointments(): void {
        this.appointments.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (this.currentSortField) {
                case 'patientName':
                    aValue = this.getPatientFullName(a.patient).toLowerCase();
                    bValue = this.getPatientFullName(b.patient).toLowerCase();
                    break;
                case 'appointmentType':
                    aValue = a.appointmentType?.toLowerCase() || '';
                    bValue = b.appointmentType?.toLowerCase() || '';
                    break;
                case 'status':
                    aValue = a.status?.toLowerCase() || '';
                    bValue = b.status?.toLowerCase() || '';
                    break;
                case 'category':
                    aValue = (a.appointmentFor || 'Teledentistry').toLowerCase();
                    bValue = (b.appointmentFor || 'Teledentistry').toLowerCase();
                    break;
                case 'doctorName':
                    aValue = a.doctor?.name?.toLowerCase() || '';
                    bValue = b.doctor?.name?.toLowerCase() || '';
                    break;
                case 'date':
                    aValue = new Date(a.date).getTime();
                    bValue = new Date(b.date).getTime();
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) {
                return this.currentSortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return this.currentSortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
}
