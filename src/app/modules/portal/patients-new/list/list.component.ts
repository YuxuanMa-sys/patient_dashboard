import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import { PatientsService } from '../patients.service';
import moment from 'moment';
import { environment } from 'environments/environment';
import { PortalService } from '../../portal.service';
import { FormGroup } from '@angular/forms';
import { ClinicStatus } from 'app/_enums/clinicStatus.enum';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly avatar: string = environment.cloudFront + 'public/users/profile/';
  recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
  tableColumn: string[] = ['name', 'phone', 'gender', 'status', 'date added', 'action'];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

    patientCount: number = 0;
    query: string;
    patientForm: FormGroup;
    cities = [];
    patients: Array<any> = [];
    sortedData: Array<any>;
    patientsToShow: Array<any> = [];
    allClinics: Array<any> = [];
    currentClinicId: string = null;
    currentUser: string = null;
    selectedPatient: any;
    patientToDelete: any;
    showAddDialog = false;
    showUpdateDialog = false;
    showDeleteDialog = false;
    uploadingImage = false;
    selectedImage: string | ArrayBuffer = null;
    imageDownloadURL: any;
    uploadedImageURL: string = null;
    phonePattern: RegExp =
      /^[+]{1}[1]{1}[\s]*((\([0-9]{3}\))|[0-9]{3})[\s\-]?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[0-9]{4}$/;

    data: any[] = []; // Initialize data as an empty array
    loading: boolean = true;
    error: string | null = null;

    // Filter properties
    filteredPatients: any[] = [];
    searchTerm: string = '';
    dateFilter: string = '';
    firstNameFilter: string = '';
    lastNameFilter: string = '';
    statusFilter: string = '';

    // Sorting properties (matching patients page)
    sortField: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
  /**
   * Constructor
   */
  constructor(
    private _patientsService: PatientsService,
    private _portalService: PortalService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
this.getPatients();
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {

  }

  getPatients(): void {
    this._portalService.getPatients().subscribe({
      next: (res) => {
        // Step 1: Map and filter patients
        this.patients = res
          .map((e: any) => {
            return {
              id: e.id, // Assuming you're getting the patient ID this way
              ...e,     // Spread the rest of the data
            };
          })
          .filter((_patient) =>
            _patient.createdAt && _patient.status !== ClinicStatus.ACTIVE
          ); // Filtering based on conditions

        // Step 2: Sort patients by createdAt
        this.patients.sort(
          (a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
        );

        // Step 3: Resolve clinic data if clinic_id exists
        this.patients.forEach((patient) => {
          if (patient?.clinic_id) {
            patient.clinic_id.get().then((res: any) => {
              if (res.exists) {
                patient.clinic = res.data()?.name; // Assign clinic name to the patient
              }
              this.cdr.detectChanges(); // Manually trigger change detection after each clinic fetch
            }).catch((err) => console.error('Error fetching clinic:', err));
          }
        });

        // Save a copy of sorted data for future use
        this.sortedData = this.patients.slice();
        this.filteredPatients = this.patients.slice(); // Initialize filtered patients
        this.loading = false; // Stop loading indicator
        this.cdr.detectChanges(); // Ensure the view is updated with new data
        console.log('Patients:', this.patients);
      },
      error: (err) => {
        console.error('Error fetching patients:', err);
        this.error = 'An error occurred while fetching patients.';
        this.loading = false;
        this.cdr.detectChanges(); // Ensure error message is shown in the UI
      }
    });
  }

  getCurrentAge(dob: string): string {
    const birthDate = moment(dob);
    const today = moment();
    const years = today.diff(birthDate, 'years');
    birthDate.add(years, 'years');
    const months = today.diff(birthDate, 'months');
    let ageString = years + ' years';

    if (years < 1) {
      ageString =  months + ' months';
    }

    return ageString;
  }




  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  /**
   * Approve patient request and convert to active patient
   */
  approvePatientRequest(patient: any): void {
    if (confirm(`Are you sure you want to approve ${patient.fname} ${patient.lname}'s patient request?`)) {
      const updateData = {
        status: ClinicStatus.ACTIVE,
        approvedAt: new Date(),
        approvedBy: 'Current Doctor' // In real app, get from auth service
      };

      this._portalService.updatePatient(patient.id, updateData)
        .then(() => {
          console.log('Patient request approved successfully');
          // Refresh the patients list
          this.getPatients();
        })
        .catch((error) => {
          console.error('Error approving patient request:', error);
          alert('Error approving patient request. Please try again.');
        });
    }
  }

  /**
   * Get patient avatar URL with fallback
   */
  getPatientAvatar(patient: any): string {
    if (patient?.profilePictureUrl) {
      return patient.profilePictureUrl;
    }
    
    // Use default avatars based on gender
    const defaultAvatars = [
      'images/avatars/male-01.jpg',
      'images/avatars/female-01.jpg',
      'images/avatars/male-02.jpg',
      'images/avatars/female-02.jpg'
    ];
    
    const index = patient?.id ? patient.id.length % defaultAvatars.length : 0;
    return defaultAvatars[index];
  }

  /**
   * Get patient full name
   */
  getPatientFullName(patient: any): string {
    const firstName = patient?.fname || '';
    const lastName = patient?.lname || '';
    return `${firstName} ${lastName}`.trim() || 'N/A';
  }

  /**
   * Handle image loading errors
   */
  onImageError(event: any): void {
    event.target.src = 'images/avatars/male-01.jpg';
  }

  /**
   * Handle filter changes
   */
  onFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Apply all filters
   */
  applyFilters(): void {
    let filtered = [...this.patients];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const query = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(patient => 
        this.getPatientFullName(patient).toLowerCase().includes(query) ||
        patient.fname?.toLowerCase().includes(query) ||
        patient.lname?.toLowerCase().includes(query) ||
        patient.email?.toLowerCase().includes(query) ||
        patient.number?.toLowerCase().includes(query) ||
        patient.phone?.toLowerCase().includes(query)
      );
    }

    // Apply first name filter
    if (this.firstNameFilter.trim()) {
      const query = this.firstNameFilter.toLowerCase().trim();
      filtered = filtered.filter(patient => 
        patient.fname?.toLowerCase().includes(query)
      );
    }

    // Apply last name filter
    if (this.lastNameFilter.trim()) {
      const query = this.lastNameFilter.toLowerCase().trim();
      filtered = filtered.filter(patient => 
        patient.lname?.toLowerCase().includes(query)
      );
    }

    // Apply status filter - Fixed to handle patients without status
    if (this.statusFilter) {
      filtered = filtered.filter(patient => {
        const patientStatus = patient.status || 'Pending'; // Default to 'Pending' if no status
        return patientStatus === this.statusFilter;
      });
    }

    // Apply date filter (simple contains check)
    if (this.dateFilter.trim()) {
      const query = this.dateFilter.toLowerCase().trim();
      filtered = filtered.filter(patient => {
        const dateStr = patient.createdAt?.toDate?.()?.toLocaleDateString()?.toLowerCase() || '';
        return dateStr.includes(query);
      });
    }

    this.filteredPatients = filtered;
    this.cdr.detectChanges();
  }

  /**
   * Sort data by field
   */
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredPatients.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (field) {
        case 'name':
          aValue = this.getPatientFullName(a).toLowerCase();
          bValue = this.getPatientFullName(b).toLowerCase();
          break;
        case 'phone':
          aValue = a?.number || a?.phone || '';
          bValue = b?.number || b?.phone || '';
          break;
        case 'gender':
          aValue = a?.gender || '';
          bValue = b?.gender || '';
          break;
        case 'status':
          aValue = a?.status || 'Pending';
          bValue = b?.status || 'Pending';
          break;
        case 'date':
          aValue = a?.createdAt?.toDate?.() || new Date(0);
          bValue = b?.createdAt?.toDate?.() || new Date(0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.cdr.detectChanges();
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
