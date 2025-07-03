import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
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

    // Filter properties
    searchQuery: string = '';
    dateFilter: Date | null = null;
    firstNameFilter: string = '';
    lastNameFilter: string = '';

    // Sorting properties
    sortField: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';

    // Data properties
    data: any[] = [];
    filteredPatients: any[] = [];
    loading: boolean = true;
    error: string | null = null;

    // Legacy properties (keeping for compatibility)
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

    /**
     * Constructor
     */
    constructor(
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
            next: (data) => {
                if (data && data.length > 0) {
                    this.data = data;
                    this.filteredPatients = [...this.data]; // Initialize filtered data
                }
                this.loading = false;
                this.cdr.detectChanges();
                console.log('Patients:', this.data);
            },
            error: (err) => {
                console.error('Error fetching patients:', err);
                this.error = 'An error occurred while fetching patients.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Filter patients based on search and filter criteria
     */
    applyFilters(): void {
        let filtered = [...this.data];

        // Search filter
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(patient => 
                (patient.fname?.toLowerCase().includes(query)) ||
                (patient.lname?.toLowerCase().includes(query)) ||
                (patient.email?.toLowerCase().includes(query)) ||
                (patient.number?.includes(query)) ||
                (patient.phone?.includes(query))
            );
        }

        // First name filter
        if (this.firstNameFilter.trim()) {
            const query = this.firstNameFilter.toLowerCase().trim();
            filtered = filtered.filter(patient => 
                patient.fname?.toLowerCase().includes(query)
            );
        }

        // Last name filter
        if (this.lastNameFilter.trim()) {
            const query = this.lastNameFilter.toLowerCase().trim();
            filtered = filtered.filter(patient => 
                patient.lname?.toLowerCase().includes(query)
            );
        }

        // Date filter
        if (this.dateFilter) {
            filtered = filtered.filter(patient => {
                if (patient.createdAt?.toDate) {
                    const patientDate = patient.createdAt.toDate();
                    return patientDate.toDateString() === this.dateFilter.toDateString();
                }
                return false;
            });
        }

        this.filteredPatients = filtered;
        this.applySorting();
        this.cdr.detectChanges();
    }

    /**
     * Apply sorting to filtered patients
     */
    applySorting(): void {
        if (!this.sortField) return;

        this.filteredPatients.sort((a, b) => {
            let aValue, bValue;

            switch (this.sortField) {
                case 'name':
                    aValue = `${a.fname || ''} ${a.lname || ''}`.toLowerCase();
                    bValue = `${b.fname || ''} ${b.lname || ''}`.toLowerCase();
                    break;
                case 'id':
                    aValue = a.id || '';
                    bValue = b.id || '';
                    break;
                case 'phone':
                    aValue = a.number || a.phone || '';
                    bValue = b.number || b.phone || '';
                    break;
                case 'date':
                    aValue = a.createdAt?.toDate() || new Date(0);
                    bValue = b.createdAt?.toDate() || new Date(0);
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
    }

    /**
     * Handle search input changes
     */
    onSearchChange(): void {
        this.applyFilters();
    }

    /**
     * Handle filter changes
     */
    onFilterChange(): void {
        this.applyFilters();
    }

    /**
     * Sort by field
     */
    sortBy(field: string): void {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        this.applySorting();
        this.cdr.detectChanges();
    }

    /**
     * Generate patient ID for display
     */
    generatePatientId(patient: any): string {
        return patient.id?.substring(0, 6) || '332142';
    }

    getCurrentAge(dob: string): string {
        const birthDate = moment(dob);
        const today = moment();
        const years = today.diff(birthDate, 'years');
        birthDate.add(years, 'years');
        const months = today.diff(birthDate, 'months');
        let ageString = years + ' years';

        if (years < 1) {
            ageString = months + ' months';
        }

        return ageString;
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
