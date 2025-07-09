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
import { AnnouncementModalComponent } from 'app/modules/landing/common/announcement/announcement.component';
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
    loading: boolean = true;
    error: string | null = null;
    promotions: any[] = [];
    filteredPromotions: any[] = [];

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

    activeTab: 'announcements' | 'promotions' = 'announcements';

    get visibleCards() {
      return this.activeTab === 'announcements' ? this.filteredAnnouncements : this.filteredPromotions;
    }

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
        this.getAllAnnouncements();
        this.getAllPromotions();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {

    }

    getAllAnnouncements(): void {
        this._portalService.getAnnouncements().subscribe({
            next: (res) => {
                this.announcements = res.map((e: any) => ({ id: e.id, ...e }));
                this.announcements.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
                this.filteredAnnouncements = [...this.announcements];
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.loading = false;
                this.error = 'Failed to load announcements';
                this.cdr.detectChanges();
            }
        });
    }

    getAllPromotions(): void {
        this._portalService.getPromotion().subscribe({
            next: (res) => {
                this.promotions = res.map((e: any) => ({ id: e.id, ...e }));
                this.promotions.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
                this.filteredPromotions = [...this.promotions];
                this.cdr.detectChanges();
            },
            error: (err) => {
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
        let filteredA = [...this.announcements];
        let filteredP = [...this.promotions];
        // Apply search filter
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase().trim();
            filteredA = filteredA.filter(item => 
                item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.type?.toLowerCase().includes(query) ||
                item.for?.toLowerCase().includes(query)
            );
            filteredP = filteredP.filter(item => 
                item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.type?.toLowerCase().includes(query) ||
                item.for?.toLowerCase().includes(query)
            );
        }
        // Apply month filter
        if (this.selectedMonth !== '') {
            const monthNumber = parseInt(this.selectedMonth);
            filteredA = filteredA.filter(item => {
                if (item.createdAt?.toDate) {
                    const itemMonth = item.createdAt.toDate().getMonth();
                    return itemMonth === monthNumber;
                }
                return false;
            });
            filteredP = filteredP.filter(item => {
                if (item.createdAt?.toDate) {
                    const itemMonth = item.createdAt.toDate().getMonth();
                    return itemMonth === monthNumber;
                }
                return false;
            });
        }
        this.filteredAnnouncements = filteredA;
        this.filteredPromotions = filteredP;
        this.cdr.detectChanges();
    }

    createOrUpdate(data: any) {
        const dialogRef = this._matDialog.open(AnnouncementModalComponent, {
            autoFocus: false,
            data: cloneDeep(data),
            width: '600px',
            maxHeight: '90vh'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (this.activeTab === 'announcements') {
                    this.getAllAnnouncements();
                } else {
                    this.getAllPromotions();
                }
            }
        });
    }

    deleteData(id: string): void {
        if (this.activeTab === 'announcements') {
            if (confirm('Are you sure you want to delete this announcement?')) {
                this._portalService.deleteAnnouncements(id)
                    .then(() => {
                        this.getAllAnnouncements();
                    })
                    .catch((error) => console.error('Error deleting announcement:', error));
            }
        } else {
            if (confirm('Are you sure you want to delete this promotion?')) {
                this._portalService.deletePromotion(id)
                    .then(() => {
                        this.getAllPromotions();
                    })
                    .catch((error) => console.error('Error deleting promotion:', error));
            }
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
