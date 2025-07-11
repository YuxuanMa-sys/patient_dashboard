import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ElementRef, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
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


@Component({
    selector: 'announcement',
    templateUrl: './announcement.component.html',
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
export class AnnouncementModalComponent implements OnInit, OnDestroy {
    @ViewChild('fileInput') fileInput: ElementRef;
    
    form: FormGroup;
    selectedTarget: 'Individual' | 'All' = 'Individual';
    selectedImage: File | null = null;
    imagePreviewUrl: SafeUrl | null = null;
    loading: boolean = false;
    error: string = '';
    single: any;
    isEdit: boolean = false;
    isPromotion: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private _portalService: PortalService,
        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) private _data: { data: any },
        private _matDialogRef: MatDialogRef<AnnouncementModalComponent>,
        private _scrollStrategyOptions: ScrollStrategyOptions,
        private router: Router,
        private route: ActivatedRoute,
        private datePipe: DatePipe,
        private fb: FormBuilder,
        private sanitizer: DomSanitizer,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.form = this.fb.group({
            title: [null, Validators.required],
            description: [null, Validators.required],
            image: [null],
            status: [true],
            for: ['All'], // Set default to 'All'
            type: ['Info'], // Set default type
            createdAt: new Date(),
        });

        this.single = this._data;
        // Determine if editing or creating
        this.isEdit = this.single && this.single !== 'add';
        // Determine if this is a promotion (type === 'Promo')
        this.isPromotion = this.single && (this.single.type === 'Promo');

        if (this.isEdit) {
            this.imagePreviewUrl = this.single.image;
            this.selectedTarget = this.single.for === 'All' ? 'All' : 'Individual';
            this.single.createdAt = this.single.createdAt && this.single.createdAt.seconds ? new Date(this.single.createdAt.seconds * 1000) : null;
            this.form.patchValue(this.single);
        }

        // Update form when target changes
        this.updateFormForTarget();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Cleanup if needed
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Select target (Individual or All)
     */
    selectTarget(target: 'Individual' | 'All'): void {
        this.selectedTarget = target;
        this.updateFormForTarget();
    }

    /**
     * Update form based on selected target
     */
    updateFormForTarget(): void {
        this.form.patchValue({
            for: this.selectedTarget
        });
    }

    /**
     * Get recipient text based on selected target
     */
    getRecipientText(): string {
        return this.selectedTarget === 'All' ? '@All' : '@Andy Martins';
    }

    /**
     * Trigger file input click
     */
    triggerFileInput(): void {
        this.fileInput.nativeElement.click();
    }

    /**
     * Handle image selection
     */
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

    /**
     * Upload image and patch form
     */
    async uploadImageAndPatchForm(): Promise<void> {
        if (this.selectedImage) {
            try {
                // Use the new service method to upload the image
                const imageUrl = await this._portalService.uploadFileWithoutId(this.selectedImage, 'announcements');

                if (imageUrl) {
                    // Patch the image URL into the form
                    this.form.patchValue({ image: imageUrl });
                    this.cdr.detectChanges(); // Update the view
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                this.error = 'Failed to upload image. Please try again.';
            }
        }
    }

    /**
     * Save announcement
     */
    async save(): Promise<void> {
        console.log(this.form.value);

        if (this.form.valid) {
            this.loading = true;

            const formData = {
                ...this.form.value,
            };

            try {
                if (this.single === 'add') {
                    const res = await this._portalService.createAnnouncements(formData);
                    console.log('Announcement created successfully with ID:', res.id);
                    this._matDialogRef.close({ ...res, id: res.id });
                } else {
                    const res = await this._portalService.updateAnnouncements(this.single.id, formData);
                    console.log('Announcement updated successfully!');
                    this._matDialogRef.close(res);
                }
            } catch (error) {
                console.error('Error saving announcement:', error);
                this.error = 'Failed to save announcement. Please try again.';
            } finally {
                this.loading = false;
                this.cdr.detectChanges();
            }
        }
    }

    /**
     * Close modal
     */
    close(): void {
        this._matDialogRef.close();
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    getModalTitle(): string {
        if (this.isPromotion) {
            return this.isEdit ? 'Edit Promotion' : 'Create New Promotion';
        } else {
            return this.isEdit ? 'Edit Announcement' : 'Create New Announcement';
        }
    }

    getActionButtonText(): string {
        if (this.isPromotion) {
            return this.isEdit ? 'Save Changes' : 'Publish Promotion';
        } else {
            return this.isEdit ? 'Save Changes' : 'Publish Announcement';
        }
    }
}
