import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, Inject } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import moment from 'moment';
import { environment } from 'environments/environment';
import { PortalService } from '../../portal.service';
import { FormGroup } from '@angular/forms';
import { ClinicStatus } from 'app/_enums/clinicStatus.enum';
import { AppointmentDetailModalComponent } from 'app/modules/landing/common/appointment-detail/appointment-detail.component';
import { cloneDeep } from 'lodash';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentReference, getDoc } from 'firebase/firestore';
import { AppointmentRequestDetailModalComponent } from '../appointment-request-detail-modal/appointment-request-detail-modal.component';

@Component({
  selector: 'app-requests-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly avatar: string = environment.cloudFront + 'public/users/profile/';
  readonly url: string = environment.assets + 'utitlity/';
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Filter and search properties
  searchTerm: string = '';
  selectedAppointmentType: string = '';
  selectedTab: string = 'active';
  
  // Data properties
  appointments: any[] = [];
  filteredRequests: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  // Tab configuration
  statusTabs = [
    { label: 'Active', value: 'Active' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Completed', value: 'Completed' }
  ];

  // Mock data for demonstration
  mockAppointmentRequests = [
    {
      id: 1,
      patient: {
        name: 'Emma Johnson',
        avatar: 'assets/images/avatars/female-01.jpg'
      },
      appointmentType: 'Virtual Consultation',
      reasonForVisit: 'Follow-up on blood test results',
      requestDate: new Date('2024-01-15'),
      firstPreference: new Date('2024-01-20T10:00'),
      secondPreference: new Date('2024-01-20T14:00'),
      thirdPreference: new Date('2024-01-21T09:00'),
      notes: 'Patient prefers morning appointments due to work schedule',
      status: 'active'
    },
    {
      id: 2,
      patient: {
        name: 'Michael Chen',
        avatar: 'assets/images/avatars/male-01.jpg'
      },
      appointmentType: 'In-Person Visit',
      reasonForVisit: 'Annual physical examination',
      requestDate: new Date('2024-01-14'),
      firstPreference: new Date('2024-01-22T11:00'),
      secondPreference: new Date('2024-01-22T15:00'),
      thirdPreference: new Date('2024-01-23T10:00'),
      notes: 'Patient has history of hypertension',
      status: 'active'
    },
    {
      id: 3,
      patient: {
        name: 'Sarah Wilson',
        avatar: 'assets/images/avatars/female-02.jpg'
      },
      appointmentType: 'Emergency Consultation',
      reasonForVisit: 'Severe headache and dizziness',
      requestDate: new Date('2024-01-16'),
      firstPreference: new Date('2024-01-17T08:00'),
      secondPreference: new Date('2024-01-17T12:00'),
      thirdPreference: new Date('2024-01-17T16:00'),
      notes: 'Urgent - symptoms started 2 days ago',
      status: 'active'
    },
    {
      id: 4,
      patient: {
        name: 'Robert Davis',
        avatar: 'assets/images/avatars/male-02.jpg'
      },
      appointmentType: 'Virtual Consultation',
      reasonForVisit: 'Prescription refill consultation',
      requestDate: new Date('2024-01-12'),
      firstPreference: new Date('2024-01-18T13:00'),
      secondPreference: new Date('2024-01-18T17:00'),
      thirdPreference: new Date('2024-01-19T14:00'),
      notes: 'Regular diabetes medication refill',
      status: 'cancelled'
    },
    {
      id: 5,
      patient: {
        name: 'Lisa Anderson',
        avatar: 'assets/images/avatars/female-03.jpg'
      },
      appointmentType: 'In-Person Visit',
      reasonForVisit: 'Skin condition consultation',
      requestDate: new Date('2024-01-10'),
      firstPreference: new Date('2024-01-15T09:00'),
      secondPreference: new Date('2024-01-15T13:00'),
      thirdPreference: new Date('2024-01-16T10:00'),
      notes: 'Patient has developed rash on arms',
      status: 'completed'
    },
    {
      id: 6,
      patient: {
        name: 'David Thompson',
        avatar: 'assets/images/avatars/male-03.jpg'
      },
      appointmentType: 'Consultation',
      reasonForVisit: 'Back pain assessment',
      requestDate: new Date('2024-01-13'),
      firstPreference: new Date('2024-01-19T10:00'),
      secondPreference: new Date('2024-01-19T14:00'),
      thirdPreference: new Date('2024-01-20T11:00'),
      notes: 'Pain started after lifting heavy boxes',
      status: 'active'
    },
    {
      id: 7,
      patient: {
        name: 'Jennifer Martinez',
        avatar: 'assets/images/avatars/female-04.jpg'
      },
      appointmentType: 'Virtual Consultation',
      reasonForVisit: 'Mental health check-in',
      requestDate: new Date('2024-01-08'),
      firstPreference: new Date('2024-01-12T16:00'),
      secondPreference: new Date('2024-01-13T14:00'),
      thirdPreference: new Date('2024-01-13T17:00'),
      notes: 'Regular monthly consultation',
      status: 'completed'
    }
  ];

  /**
   * Constructor
   */
  constructor(
    private _matDialog: MatDialog,
    private _portalService: PortalService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.getAppointments();
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {

  }

  getAppointments(): void {
    this.loading = true;
    
    // Try to get real data first
    this._portalService.getAlongWithPendingAppointments().subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          this.appointments = res;
        } else {
          // Use mock data if no real data available
          this.appointments = this.mockAppointmentRequests;
        }
        
        this.loading = false;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching appointments:', err);
        // Use mock data on error
        this.appointments = this.mockAppointmentRequests;
        this.loading = false;
        this.applyFilters();
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Handle search input change
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Handle filter change
   */
  onFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Set active tab
   */
  selectTab(tab: string): void {
    this.selectedTab = tab;
    this.applyFilters();
  }

  /**
   * Get tab class for styling
   */
  getTabClass(tab: string): string {
    return this.selectedTab === tab 
      ? 'border-blue-500 text-blue-600' 
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  }

  /**
   * Apply all filters
   */
  applyFilters(): void {
    let filtered = [...this.appointments];

    // Apply status filter
    if (this.selectedTab && this.selectedTab !== 'All') {
      filtered = filtered.filter(request => request.status === this.selectedTab);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const query = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(request => 
        request.patient.name.toLowerCase().includes(query) ||
        request.appointmentType.toLowerCase().includes(query) ||
        request.reasonForVisit?.toLowerCase().includes(query)
      );
    }

    // Apply appointment type filter
    if (this.selectedAppointmentType) {
      filtered = filtered.filter(request => 
        request.appointmentType === this.selectedAppointmentType
      );
    }

    this.filteredRequests = filtered;
    this.cdr.detectChanges();
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
