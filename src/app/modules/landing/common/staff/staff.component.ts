import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { debounceTime, map, Observable, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { environment } from 'environments/environment';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { PortalService } from 'app/modules/portal/portal.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Timestamp } from 'firebase/firestore';


@Component({
    selector: 'staff',
    templateUrl: './staff.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatButtonModule, MatIconModule, FormsModule,
        ReactiveFormsModule,
        TextFieldModule, NgFor, MatCheckboxModule,
        RouterLink, MatSelectModule,
        NgClass, MatRippleModule, MatMenuModule, MatDialogModule, AsyncPipe,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule,
        MatRadioModule,
        MatDatepickerModule, MatDividerModule, DatePipe, CommonModule,
    ],
    providers: [DatePipe]
})
export class StaffModalComponent implements OnInit, OnDestroy {
    form: FormGroup;
    roleOptions: string[] = ["FrontDesk", "Provider", "Admin"];
    statusOptions: string[] = ["Active", "Inactive"];
    selectedImage: File | null = null;
    imagePreviewUrl: SafeUrl | null = null;
    loading: boolean = false;
    error: string = '';
    single: any;

    /**
     * Constructor
     */
    constructor(
        private _portalService: PortalService,
        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) private _data: { data: any },
        private _matDialogRef: MatDialogRef<StaffModalComponent>,
        private _scrollStrategyOptions: ScrollStrategyOptions,
        private router: Router,
        private route: ActivatedRoute,
        private datePipe: DatePipe,
        private fb: FormBuilder,
        private sanitizer: DomSanitizer,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.form = this.fb.group({
            name: [null, Validators.required],
            phone: [null, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
            bio: [null],
            email: [null, [Validators.required, Validators.email]],
            profileImage: [null],
            role: [null, Validators.required],
            status: [null, Validators.required],
            specialization: [null],
            wort_at: [null],
            since: [null],
            password: [null, Validators.required],
            color: ['#000000', Validators.required],
            createdAt: new Date(),
        });

        this.single = this._data;
        console.log(this.single);

        if (this.single !== 'add') {
            this.imagePreviewUrl = this.single.profileImage;
            this.single.createdAt = this.single.createdAt && this.single.createdAt.seconds
                ? new Date(this.single.createdAt.seconds * 1000)
                : null;
                this.single.since = this.single.since && this.single.since.seconds ? new Date(this.single.since.seconds * 1000) : null;
            this.form.patchValue(this.single);
        }
    }

    onImageSelect(event: Event): void {
        const fileInput = event.target as HTMLInputElement;
        this.selectedImage = fileInput.files ? fileInput.files[0] : null;

        if (this.selectedImage) {
            // Generate a preview of the selected image
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreviewUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(this.selectedImage);

            // Immediately upload the image and patch the form
            this.uploadImageAndPatchForm();
        }
    }

    async uploadImageAndPatchForm(): Promise<void> {
        if (this.selectedImage) {
            try {
                // Use the new service method to upload the image
                const imageUrl = await this._portalService.uploadFileWithoutId(this.selectedImage, 'ProfileImage');

                if (imageUrl) {
                    // Patch the image URL into the form
                    this.form.patchValue({ profileImage: imageUrl });
                    this.cdr.detectChanges(); // Update the view
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                this.error = 'Failed to upload image. Please try again.';
            }
        }
    }

    async save(): Promise<void> {
        console.log(this.form.value);

        if (this.form.valid) {
            this.loading = true;

            const formData = {
                ...this.form.value,
            };

            if (formData.since) {
                formData.since = Timestamp.fromDate(new Date(formData.since));
            }

            if (this.single === 'add') {
                try {
                    // Step 1: Create Firebase Authentication user
                    const userCredential = await this._portalService.createAuthUser(formData.email, formData.password);

                    // Step 2: Get the UID and add it to the formData
                    formData.uid = userCredential.user.uid;

                    // Step 3: Create staff in Firestore
                    const res = await this._portalService.addStaff(formData);
                    console.log('Staff created successfully with ID:', res.id);

                    // Close the dialog and pass the created staff data
                    this._matDialogRef.close({ ...res, id: res.id });
                } catch (error) {
                    console.error('Error creating staff or auth user:', error);
                    this.error = 'Failed to create staff. Please try again.';
                } finally {
                    this.loading = false;
                }
            } else {
                try {
                    // Update existing staff
                    await this._portalService.updateStaff(this.single.id, formData);
                    this._matDialogRef.close(formData);
                    console.log('Staff updated successfully!');
                } catch (error) {
                    console.error('Error updating staff:', error);
                    this.error = 'Failed to update staff. Please try again.';
                } finally {
                    this.loading = false;
                }
            }
        }
    }


    close() {
        this._matDialogRef.close();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {}

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}

