import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import moment from 'moment';
import { environment } from 'environments/environment';
import { PortalService } from '../../portal.service';
import { FormGroup } from '@angular/forms';
import { ClinicStatus } from 'app/_enums/clinicStatus.enum';
import { AnnoucementType } from 'app/_enums/annoucementType.enum';
import { MatDialog } from '@angular/material/dialog';
import { PromotionModalComponent } from 'app/modules/landing/common/promotion/promotion.component';
import { cloneDeep } from 'lodash';


@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {

    readonly avatar: string = environment.cloudFront + 'public/users/profile/';
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    tableColumn: string[] = ['name', 'phone', 'type', 'role', 'status', 'action'];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    patientCount: number = 0;
    query: string;
    patientForm: FormGroup;
    cities = [];
    staff: Array<any> = [];
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

    // Search and filter properties
    searchQuery: string = '';
    selectedMonth: string = '';
    
    // Data properties
    announcements: any[] = [];
    filteredAnnouncements: any[] = [];
    filteredPromotions: any[] = [];
    loading: boolean = true;
    error: string | null = null;

    // Month options
    months = [
        { value: '', label: 'All Months' },
        { value: '0', label: 'January' },
        { value: '1', label: 'February' },
        { value: '2', label: 'March' },
        { value: '3', label: 'April' },
        { value: '4', label: 'May' },
        { value: '5', label: 'June' },
        { value: '6', label: 'July' },
        { value: '7', label: 'August' },
        { value: '8', label: 'September' },
        { value: '9', label: 'October' },
        { value: '10', label: 'November' },
        { value: '11', label: 'December' }
    ];

    /**
     * Constructor
     */
    constructor(
        private _portalService: PortalService,
        private cdr: ChangeDetectorRef,
        private _matDialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.getAllPromotion();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {

    }

    getAllPromotion(): void {
        this._portalService.getPromotion().subscribe({
            next: (res) => {
                this.announcements = res.map((e: any) => {
                    return {
                        id: e.id,  // Adjusted id mapping for Firestore documents
                        ...e,
                    };
                })
                    // .filter(announcement => announcement.announcement_type === AnnoucementType.PROMO && announcement.createdAt);  // Filter Promo type

                // Sort by createdAt in descending order
                this.announcements.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
                
                // Initialize filtered promotions
                this.filteredPromotions = [...this.announcements];
                console.log(this.announcements);

                this.loading = false;
                this.cdr.detectChanges();  // Trigger change detection if necessary
            },
            error: (err) => {
                console.error('Error fetching promotions:', err);
                this.loading = false;
                this.error = 'Failed to load promotions';
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
     * Handle month selection change
     */
    onMonthChange(): void {
        this.applyFilters();
    }

    /**
     * Apply search and month filters
     */
    applyFilters(): void {
        let filtered = [...this.announcements];

        // Apply search filter
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(item => 
                item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.type?.toLowerCase().includes(query) ||
                item.for?.toLowerCase().includes(query)
            );
        }

        // Apply month filter
        if (this.selectedMonth !== '') {
            const monthNumber = parseInt(this.selectedMonth);
            filtered = filtered.filter(item => {
                if (item.createdAt?.toDate) {
                    const itemMonth = item.createdAt.toDate().getMonth();
                    return itemMonth === monthNumber;
                }
                return false;
            });
        }

        this.filteredPromotions = filtered;
        this.cdr.detectChanges();
    }

    createOrUpdate(data: any) {
        const dialogRef = this._matDialog.open(PromotionModalComponent, {
            autoFocus: false,
            data: cloneDeep(data),
            width: '600px',
            maxHeight: '90vh'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getAllPromotion();
            }
        });
    }

    deleteData(id: string): void {
        if (confirm('Are you sure you want to delete this promotion?')) {
            this._portalService.deletePromotion(id)
                .then(() => {
                    console.log('Promotion deleted successfully!');
                    this.getAllPromotion();
                })
                .catch((error) => console.error('Error deleting promotion:', error));
        }
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

