import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import { environment } from 'environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { ApexOptions, ChartComponent } from 'ng-apexcharts';
import { AppointmentsListService } from '../appointments-list.service';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { PortalService } from 'app/modules/portal/portal.service';
import { ClinicStatus } from 'app/_enums/clinicStatus.enum';
import { DocumentReference, getDoc } from 'firebase/firestore';
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
    @ViewChild(MatSort) sort: MatSort;
    
    // Remove Input properties - now using service
    searchQuery: string = '';
    dateFilter: Date | null = null;
    doctorFilter: string = '';
    appointmentTypeFilter: string = '';
    
    appConfig: any;
    btcOptions: ApexOptions = {};
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    products$: Observable<any[]>;
    readonly avatar: string = environment.cloudFront + 'public/users/profile/';
    readonly url: string = environment.assets + 'utitlity/';
    
    // Table properties
    displayedColumns: string[] = ['patientName', 'appointmentType', 'appointmentStatus', 'category', 'doctorName', 'date', 'actions'];
    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    
    // Data properties
    appointments: any[] = [];
    filteredAppointments: any[] = [];
    loading: boolean = true;
    
    // Modal properties
    showDetailsModal: boolean = false;
    showChangeModal: boolean = false;
    selectedAppointment: any = null;
    
    // Form properties
    changeAppointmentForm: FormGroup;
    
    // Sample data for enhanced appointments
    sampleAppointments = [
        {
            id: 1,
            patient: { id: 'pat_1', fname: 'Tony', lname: 'Lanister', profilePictureUrl: 'images/avatars/male-01.jpg' },
            doctor: { name: 'Dr. Jamie Garcia' },
            appointmentType: 'General Checkup',
            status: 'Active',
            appointmentFor: 'Teledentistry',
            date: new Date('2021-07-03'),
            selectedSlot: '08:00 AM',
            appointmentReason: 'Routine dental examination'
        },
        {
            id: 2,
            patient: { id: 'pat_2', fname: 'Ammy', lname: 'Anderson', profilePictureUrl: 'images/avatars/female-01.jpg' },
            doctor: { name: 'Dr. Olivia Wilde' },
            appointmentType: 'Cavity Fillings',
            status: 'Active',
            appointmentFor: 'In-Person',
            date: new Date('2021-07-03'),
            selectedSlot: '09:00 AM',
            appointmentReason: 'Tooth pain and cavity treatment'
        },
        {
            id: 3,
            patient: { id: 'pat_3', fname: 'James', lname: 'May', profilePictureUrl: 'images/avatars/male-02.jpg' },
            doctor: { name: 'Dr. Anderson Phillips' },
            appointmentType: 'Cavity Fillings',
            status: 'Active',
            appointmentFor: 'Teledentistry',
            date: new Date('2021-07-03'),
            selectedSlot: '10:00 AM',
            appointmentReason: 'Follow-up cavity treatment'
        },
        {
            id: 4,
            patient: { id: 'pat_4', fname: 'Sebastian', lname: 'Olivera', profilePictureUrl: 'images/avatars/male-03.jpg' },
            doctor: { name: 'Dr. Maddison May' },
            appointmentType: 'General Checkup',
            status: 'Cancelled',
            appointmentFor: 'Teledentistry',
            date: new Date('2021-07-03'),
            selectedSlot: '11:00 AM',
            appointmentReason: 'Routine checkup'
        },
        {
            id: 5,
            patient: { id: 'pat_5', fname: 'Kendra', lname: 'Rush', profilePictureUrl: 'images/avatars/female-02.jpg' },
            doctor: { name: 'Dr. Martin Odegaard' },
            appointmentType: 'Cavity Fillings',
            status: 'Active',
            appointmentFor: 'In-Person',
            date: new Date('2021-07-03'),
            selectedSlot: '12:00 PM',
            appointmentReason: 'Cavity treatment and cleaning'
        }
    ];
    
    // Sorting properties
    currentSortField: string = '';
    currentSortDirection: 'asc' | 'desc' = 'asc';
    
    // Image loading state management
    imageLoadingStates: Map<string, boolean> = new Map();
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _matDialog: MatDialog,
        private _appointmentsListService: AppointmentsListService,
        private route: ActivatedRoute,
        private _portalService: PortalService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.initializeForms();
    }

    ngOnInit(): void {
        // Set up filter subscription first
        this.subscribeToFilters();
        // Then load appointments
        this.getAppointments();
        this.initializeTable();
    }

    ngAfterViewInit(): void {
        if (this.sort) {
            this.dataSource.sort = this.sort;
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private initializeForms(): void {
        this.changeAppointmentForm = this.fb.group({
            category: ['Virtual', Validators.required],
            rescheduleMessage: ['Lorem ipsum dolor sit amet del partidos de algao fil madr filhaail mje bilkul nhi pta']
        });
    }

    private initializeTable(): void {
        this.dataSource = new MatTableDataSource(this.appointments);
        if (this.sort) {
            this.dataSource.sort = this.sort;
        }
    }

    getAppointments(): void {
        this.loading = true;
        
        // For now, let's just use sample data to show the table working
        // You can uncomment the service call later when real data is available
        this.appointments = this.sampleAppointments;
        this.filteredAppointments = [...this.appointments]; // Initialize filtered appointments
        this.filterAppointments(); // Apply any existing filters
        this.loading = false;
        this.initializeImageLoadingStates();
        this.cdr.detectChanges();
        console.log('Appointments loaded:', this.appointments);
        
        // Commented out for now - uncomment when real service is available
        /*
        this._portalService.getUpcomingAppointments().subscribe({
            next: (appointments) => {
                this.appointments = appointments;
                this.filteredAppointments = [...this.appointments];
                this.filterAppointments();
                this.loading = false;
                this.initializeImageLoadingStates();
                this.cdr.detectChanges();
                console.log('Appointments loaded:', this.appointments);
            },
            error: (err) => {
                console.error('Error fetching appointments:', err);
                // Fall back to sample data on error
                this.appointments = this.sampleAppointments;
                this.filteredAppointments = [...this.appointments];
                this.filterAppointments();
                this.loading = false;
                this.initializeImageLoadingStates();
                this.cdr.detectChanges();
            }
        });
        */
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

    openChangeModal(): void {
        if (this.selectedAppointment) {
            this.showChangeModal = true;
            this.changeAppointmentForm.patchValue({
                category: this.selectedAppointment.appointmentFor || 'Virtual'
            });
        }
    }

    closeChangeModal(): void {
        this.showChangeModal = false;
        this.changeAppointmentForm.reset();
        this.initializeForms();
    }

    onChangeAppointment(): void {
        if (this.changeAppointmentForm.valid) {
            const changes = this.changeAppointmentForm.value;
            console.log('Changing appointment:', changes);
            
            // Here you would typically call a service to update the appointment
            this.closeChangeModal();
            this.closeDetailsModal();
            
            // Show success message
            alert('Appointment updated successfully!');
        }
    }

    // Legacy methods for compatibility
    sortData(sort: Sort): void {
        const data = this.appointments.slice();
        if (!sort.active || sort.direction === '') {
            this.dataSource.data = data;
            return;
        }

        this.dataSource.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'patientName': 
                    return this.compare(a.patient?.fname + ' ' + a.patient?.lname, b.patient?.fname + ' ' + b.patient?.lname, isAsc);
                case 'appointmentType': 
                    return this.compare(a.appointmentType, b.appointmentType, isAsc);
                case 'appointmentStatus': 
                    return this.compare(a.status, b.status, isAsc);
                case 'category': 
                    return this.compare(a.appointmentFor, b.appointmentFor, isAsc);
                case 'doctorName': 
                    return this.compare(a.doctor?.name, b.doctor?.name, isAsc);
                case 'date': 
                    return this.compareDate(a, b, isAsc);
                default: 
                    return 0;
            }
        });
    }

    private compareDate(a: any, b: any, isAsc: boolean): number {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        
        const aTime = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
        const bTime = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
        
        return isAsc ? aTime - bTime : bTime - aTime;
    }

    private compare(a: number | string, b: number | string, isAsc: boolean): number {
        if (!a && !b) return 0;
        if (!a) return 1;
        if (!b) return -1;
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    // Legacy dialog methods for backward compatibility
    openApptDetailDialog(data: any): void {
        this.openAppointmentDetails(data);
    }

    createAppointment(data: any): void {
        // This would open the create appointment modal
        console.log('Create appointment:', data);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
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

    // Filtering methods
    filterAppointments(): void {
        if (!this.appointments || this.appointments.length === 0) {
            return;
        }
        
        this.filteredAppointments = this.appointments.filter(appointment => {
            const matchesSearch = this.searchQuery ? this.getPatientFullName(appointment.patient).toLowerCase().includes(this.searchQuery.toLowerCase()) : true;
            const matchesDate = this.dateFilter ? this.isSameDay(new Date(appointment.date), this.dateFilter) : true;
            const matchesDoctor = this.doctorFilter ? appointment.doctor?.name?.toLowerCase().includes(this.doctorFilter.toLowerCase()) : true;
            const matchesType = this.appointmentTypeFilter ? appointment.appointmentType?.toLowerCase().includes(this.appointmentTypeFilter.toLowerCase()) : true;
            return matchesSearch && matchesDate && matchesDoctor && matchesType;
        });
        
        this.dataSource.data = this.filteredAppointments;
        this.cdr.detectChanges();
    }

    private isSameDay(date1: Date, date2: Date): boolean {
        return date1.toDateString() === date2.toDateString();
    }

    private subscribeToFilters(): void {
        this._appointmentsListService.filters$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(filters => {
                this.searchQuery = filters.searchQuery;
                this.dateFilter = filters.dateFilter;
                this.doctorFilter = filters.doctorFilter;
                this.appointmentTypeFilter = filters.appointmentTypeFilter;
                this.filterAppointments();
            });
    }
}
