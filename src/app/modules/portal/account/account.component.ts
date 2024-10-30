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
        NgFor
    ],
})
export class SettingsAccountComponent implements OnInit {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
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
            name: [],
            description: [
            ],
            email: ['', Validators.email],
            phone: [''],
            address: [''],
            county: [''],
            gallery_main: [null],
            gallery_collection: [null],
            country: [''],
            state: [''],
            city: [''],
            zipcode: [],
            language: ['english'],
        });
        this.getData();
    }

    getData() {
        this._portalService.getClinic().subscribe((data: any) => {
            if (data) {
                this.clinic = data;
                console.log(data);

                this.accountForm.patchValue({
                    name: data?.name,
                    description: data?.description,
                    email: data?.email,
                    phone: data?.phoneNumber,
                    address: data?.address?.address,
                    country: data?.address?.country,
                    state: data?.address?.state,
                    city: data?.address?.city,
                    zipcode: data?.address?.zipcode,
                    gallery_main: data?.gallery_main,
                    gallery_collection: data?.gallery_collection
                });
            }
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

    onFileSelect(event: any): void {
        this.selectedFiles = event.target.files as FileList;
        if (this.selectedFiles) {
            this.uploadImages();
        }
    }

    uploadAvatar(files: FileList): void {
        if (!files.length) return;
        const file = files[0];
        const allowedTypes = ['image/jpeg', 'image/png'];

        if (!allowedTypes.includes(file.type)) {
            console.log('Invalid file type.');
            return;
        }

        // this._portalService.uploadImage(file).subscribe(
        //     (uploadedImageUrl) => {
        //         this.accountForm.get('gallery_main').setValue(uploadedImageUrl);
        //         this._changeDetectorRef.markForCheck();
        //     },
        //     error => console.error('Avatar upload error:', error)
        // );
    }

    uploadImages(): void {
        if (!this.selectedFiles || !(this.selectedFiles instanceof FileList)) return;

        this.uploadProgress = 0;
        const formData = new FormData();
        Array.from(this.selectedFiles).forEach((file: File) => formData.append('images[]', file, file.name));

        // this._portalService.uploadGallery(formData).subscribe(
        //     (images: string[]) => {
        //         this.accountForm.get('gallery_collection').setValue(images);
        //         this.uploadProgress = null;
        //         this._changeDetectorRef.detectChanges();
        //     },
        //     error => {
        //         console.error('Error uploading images:', error);
        //         this.uploadProgress = null;
        //         this._changeDetectorRef.detectChanges();
        //     }
        // );
    }

}
