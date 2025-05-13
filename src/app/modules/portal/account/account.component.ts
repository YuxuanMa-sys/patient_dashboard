import { TextFieldModule } from '@angular/cdk/text-field';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PortalService } from '../portal.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { NgFor, NgIf } from '@angular/common';
import { combineLatest } from 'rxjs';
import { NotificationService } from '../notification.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'settings-account',
    templateUrl: './account.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TextFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        NgIf,
        NgFor,
        MatSnackBarModule,
    ],
})
export class SettingsAccountComponent implements OnInit {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('logoFileInput') private _logoFileInput: ElementRef;
    @ViewChild('bannerFileInput') private _bannerFileInput: ElementRef;
    accountForm: UntypedFormGroup;
    clinic: any;
    selectedFiles: any;
    uploadProgress: number;

    /**
     * Constructor
     */
    constructor(private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _portalService: PortalService,
        private _notificationService: NotificationService,
        private _snackBar: MatSnackBar
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.accountForm = this._formBuilder.group({
            name: [''],
            description: [''],
            email: ['', Validators.email],
            phone: [''],
            address: [''],
            county: [''],
            logo: [null],
            banner: [null],
            gallery_collection: [[]],
            country: [''],
            state: [''],
            city: [''],
            zipcode: [''],
            language: ['english'],
        });
        this.getData();
    }

    getData() {
        this._portalService.getClinic().subscribe((data: any) => {
            if (data) {
                this.clinic = data;
                console.log('Fetched Clinic Data:', data);

                this.accountForm.patchValue({
                    name: data?.name || '',
                    description: data?.description || '',
                    email: data?.email || '',
                    phone: data?.phoneNumber || '',
                    address: data?.address?.address || '',
                    country: data?.address?.country || '',
                    state: data?.address?.state || '',
                    city: data?.address?.city || '',
                    zipcode: data?.address?.zipcode || '',
                    logo: data?.logo || null,
                    banner: data?.banner || null,
                    gallery_collection: data?.gallery_collection || []
                });
                this._changeDetectorRef.markForCheck();
            } else {
                console.log('No clinic data found.');
            }
        }, error => {
            console.error('Error fetching clinic data:', error);
        });
    }

    /**
     * Remove the avatar
     */
    removeAvatar(): void {
        // Get the form control for 'avatar'
        const avatarFormControl = this.accountForm.get('gallery_main');

        // Set the avatar as null
        avatarFormControl.setValue(null);
        // Set the file input value as null
        this._avatarFileInput.nativeElement.value = null;
        // Update the contact
    }

    uploadLogo(files: FileList): void {
        if (!files.length) return;
        const file = files[0];
        const allowedTypes = ['image/jpeg', 'image/png'];

        if (!allowedTypes.includes(file.type)) {
            this._snackBar.open('Invalid file type. Please upload JPEG or PNG images only.', 'Close', { duration: 3000 });
            return;
        }

        this.uploadProgress = 10;
        this._portalService.uploadFileWithoutId(file, 'clinic-logos').then(
            (downloadURL) => {
                this.accountForm.get('logo').setValue(downloadURL);
                this.uploadProgress = null;
                this._changeDetectorRef.markForCheck();
                this._snackBar.open('Logo uploaded successfully!', 'Close', { duration: 3000 });
            }
        ).catch(error => {
            console.error('Logo upload error:', error);
            this.uploadProgress = null;
            this._changeDetectorRef.markForCheck();
            this._snackBar.open('Failed to upload logo. Please try again.', 'Close', { duration: 3000 });
        });
    }

    uploadBanner(files: FileList): void {
        if (!files.length) return;
        const file = files[0];
        const allowedTypes = ['image/jpeg', 'image/png'];

        if (!allowedTypes.includes(file.type)) {
            this._snackBar.open('Invalid file type. Please upload JPEG or PNG images only.', 'Close', { duration: 3000 });
            return;
        }

        this.uploadProgress = 10;
        this._portalService.uploadFileWithoutId(file, 'clinic-banners').then(
            (downloadURL) => {
                this.accountForm.get('banner').setValue(downloadURL);
                this.uploadProgress = null;
                this._changeDetectorRef.markForCheck();
                this._snackBar.open('Banner uploaded successfully!', 'Close', { duration: 3000 });
            }
        ).catch(error => {
            console.error('Banner upload error:', error);
            this.uploadProgress = null;
            this._changeDetectorRef.markForCheck();
            this._snackBar.open('Failed to upload banner. Please try again.', 'Close', { duration: 3000 });
        });
    }

    onFileSelect(event: any): void {
        this.selectedFiles = event.target.files as FileList;
        if (this.selectedFiles) {
            this.uploadImages();
        }
    }

    uploadImages(): void {
        if (!this.selectedFiles || !(this.selectedFiles instanceof FileList)) return;

        this.uploadProgress = 10;
        const files = Array.from(this.selectedFiles).filter(file =>
            file.type === 'image/jpeg' || file.type === 'image/png'
        );

        if (files.length === 0) {
            this._snackBar.open('No valid images selected. Please upload JPEG or PNG images only.', 'Close', { duration: 3000 });
            return;
        }

        this._portalService.uploadFiles(files, 'clinic-gallery', this.clinic.id).then(
            (uploadedFiles) => {
                const currentGallery = this.accountForm.get('gallery_collection').value || [];
                const newUrls = uploadedFiles.map(file => file.url);
                this.accountForm.get('gallery_collection').setValue([...currentGallery, ...newUrls]);
                this.uploadProgress = null;
                this._changeDetectorRef.detectChanges();
                this._snackBar.open(`${files.length} images uploaded successfully!`, 'Close', { duration: 3000 });
            }
        ).catch(error => {
            console.error('Error uploading images:', error);
            this.uploadProgress = null;
            this._changeDetectorRef.detectChanges();
            this._snackBar.open('Failed to upload images. Please try again.', 'Close', { duration: 3000 });
        });
    }

    removeGalleryImage(imageUrl: string): void {
        const currentGallery = this.accountForm.get('gallery_collection').value || [];
        const updatedGallery = currentGallery.filter(url => url !== imageUrl);
        this.accountForm.get('gallery_collection').setValue(updatedGallery);
        this._changeDetectorRef.detectChanges();
        this._snackBar.open('Image removed from gallery', 'Close', { duration: 3000 });
    }

    saveClinicDetails(): void {
        if (this.accountForm.invalid) {
            this._snackBar.open('Please fill all required fields.', 'Close', { duration: 3000 });
            this.accountForm.markAllAsTouched();
            return;
        }

        const formData = this.accountForm.value;
        const addressData = {
            address: formData.address || null,
            country: formData.country || null,
            state: formData.state || null,
            city: formData.city || null,
            zipcode: formData.zipcode || null,
        };
        const dataToSave = {
            name: formData.name || null,
            description: formData.description || null,
            email: formData.email || null,
            phoneNumber: formData.phone || null,
            logo: formData.logo || null,
            banner: formData.banner || null,
            gallery_collection: formData.gallery_collection || [],
            address: addressData,
        };

        console.log('Data being saved to Firestore:', dataToSave);

        this._portalService.updateClinicDetails(dataToSave).then(() => {
            this._snackBar.open('Clinic details saved successfully!', 'Close', { duration: 3000 });
            this.clinic = { ...this.clinic, ...dataToSave };
            this._changeDetectorRef.markForCheck();
        }).catch(error => {
            console.error('Error saving clinic details:', error);
            const errorMessage = error.message || 'Failed to save clinic details. Please try again.';
            this._snackBar.open(errorMessage, 'Close', { duration: 5000 });
        });
    }
}
