import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PortalService } from '../../portal.service';
import { Service } from '../services.types';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-service-dialog',
    templateUrl: './service-dialog.component.html',
    styleUrls: ['./service-dialog.component.scss'],
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        NgIf,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class ServiceDialogComponent implements OnInit {
    serviceForm: FormGroup;
    isEditMode: boolean = false;
    title: string = 'Add New Service';

    constructor(
        public dialogRef: MatDialogRef<ServiceDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Service | null, // Inject data (null for add, service object for edit)
        private _fb: FormBuilder,
        private _portalService: PortalService,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.isEditMode = !!this.data;
        this.title = this.isEditMode ? 'Edit Service' : 'Add New Service';

        this.serviceForm = this._fb.group({
            name: [this.data?.name || '', Validators.required],
            description: [this.data?.description || '', Validators.required],
            price: [this.data?.price || ''], // Keep as string, add validation if needed
            discount: [this.data?.discount || ''],
            discountedPrice: [this.data?.discountedPrice || ''],
            tag: [this.data?.tag || ''],
            isActive: [this.data?.isActive !== undefined ? this.data.isActive : true] // Default to active
        });
    }

    onSave(): void {
        if (this.serviceForm.invalid) {
            this._snackBar.open('Please fill all required fields.', 'Close', { duration: 3000 });
            this.serviceForm.markAllAsTouched(); // Show validation errors
            return;
        }

        const formData = this.serviceForm.value as Service;

        let saveObservable;
        if (this.isEditMode && this.data?.id) {
            // Update existing service
            saveObservable = this._portalService.updateService(this.data.id, formData);
        } else {
            // Add new service
            saveObservable = this._portalService.addService(formData);
        }

        saveObservable.then(() => {
            const message = this.isEditMode ? 'Service updated successfully.' : 'Service added successfully.';
            this._snackBar.open(message, 'Close', { duration: 3000 });
            this.dialogRef.close(true); // Close dialog and indicate success
        }).catch(err => {
            console.error('Error saving service:', err);
            this._snackBar.open('Error saving service. Please try again.', 'Close', { duration: 3000 });
        });
    }

    onCancel(): void {
        this.dialogRef.close(); // Close dialog without indicating success
    }
}
