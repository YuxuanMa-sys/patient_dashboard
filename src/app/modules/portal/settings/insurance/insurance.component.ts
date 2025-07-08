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
import { PortalService } from '../../portal.service';
import { MatDialog } from '@angular/material/dialog';
import { InsuranceModalComponent } from 'app/modules/landing/common/insurance/insurance.component';
import { cloneDeep } from 'lodash';

@Component({
    selector: 'settings-insurance',
    templateUrl: './insurance.component.html',
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
        NgFor
    ],
})
export class SettingsInsuranceComponent implements OnInit {
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    tableColumn: string[] = ['name', 'status', 'create', 'action'];
    insurance: Array<any> = [];
    sortedData: Array<any>;
    loading: boolean = true;
    error: string;

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
        this._portalService.getInsuranceList().subscribe({
            next: (res) => {
                console.log('Insurance data:', res);
                this.insurance = res || [];
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching insurance:', err);
                this.error = 'Unable to load insurance providers. Please check your connection and try again.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    getActiveCount(): number {
        return this.insurance.filter(item => item.status === true).length;
    }

    getInactiveCount(): number {
        return this.insurance.filter(item => item.status === false).length;
    }

    createOrUpdate(data: any) {
        const dialogRef = this._matDialog.open(InsuranceModalComponent, {
            autoFocus: false,
            data: cloneDeep(data),
            width: '500px',
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
        // Enhanced confirmation dialog
        const confirmed = confirm(
            'Are you sure you want to delete this insurance provider?\n\n' +
            'This action cannot be undone and may affect patient records that reference this provider.'
        );
        
        if (confirmed) {
            this._portalService.deleteInsurancet(id)
                .then(() => {
                    console.log('Insurance deleted successfully!');
                    this.getData();
                })
                .catch((error) => {
                    console.error('Error deleting insurance:', error);
                    alert('Failed to delete insurance provider. Please try again.');
                });
        }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
} 