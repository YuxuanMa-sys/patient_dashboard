import { NgClass, DatePipe, NgIf, NgFor } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

@Component({
    selector: 'app-insurance',
    standalone: true,
    imports: [
        MatIconModule,
        MatStepperModule,
        MatFormFieldModule, MatInputModule, MatSelectModule,
        MatOptionModule, MatButtonModule, MatCheckboxModule, MatRadioModule,
        MatDatepickerModule,
        MatProgressSpinnerModule,
        MatMenuModule, MatDividerModule,
        NgClass, MatTableModule,
        MatSortModule, DatePipe,
        NgIf,
        NgFor
    ],
    templateUrl: './insurance.component.html',
    styleUrl: './insurance.component.scss'
})
export class InsuranceComponent implements OnInit {
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    tableColumn: string[] = ['name', 'status', 'create', 'action'];
    insurance: Array<any> = [];
    sortedData: Array<any>;
    loading: boolean;
    error: string;

    constructor(
        private _portalService: PortalService,
        private cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.getData();
    }

    getData(): void {
        this._portalService.getInsuranceList().subscribe({
            next: (res) => {
                console.log(res);

                // Step 1: Map and filter patients
                this.insurance = res
                // Save a copy of sorted data for future use
                this.loading = false; // Stop loading indicator
                this.cdr.detectChanges(); // Ensure the view is updated with new data
            },
            error: (err) => {
                console.error('Error fetching staff:', err);
                this.error = 'An error occurred while fetching staff.';
                this.loading = false;
                this.cdr.detectChanges(); // Ensure error message is shown in the UI
            }
        });
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
