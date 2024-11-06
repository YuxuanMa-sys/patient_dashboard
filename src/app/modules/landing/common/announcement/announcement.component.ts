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
    form: FormGroup;
    forOptions: string[] = ["Patient", "Staff", "Provider", "All"];
    typeOptions: string[] = ["Info", "Update", "News"];
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
            for: [null, Validators.required],
            type: [null, Validators.required],
            createdAt: new Date(),
        });

        this.single = this._data;
        console.log(this.single);

        if (this.single !== 'add') {
            this.imagePreviewUrl = this.single.image;
            this.single.createdAt = this.single.createdAt && this.single.createdAt.seconds ? new Date(this.single.createdAt.seconds * 1000) : null;
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



    async save(): Promise<void> {
        console.log(this.form.value);

        if (this.form.valid) {
            this.loading = true;

            const formData = {
                ...this.form.value,
            };

            if (this.single === 'add') {
                this._portalService.createAnnouncements(formData)
                    .then((res) => {
                        console.log('Patient created successfully with ID:', res.id);

                        this._matDialogRef.close({ ...res, id: res.id });
                        // Optionally, navigate or reload data if needed
                    })
                    .catch((error) => console.error('Error creating patient:', error));
            } else {

                this._portalService.updateAnnouncements(this.single.id, formData)
                    .then((res: any) => {
                        this._matDialogRef.close(res);
                        console.log('Patient updated successfully!'

                        )
                    })
                    .catch((error) => console.error('Error updating patient:', error));
            }

        }

    }



    close() {
        this._matDialogRef.close();
    }
    /**
    * On destroy
    */
    ngOnDestroy(): void {
        // // Unsubscribe from all subscriptions
        // this._unsubscribeAll.next(null);
        // this._unsubscribeAll.complete();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------



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
