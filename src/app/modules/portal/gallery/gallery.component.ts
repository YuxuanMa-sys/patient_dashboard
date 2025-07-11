import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormBuilder, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { PortalService } from '../portal.service';
// import { NotificationService } from '@fuse/services/notification';

@Component({
    selector: 'clinic-gallery',
    templateUrl: './gallery.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        NgIf,
        NgFor,
        MatSnackBarModule,
        DatePipe,
    ],
})
export class GalleryComponent implements OnInit, OnDestroy {
    @ViewChild('galleryFileInput') private _galleryFileInput: ElementRef;
    
    galleryForm: FormGroup;
    clinic: any;
    selectedFiles: any;
    uploadProgress: number;
    loading: boolean = true;
    error: string | null = null;
    
    // Gallery management
    galleryImages: any[] = [];
    selectedImage: any = null;
    showImageModal: boolean = false;
    dragOver: boolean = false;
    
    // Filter and search
    searchQuery: string = '';
    sortBy: 'date' | 'name' | 'size' = 'date';
    sortOrder: 'asc' | 'desc' = 'desc';
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _portalService: PortalService,
        // private _notificationService: NotificationService,
        private _snackBar: MatSnackBar,
        private fb: FormBuilder
    ) { }

    ngOnInit(): void {
        this.initializeForm();
        this.getData();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    initializeForm(): void {
        this.galleryForm = this.fb.group({
            gallery_collection: [[]]
        });
    }

    getData(): void {
        this.loading = true;
        this._portalService.getClinic().subscribe((data: any) => {
            if (data) {
                this.clinic = data;
                this.galleryImages = data?.gallery_collection || [];
                this.galleryForm.patchValue({
                    gallery_collection: this.galleryImages
                });
                this._changeDetectorRef.markForCheck();
            } else {
                this.error = 'No clinic data found.';
            }
            this.loading = false;
            this._changeDetectorRef.markForCheck();
        }, error => {
            console.error('Error fetching clinic data:', error);
            this.error = 'Failed to load gallery data.';
            this.loading = false;
            this._changeDetectorRef.markForCheck();
        });
    }

    onGallerySelected(event: any): void {
        this.selectedFiles = event.target.files as FileList;
        if (this.selectedFiles) {
            this.uploadImages();
        }
    }

    uploadImages(): void {
        if (!this.selectedFiles || !(this.selectedFiles instanceof FileList)) return;

        this.uploadProgress = 10;
        const files = Array.from(this.selectedFiles).filter(file =>
            file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
        );

        if (files.length === 0) {
            this._snackBar.open('No valid images selected. Please upload JPEG, PNG, or WebP images only.', 'Close', { duration: 3000 });
            return;
        }

        this._portalService.uploadFiles(files, 'clinic-gallery', this.clinic.id).then(
            (uploadedFiles) => {
                const currentGallery = this.galleryForm.get('gallery_collection').value || [];
                const newUrls = uploadedFiles.map(file => file.url);
                this.galleryImages = [...currentGallery, ...newUrls];
                this.galleryForm.get('gallery_collection').setValue(this.galleryImages);
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

    removeGalleryImage(index: number): void {
        const currentGallery = this.galleryForm.get('gallery_collection').value || [];
        currentGallery.splice(index, 1);
        this.galleryImages = [...currentGallery];
        this.galleryForm.get('gallery_collection').setValue(this.galleryImages);
        this._changeDetectorRef.detectChanges();
        this._snackBar.open('Image removed from gallery', 'Close', { duration: 3000 });
    }

    openImageModal(image: any): void {
        this.selectedImage = image;
        this.showImageModal = true;
    }

    closeImageModal(): void {
        this.selectedImage = null;
        this.showImageModal = false;
    }

    saveGallery(): void {
        const formData = this.galleryForm.value;
        const dataToSave = {
            gallery_collection: formData.gallery_collection || []
        };

        this._portalService.updateClinicDetails(dataToSave).then(() => {
            this._snackBar.open('Gallery updated successfully!', 'Close', { duration: 3000 });
            this.clinic = { ...this.clinic, ...dataToSave };
            this._changeDetectorRef.markForCheck();
        }).catch(error => {
            console.error('Error saving gallery:', error);
            const errorMessage = error.message || 'Failed to save gallery. Please try again.';
            this._snackBar.open(errorMessage, 'Close', { duration: 5000 });
        });
    }

    // Drag and drop functionality
    onDragOver(event: DragEvent): void {
        event.preventDefault();
        this.dragOver = true;
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        this.dragOver = false;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        this.dragOver = false;
        
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            this.selectedFiles = files;
            this.uploadImages();
        }
    }

    // Filter and search functionality
    get filteredImages(): any[] {
        let images = this.galleryImages;
        
        if (this.searchQuery) {
            images = images.filter(img => 
                img.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }
        
        // Sort images
        images.sort((a, b) => {
            if (this.sortOrder === 'asc') {
                return a.localeCompare(b);
            } else {
                return b.localeCompare(a);
            }
        });
        
        return images;
    }

    // Utility methods
    getImageSize(url: string): string {
        // This would typically get the actual file size
        // For now, return a placeholder
        return '2.5 MB';
    }

    getImageDate(url: string): Date {
        // This would typically get the actual upload date
        // For now, return current date
        return new Date();
    }

    trackByFn(index: number, item: any): any {
        return item || index;
    }
} 