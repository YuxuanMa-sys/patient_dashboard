import { NgClass, DatePipe, NgIf, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PortalService } from '../portal.service';
import { MatDialog } from '@angular/material/dialog';
import { StaffModalComponent } from 'app/modules/landing/common/staff/staff.component';
import { cloneDeep } from 'lodash';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-providers',
    templateUrl: './providers.component.html',
    styleUrls: ['./providers.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatIconModule,
        MatStepperModule,
        MatFormFieldModule, 
        MatInputModule, 
        MatSelectModule,
        MatOptionModule, 
        MatButtonModule, 
        MatCheckboxModule, 
        MatRadioModule,
        MatDatepickerModule,
        MatProgressSpinnerModule,
        MatMenuModule, 
        MatDividerModule,
        NgClass, 
        MatTableModule,
        MatSortModule, 
        DatePipe,
        NgIf,
        NgFor,
        FormsModule
    ],
})
export class ProvidersComponent implements OnInit {
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    tableColumn: string[] = ['name', 'type', 'id', 'color', 'action'];
    providers: Array<any> = [];
    filteredProviders: Array<any> = [];
    loading: boolean = true;
    error: string;
    
    // Search and filter properties
    searchQuery: string = '';
    
    // Sorting properties
    sortField: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';

    constructor(
        private _portalService: PortalService,
        private cdr: ChangeDetectorRef,
        private _matDialog: MatDialog,
    ) {
    }

    ngOnInit() {
        this.getData();
    }

    getData(): void {
        this.loading = true;
        this.error = null;
        this._portalService.getStaffList().subscribe({
            next: (res) => {
                console.log('Staff/Provider data:', res);
                this.providers = res || [];
                this.filteredProviders = [...this.providers];
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching providers:', err);
                this.error = 'Unable to load providers. Please check your connection and try again.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Apply search filter
     */
    applyFilters(): void {
        let filtered = [...this.providers];

        // Search filter
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(provider => 
                (provider.name?.toLowerCase().includes(query)) ||
                (provider.email?.toLowerCase().includes(query)) ||
                (provider.phone?.includes(query)) ||
                (provider.specialization?.toLowerCase().includes(query)) ||
                (provider.role?.toLowerCase().includes(query))
            );
        }

        this.filteredProviders = filtered;
        this.applySorting();
        this.cdr.detectChanges();
    }

    /**
     * Apply sorting to filtered providers
     */
    applySorting(): void {
        if (!this.sortField) return;

        this.filteredProviders.sort((a, b) => {
            let aValue, bValue;

            switch (this.sortField) {
                case 'name':
                    aValue = a.name?.toLowerCase() || '';
                    bValue = b.name?.toLowerCase() || '';
                    break;
                case 'type':
                    aValue = a.specialization?.toLowerCase() || a.role?.toLowerCase() || '';
                    bValue = b.specialization?.toLowerCase() || b.role?.toLowerCase() || '';
                    break;
                case 'id':
                    aValue = a.id || '';
                    bValue = b.id || '';
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
     * Get provider type display name
     */
    getProviderType(provider: any): string {
        return provider.specialization || provider.role || 'General Physician';
    }

    /**
     * Get provider ID for display
     */
    getProviderId(provider: any): string {
        // If provider.id is a number or string, always format as DEX + 4-digit number
        let num = 1;
        if (provider.id && !isNaN(Number(provider.id))) {
            num = Number(provider.id);
        } else if (provider.id && typeof provider.id === 'string') {
            // Try to extract trailing digits
            const match = provider.id.match(/(\d+)$/);
            if (match) num = Number(match[1]);
        }
        return `DEX${num.toString().padStart(4, '0')}`;
    }

    /**
     * Get provider avatar
     */
    getProviderAvatar(provider: any): string {
        return provider.profileImage || 'images/avatars/male-01.jpg';
    }

    createOrUpdate(data: any) {
        const dialogRef = this._matDialog.open(StaffModalComponent, {
            autoFocus: false,
            data: cloneDeep(data),
            width: '600px',
            maxWidth: '90vw',
            panelClass: 'custom-dialog-container'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getData();
            }
        });
    }

    deleteData(id: string): void {
        const confirmed = confirm(
            'Are you sure you want to remove this provider?\n\n' +
            'This action cannot be undone and may affect appointments and patient records.'
        );
        
        if (confirmed) {
            this._portalService.deleteStaff(id)
                .then(() => {
                    console.log('Provider deleted successfully!');
                    this.getData();
                })
                .catch((error) => {
                    console.error('Error deleting provider:', error);
                    alert('Failed to remove provider. Please try again.');
                });
        }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
} 