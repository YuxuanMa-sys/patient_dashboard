import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table'; // For table display
import { MatTooltipModule } from '@angular/material/tooltip'; // For tooltips on buttons
import { RouterLink } from '@angular/router';
import { PortalService } from '../../portal.service';
import { Service } from '../services.types';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // For potential add/edit dialog
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Import snackbar
import { ServiceDialogComponent } from 'app/modules/portal/services/dialog/service-dialog.component'; // Updated Import Path

@Component({
    selector: 'portal-services-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        RouterLink,
        MatDialogModule,
        MatSnackBarModule, // Add snackbar module
        ServiceDialogComponent, // Add dialog component to imports
    ],
})
export class ServicesListComponent implements OnInit {
    services: Service[] = [];
    isLoading = true;
    displayedColumns: string[] = ['name', 'description', 'price', 'tag', 'actions']; // Columns for the table

    constructor(
        private _portalService: PortalService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog, // Inject MatDialog
        private _snackBar: MatSnackBar // Inject MatSnackBar
    ) {}

    ngOnInit(): void {
        this.loadServices();
    }

    loadServices(): void {
        this.isLoading = true;
        this._portalService.getServices().subscribe({
            next: (data) => {
                this.services = data;
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: (err) => {
                console.error('Error fetching services:', err);
                this.isLoading = false;
                this._snackBar.open('Error loading services.', 'Close', { duration: 3000 });
                this._changeDetectorRef.markForCheck();
            },
        });
    }

    addService(): void {
        const dialogRef = this._matDialog.open(ServiceDialogComponent, {
            width: '600px',
            data: null // Pass null for Add mode
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) { // Only reload if the dialog returned success (true)
                this.loadServices();
            }
        });
    }

    editService(service: Service): void {
         const dialogRef = this._matDialog.open(ServiceDialogComponent, {
            width: '600px',
            data: service // Pass the service data for Edit mode
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) { // Only reload if the dialog returned success (true)
                this.loadServices();
            }
        });
    }

    deleteService(service: Service): void {
        // TODO: Add confirmation dialog before deleting
        if (confirm(`Are you sure you want to delete "${service.name}"?`)) { // Simple browser confirm for now
            this._portalService.deleteService(service.id)
                .then(() => {
                    this._snackBar.open(`Service "${service.name}" deleted.`, 'Close', { duration: 3000 });
                    this.loadServices(); // Refresh list
                })
                .catch(err => {
                    console.error("Error deleting service:", err);
                    this._snackBar.open('Error deleting service.', 'Close', { duration: 3000 });
                });
        }
    }
}
