import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, Inject } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import moment from 'moment';
import { environment } from 'environments/environment';

import { FormGroup } from '@angular/forms';
import { ClinicStatus } from 'app/_enums/clinicStatus.enum';
import { AppointmentDetailModalComponent } from 'app/modules/landing/common/appointment-detail/appointment-detail.component';
import { cloneDeep } from 'lodash';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentReference, getDoc } from 'firebase/firestore';
import { AppointmentRequestDetailModalComponent } from '../appointment-request-detail-modal/appointment-request-detail-modal.component';
import { ActivatedRoute } from '@angular/router';
import { RequestsService, RequestFilters } from '../requests.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly avatar: string = environment.cloudFront + 'public/users/profile/';
  readonly url: string = environment.assets + 'utitlity/';
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Filter and search properties
  currentFilters: RequestFilters = {
    searchQuery: '',
    dateFilter: null,
    doctorFilter: '',
    appointmentTypeFilter: ''
  };
  currentStatus: string = 'active';
  
  // Data properties
  appointments: any[] = [];
  filteredRequests: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  // Mock data for demonstration
  mockAppointmentRequests = [
    {
      id: 1,
      patient: {
        name: 'Tony Lanister',
        avatar: 'assets/images/avatars/male-01.jpg'
      },
      appointmentType: 'Virtual',
      reasonForVisit: 'Routine dental examination and cleaning',
      requestDate: new Date('2024-07-04T08:43:00'),
      firstPreference: new Date('2024-07-05T10:00:00'),
      secondPreference: new Date('2024-07-05T14:00:00'),
      thirdPreference: new Date('2024-07-06T09:00:00'),
      notes: 'Patient prefers morning appointments due to work schedule',
      status: 'Pending'
    },
    {
      id: 2,
      patient: {
        name: 'Ammy Anderson',
        avatar: 'assets/images/avatars/female-01.jpg'
      },
      appointmentType: 'In-Person',
      reasonForVisit: 'Tooth pain and cavity treatment needed',
      requestDate: new Date('2024-07-04T08:43:00'),
      firstPreference: new Date('2024-07-05T11:00:00'),
      secondPreference: new Date('2024-07-05T15:30:00'),
      thirdPreference: new Date('2024-07-06T10:30:00'),
      notes: 'Patient has severe pain on upper left molar',
      status: 'Pending'
    },
    {
      id: 3,
      patient: {
        name: 'James May',
        avatar: 'assets/images/avatars/male-02.jpg'
      },
      appointmentType: 'In-Person',
      reasonForVisit: 'Follow-up appointment for root canal treatment',
      requestDate: new Date('2024-07-04T08:43:00'),
      firstPreference: new Date('2024-07-07T09:00:00'),
      secondPreference: new Date('2024-07-07T13:30:00'),
      thirdPreference: new Date('2024-07-08T08:30:00'),
      notes: 'Continue treatment started last week',
      status: 'Pending'
    },
    {
      id: 4,
      patient: {
        name: 'Sebastian Olivera',
        avatar: 'assets/images/avatars/male-03.jpg'
      },
      appointmentType: 'Virtual',
      reasonForVisit: 'Consultation for teeth whitening options',
      requestDate: new Date('2024-07-04T08:43:00'),
      firstPreference: new Date('2024-07-08T16:00:00'),
      secondPreference: new Date('2024-07-09T10:00:00'),
      thirdPreference: new Date('2024-07-09T14:00:00'),
      notes: 'Patient interested in professional whitening procedures',
      status: 'Pending'
    },
    {
      id: 5,
      patient: {
        name: 'Kendra Rush',
        avatar: 'assets/images/avatars/female-02.jpg'
      },
      appointmentType: 'Virtual',
      reasonForVisit: 'Dental hygiene consultation and advice',
      requestDate: new Date('2024-07-04T08:43:00'),
      firstPreference: new Date('2024-07-09T11:00:00'),
      secondPreference: new Date('2024-07-09T15:00:00'),
      thirdPreference: new Date('2024-07-10T09:30:00'),
      notes: 'First-time patient, needs comprehensive dental assessment',
      status: 'Pending'
    },
    {
      id: 6,
      patient: {
        name: 'Carla Jones',
        avatar: 'assets/images/avatars/female-03.jpg'
      },
      appointmentType: 'In-Person',
      reasonForVisit: 'Emergency dental care - broken tooth',
      requestDate: new Date('2024-07-04T08:43:00'),
      firstPreference: new Date('2024-07-05T08:00:00'),
      secondPreference: new Date('2024-07-05T12:00:00'),
      thirdPreference: new Date('2024-07-05T16:00:00'),
      notes: 'Urgent - tooth broke during eating, experiencing pain',
      status: 'Pending'
    },
    {
      id: 7,
      patient: {
        name: 'Adam Bilal',
        avatar: 'assets/images/avatars/male-04.jpg'
      },
      appointmentType: 'In-Person',
      reasonForVisit: 'Orthodontic consultation for braces',
      requestDate: new Date('2024-07-04T08:43:00'),
      firstPreference: new Date('2024-07-10T10:00:00'),
      secondPreference: new Date('2024-07-10T14:30:00'),
      thirdPreference: new Date('2024-07-11T09:00:00'),
      notes: 'Patient considering orthodontic treatment options',
      status: 'Pending'
    },
    {
      id: 8,
      patient: {
        name: 'Maria Santos',
        avatar: 'assets/images/avatars/female-04.jpg'
      },
      appointmentType: 'Virtual',
      reasonForVisit: 'Post-surgery follow-up consultation',
      requestDate: new Date('2024-07-02T08:43:00'),
      firstPreference: new Date('2024-07-03T13:00:00'),
      secondPreference: new Date('2024-07-03T16:00:00'),
      thirdPreference: new Date('2024-07-04T11:00:00'),
      notes: 'Follow-up after wisdom tooth extraction',
      status: 'Cancelled'
    },
    {
      id: 9,
      patient: {
        name: 'Robert Kim',
        avatar: 'assets/images/avatars/male-05.jpg'
      },
      appointmentType: 'In-Person',
      reasonForVisit: 'Routine cleaning and checkup',
      requestDate: new Date('2024-06-28T08:43:00'),
      firstPreference: new Date('2024-06-30T09:00:00'),
      secondPreference: new Date('2024-06-30T13:00:00'),
      thirdPreference: new Date('2024-07-01T10:00:00'),
      notes: 'Six-month routine dental maintenance',
      status: 'Completed'
    },
    {
      id: 10,
      patient: {
        name: 'Emily Chen',
        avatar: 'assets/images/avatars/female-05.jpg'
      },
      appointmentType: 'Virtual',
      reasonForVisit: 'Dental anxiety consultation',
      requestDate: new Date('2024-06-25T08:43:00'),
      firstPreference: new Date('2024-06-27T14:00:00'),
      secondPreference: new Date('2024-06-27T16:30:00'),
      thirdPreference: new Date('2024-06-28T11:00:00'),
      notes: 'Patient has dental phobia, needs specialized care approach',
      status: 'Completed'
    },
    {
      id: 11,
      patient: {
        name: 'Sarah Williams',
        avatar: 'assets/images/avatars/female-06.jpg'
      },
      appointmentType: 'In-Person',
      reasonForVisit: 'Teeth cleaning and fluoride treatment',
      requestDate: new Date('2024-07-05T09:15:00'),
      firstPreference: new Date('2024-07-08T14:00:00'),
      secondPreference: new Date('2024-07-08T16:30:00'),
      thirdPreference: new Date('2024-07-09T11:00:00'),
      notes: 'Regular patient, prefers afternoon appointments',
      status: 'Pending'
    },
    {
      id: 12,
      patient: {
        name: 'Michael Johnson',
        avatar: 'assets/images/avatars/male-06.jpg'
      },
      appointmentType: 'Virtual',
      reasonForVisit: 'Dental consultation for jaw pain',
      requestDate: new Date('2024-07-03T10:30:00'),
      firstPreference: new Date('2024-07-05T15:00:00'),
      secondPreference: new Date('2024-07-06T10:00:00'),
      thirdPreference: new Date('2024-07-06T14:00:00'),
      notes: 'Experiencing jaw clicking and mild pain',
      status: 'Cancelled'
    },
    {
      id: 13,
      patient: {
        name: 'Lisa Rodriguez',
        avatar: 'assets/images/avatars/female-07.jpg'
      },
      appointmentType: 'In-Person',
      reasonForVisit: 'Crown replacement consultation',
      requestDate: new Date('2024-06-20T14:20:00'),
      firstPreference: new Date('2024-06-25T09:30:00'),
      secondPreference: new Date('2024-06-25T13:00:00'),
      thirdPreference: new Date('2024-06-26T10:00:00'),
      notes: 'Old crown needs replacement, discussed with previous dentist',
      status: 'Completed'
    },
    {
      id: 14,
      patient: {
        name: 'David Lee',
        avatar: 'assets/images/avatars/male-07.jpg'
      },
      appointmentType: 'Virtual',
      reasonForVisit: 'Oral health assessment',
      requestDate: new Date('2024-07-01T16:45:00'),
      firstPreference: new Date('2024-07-04T11:30:00'),
      secondPreference: new Date('2024-07-04T15:00:00'),
      thirdPreference: new Date('2024-07-05T09:00:00'),
      notes: 'New patient, first consultation',
      status: 'Cancelled'
    },
    {
      id: 15,
      patient: {
        name: 'Jennifer Brown',
        avatar: 'assets/images/avatars/female-08.jpg'
      },
      appointmentType: 'In-Person',
      reasonForVisit: 'Wisdom tooth extraction consultation',
      requestDate: new Date('2024-06-15T11:30:00'),
      firstPreference: new Date('2024-06-20T08:00:00'),
      secondPreference: new Date('2024-06-20T14:00:00'),
      thirdPreference: new Date('2024-06-21T10:00:00'),
      notes: 'Wisdom tooth causing discomfort, referred by general dentist',
      status: 'Completed'
    }
  ];

  // Available doctors for assignment
  availableDoctors = [
    { id: 1, name: 'Dr. Jamie Garcia', specialization: 'General Dentistry' },
    { id: 2, name: 'Dr. Olivia Wilde', specialization: 'Orthodontics' },
    { id: 3, name: 'Dr. Anderson Phillips', specialization: 'Oral Surgery' },
    { id: 4, name: 'Dr. Maddison May', specialization: 'Pediatric Dentistry' },
    { id: 5, name: 'Dr. Martin Odegaard', specialization: 'Periodontics' }
  ];

  /**
   * Constructor
   */
  constructor(
    private _matDialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private requestsService: RequestsService
  ) {
  }

  ngOnInit(): void {
    // Just load mock data directly and show it
    this.appointments = this.mockAppointmentRequests;
    this.filteredRequests = this.mockAppointmentRequests;
    this.loading = false;
    
    console.log('Mock data loaded:', this.appointments.length, 'appointments');
    console.log('Filtered requests:', this.filteredRequests.length);
    
    this.cdr.detectChanges();
    
    // Get the status from route data for tab highlighting
    this.route.data.subscribe(data => {
      this.currentStatus = data['status'] || 'active';
      console.log('Current status from route:', this.currentStatus);
      this.filterByStatus();
    });
    
    // Subscribe to filter changes from parent component
    this.requestsService.filters$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(filters => {
        this.currentFilters = filters;
        this.filterByStatus();
      });
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {

  }

  /**
   * Simple filter by status only
   */
  filterByStatus(): void {
    let filtered = [...this.appointments];

    // Map route status to display status
    let targetStatus = this.currentStatus;
    if (this.currentStatus === 'active') {
      targetStatus = 'Pending';
    } else if (this.currentStatus === 'cancelled') {
      targetStatus = 'Cancelled';
    } else if (this.currentStatus === 'completed') {
      targetStatus = 'Completed';
    }

    console.log('Filtering for status:', targetStatus);
    console.log('Total appointments before filter:', filtered.length);

    // Filter by status
    filtered = filtered.filter(request => request.status === targetStatus);
    
    console.log('Appointments after status filter:', filtered.length);

    // Apply search filter if exists
    if (this.currentFilters.searchQuery?.trim()) {
      const query = this.currentFilters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(request => 
        request.patient.name.toLowerCase().includes(query) ||
        request.appointmentType.toLowerCase().includes(query) ||
        request.reasonForVisit?.toLowerCase().includes(query)
      );
      console.log('Appointments after search filter:', filtered.length);
    }

    this.filteredRequests = filtered;
    console.log('Final filtered requests set:', this.filteredRequests.length);
    this.cdr.detectChanges();
  }

  /**
   * Get display status for UI
   */
  getDisplayStatus(): string {
    switch(this.currentStatus) {
      case 'active': return 'active';
      case 'cancelled': return 'cancelled';
      case 'completed': return 'completed';
      default: return this.currentStatus;
    }
  }

  /**
   * Open request details modal
   */
  viewRequestDetails(request: any): void {
    const dialogRef = this._matDialog.open(AppointmentRequestDetailModalComponent, {
      width: '600px',
      data: request
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        console.log('Appointment confirmed');
      } else if (result === false) {
        console.log('Appointment declined');
      }
    });
  }

  /**
   * Track by function for ngFor
   */
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
}
