import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PortalService } from '../../portal.service';
import { TextFieldModule } from '@angular/cdk/text-field';
import { NgIf, NgFor, CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { Timestamp } from 'firebase/firestore';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
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
        MatDatepickerModule,
        NgIf,
        NgFor,
        DatePipe,
        CommonModule
    ],
})
export class DetailsComponent implements OnInit {
    form: FormGroup;
    familyForm: FormGroup;
    appointments: any[] = [];
    languagesList: string[] = ["German", "Japanese", "Arabic", "Portuguese", "Hindi"]; // Common languages
    relationshipOptions = ["Father", "Mother", "Son", "Daughter", "Spouse"];

    appointmentHistory: any[] = [];
    familyData: any[] = [];
    patientId: string;
    isFamilyMember: boolean = false;
    familyMemberId: string | null;
    insuranceList: any[] = [];
    loading: boolean;
    error: string;
    contact: any;
    attachmentUrl: SafeUrl | null = null;
    selectedAttachment: File | null = null;
    selectedProfileImage: File | null = null;
    attachmentType: 'image' | 'video' | 'pdf' | 'other' | null = null;
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;

    constructor(
        private fb: FormBuilder,
        private _portalService: PortalService,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        // Try to get `patientId` from the current route
        this.patientId = this.route.snapshot.paramMap.get('id');
        this.familyMemberId = this.route.snapshot.paramMap.get('patientId'); // Optional for family member update

        // Use `parent` to access the full route path and detect if `family` is part of it
        (this.route.parent || this.route).url.subscribe((segments) => {
            // Check if 'family' is part of any segment
            this.isFamilyMember = segments.some(segment => segment.path === 'family');

            console.log('URL Segments:', segments);
            console.log('isFamilyMember:', this.isFamilyMember);

            // Initialize forms based on route context
            this.initializeForms();
            this.loadInsuranceOptions();

            // Decide which data to load based on context
            if (this.isFamilyMember) {
                if (this.familyMemberId) {
                    // Load family member details for update
                    this.loadFamilyMemberDetails();
                } else {
                    // It's a family member creation, so no data to load
                    console.log('Creating new family member');
                }
            } else {
                // Load main patient details
                this.loadPatientDetails();
            }
        });
    }



    initializeForms(): void {
        // Patient form
        this.form = this.fb.group({
            fname: [null, Validators.required],
            lname: [null, Validators.required],
            number: [null],
            profileImageUrl: [null],
            attachmentUrl: [null],
            dental_needs: [null],
            insurance: [null],
            email: [null],
            dob: [null],
            address: [null],
            notes: [null],
            gender: [null],
            languages: [null],
            profilePictureUrl: [null]
        });

        // Family member form
        this.familyForm = this.fb.group({
            fname: [null, Validators.required],
            lname: [null, Validators.required],
            number: [null],
            profileImageUrl: [null],
            attachmentUrl: [null],
            dental_needs: [null],
            insurance: [null],
            email: [null],
            dob: [null],
            address: [null],
            notes: [null],
            gender: [null],
            languages: [null],
            profilePictureUrl: [null],
            relationship: ['', Validators.required],
            patientId: [this.patientId]
        });
    }

    loadInsuranceOptions(): void {
        this._portalService.getInsuranceList().subscribe({
            next: (res) => {
                // Step 1: Map and filter patients

                this.insuranceList = res
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

    // Load patient details by ID
    loadPatientDetails(): void {
        this._portalService.getPatientById(this.patientId).subscribe((patient) => {
            if (patient) {
                console.log(patient);
                this.attachmentUrl = patient.attachmentUrl ?? null;
                this.contact = patient;
                this.selectedProfileImage = patient.profilePictureUrl ?? null;
                this.form.patchValue({
                    profileImageUrl: patient.profileImageUrl ?? null,
                    attachmentUrl: patient.attachmentUrl ?? null,
                    fname: patient.fname,
                    lname: patient.lname,
                    number: patient.number,
                    dental_needs: patient.dental_needs,
                    insurance: patient.insurance,
                    email: patient.email,
                    dob: patient.dob ? patient.dob.toDate() : null, // Convert timestamp to Date
                    address: patient.address,
                    notes: patient.notes,
                    gender: patient.gender,
                    languages: patient.languages,
                    profilePictureUrl: patient.profilePictureUrl,
                });
            }
        });
    }


    loadFamilyMemberDetails(): void {
        // Logic to load family member details by familyMemberId
        this._portalService.getFamilyMemberById(this.patientId, this.familyMemberId).subscribe((familyMember) => {
            if (familyMember) {
                this.familyForm.patchValue(familyMember);
            }
        });
    }

    // Load appointments by patient ID
    loadAppointments(): void {
        this._portalService.getAppointmentsByPatientId(this.patientId).subscribe({
            next: (appointments) => {
                this.appointments = appointments;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => console.error('Error fetching appointments:', error)
        });
    }

    loadPatientFamily() {
        this._portalService.getFamilyByPatientRef(`patients/${this.patientId}`).subscribe({
            next: (familyData) => {
                console.log(familyData);

                if (familyData.length) {
                    this.familyData = familyData[0].memberDetails;
                }
                this.cdr.detectChanges();
                console.log('Family data:', familyData);
            },
            error: (error) => {
                console.error('Error fetching family data:', error);
            },
        });
    }


    onAttachmentSelect(event: Event): void {
        const fileInput = event.target as HTMLInputElement;
        this.selectedAttachment = fileInput.files ? fileInput.files[0] : null;

        if (this.selectedAttachment) {
            const fileType = this.selectedAttachment.type;

            // Determine the type of the selected file
            if (fileType.startsWith('image')) {
                this.attachmentType = 'image';
            } else if (fileType.startsWith('video')) {
                this.attachmentType = 'video';
            } else if (fileType === 'application/pdf') {
                this.attachmentType = 'pdf';
            } else {
                this.attachmentType = 'other';
            }

            // Upload the selected attachment
            this._portalService.uploadFile(this.selectedAttachment, 'attachments', this.patientId).then((url) => {
                this.attachmentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
                console.log('Attachment uploaded with URL:', url);
                this._portalService.updatePatient(this.patientId, { attachmentUrl: url })
                    .then(() => {
                        console.log('Patient updated with new attachment URL!');
                        this.cdr.detectChanges();
                    })
                    .catch((error) => console.error('Error updating patient with attachment URL:', error));
            });
        }
    }

    async onProfileImageSelect(event: Event): Promise<void> {
        const fileInput = event.target as HTMLInputElement;
        this.selectedProfileImage = fileInput.files ? fileInput.files[0] : null;

        if (this.selectedProfileImage) {
            console.log("Uploading profile image:", this.selectedProfileImage);

            // Upload the selected image file
            const profilePictureUrl = await this._portalService.uploadFile(this.selectedProfileImage, 'profileImages', this.patientId);

            // Immediately update the patient's profile with the new image URL
            if (profilePictureUrl) {
                this.form.patchValue({ profilePictureUrl });
                if (this.patientId) {
                    this._portalService.updatePatient(this.patientId, { profilePictureUrl })
                        .then(() => {
                            this.contact.profilePictureUrl = profilePictureUrl;
                            console.log('Patient profile updated with new image URL!')
                            this.cdr.detectChanges(); // Ensure view updates
                        })
                        .catch((error) => console.error('Error updating patient with new image URL:', error));
                }
            }
        }
    }


    async uploadProfileImage(): Promise<void> {
        if (this.selectedProfileImage) {
            const profileImageUrl = await this._portalService.uploadFile(this.selectedProfileImage, 'profileImages', this.patientId);
            this.contact.profilePictureUrl = profileImageUrl; // Update to show instantly
            this.form.get('profilePictureUrl')?.setValue(profileImageUrl); // Patch form
            this.cdr.detectChanges(); // Ensure view updates
        }
    }


    onAddFamilyMember(): void {
        if (this.familyForm.valid) {
            const familyMemberData = this.familyForm.value;

            // Call service to add family member
            this._portalService.addFamilyMember(this.patientId, familyMemberData)
                .then(() => {
                    console.log('Family member added successfully!');
                    this.loadPatientFamily(); // Refresh the family members list
                })
                .catch((error) => {
                    console.error('Error adding family member:', error);
                });
        } else {
            console.error('Family form is invalid');
        }
    }

    async onSave(): Promise<void> {
        if (this.form.valid) {
            const patientData = this.form.value;
            if (patientData.dob) {
                patientData.dob = Timestamp.fromDate(new Date(patientData.dob));
            }

            // Check and upload selected attachment if any
            if (this.selectedAttachment) {
                patientData.attachmentUrl = await this._portalService.uploadFile(this.selectedAttachment, 'attachments', this.patientId);
            }

            if (this.patientId) {
                delete patientData.createdAt;
                // Update patient data in Firestore
                this._portalService.updatePatient(this.patientId, patientData)
                    .then(() => console.log('Patient updated successfully!'))
                    .catch((error) => console.error('Error updating patient:', error));
            } else {
                patientData.createdAt = Timestamp.fromDate(new Date());
                // Create a new patient
                this._portalService.createPatient(patientData)
                    .then((docRef) => {
                        console.log('Patient created successfully with ID:', docRef.id);
                        this.patientId = docRef.id; // Optionally set the new ID if needed in component
                    })
                    .catch((error) => console.error('Error creating patient:', error));
            }
        } else {
            console.error('Form is invalid');
        }
    }


    uploadAvatar(fileList: FileList): void {
        // Return if canceled
        if (!fileList.length) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        const file = fileList[0];

        // Return if the file is not allowed
        if (!allowedTypes.includes(file.type)) {
            return;
        }

        this._portalService.uploadFile(file, 'patient', this.patientId).then(() => {
            console.log('Patient updated successfully!');
        }).catch((error) => {
            console.error('Error updating patient:', error);
        });

    }

}
