import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
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
import { PatientService } from '../patients.service';

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
        CommonModule,
        RouterLink
    ],
})
export class DetailsComponent implements OnInit {
    form: FormGroup;
    familyForm: FormGroup;
    appointments: any[] = [];
    languagesList: string[] = ["English", "German", "Japanese", "Arabic", "Portuguese", "Hindi"]; // Common languages
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
    familyDataMain: any;
    selectedAttachments: File[] = [];

    constructor(
        private fb: FormBuilder,
        private _portalService: PortalService,
        private _patientService: PatientService,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
        private _router: Router
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
                this.loadPatientFamily();
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
            relationship: [''],
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
        if (this.familyMemberId) {
          this._portalService.getFamilyMemberById(this.patientId, this.familyMemberId)
            .subscribe((familyMember) => {
                this.contact = familyMember;
              if (familyMember) {
                // this.familyForm.patchValue(familyMember);

                this.familyForm.patchValue({
                    profileImageUrl: familyMember.profileImageUrl ?? null,
                    attachmentUrl: familyMember.attachmentUrl ?? null,
                    fname: familyMember.fname,
                    lname: familyMember.lname,
                    number: familyMember.number,
                    dental_needs: familyMember.dental_needs,
                    insurance: familyMember.insurance,
                    email: familyMember.email,
                    dob: familyMember.dob ? familyMember.dob.toDate() : null, // Convert timestamp to Date
                    address: familyMember.address,
                    notes: familyMember.notes,
                    gender: familyMember.gender,
                    languages: familyMember.languages,
                    profilePictureUrl: familyMember.profilePictureUrl,
                    relationship: familyMember.relationship,
                });
                this.cdr.detectChanges();
                console.log('Family member details loaded:', familyMember);
              } else {
                console.error('Family member not found');
              }
            });
        }
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

    loadPatientFamily(): void {
        this._portalService.getFamilyMembers(this.patientId).subscribe({
          next: (familyData) => {
            this.familyData = familyData; // Store retrieved family members in component
            this.cdr.detectChanges();
            console.log('Family data:', familyData);
          },
          error: (error) => console.error('Error fetching family data:', error),
        });
      }

    onAttachmentSelect(event: Event): void {
        const fileInput = event.target as HTMLInputElement;
        this.selectedAttachment = fileInput.files ? fileInput.files[0] : null;

        if (this.selectedAttachment) {
            const fileType = this.selectedAttachment.type;
            this.attachmentType = fileType.startsWith('image') ? 'image' :
                fileType.startsWith('video') ? 'video' :
                    fileType === 'application/pdf' ? 'pdf' : 'other';

            // Upload attachment and update the URL
            this._portalService.uploadFile(this.selectedAttachment, 'attachments', this.patientId).then((url) => {
                this.attachmentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
                this.updateAttachmentUrl(url);
            });
        }
    }

    async onProfileImageSelect(event: Event): Promise<void> {
        const fileInput = event.target as HTMLInputElement;
        this.selectedProfileImage = fileInput.files ? fileInput.files[0] : null;

        if (this.selectedProfileImage) {
            const profilePictureUrl = await this._portalService.uploadFile(this.selectedProfileImage, 'profileImages', this.patientId);

            if (profilePictureUrl) {
                this.form.patchValue({ profilePictureUrl });
                this.familyForm.patchValue({ profilePictureUrl });
                this.updateAttachmentUrl(profilePictureUrl, 'profilePictureUrl');
            }
        }
    }

    updateAttachmentUrl(url: string, field: 'attachmentUrl' | 'profilePictureUrl' = 'attachmentUrl'): void {
        const data = { [field]: url };

        // Call the appropriate update method based on context (patient or family member)
        if (this.isFamilyMember && this.familyMemberId) {
            this._portalService.updateFamilyMember(this.patientId, this.familyMemberId, data)
                .then(() => {
                    console.log(`${field} updated successfully for family member!`);
                    this.cdr.detectChanges();
                })
                .catch((error) => console.error(`Error updating ${field} for family member:`, error));
        } else {
            this._portalService.updatePatient(this.patientId, data)
                .then(() => {
                    console.log(`${field} updated successfully for patient!`);
                    this.cdr.detectChanges();
                })
                .catch((error) => console.error(`Error updating ${field} for patient:`, error));
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

          this._portalService.addFamilyMember(this.patientId, familyMemberData)
            .then(() => {
              console.log('Family member added successfully!');
              this._router.navigate(['/portal/patients/' + this.patientId + '/details']);
            //   this.loadPatientFamily(); // Refresh the family members list
            })
            .catch((error) => console.error('Error adding family member:', error));
        } else {
          console.error('Family form is invalid');
        }
      }


    async onSave(): Promise<void> {
        const formToUse = this.isFamilyMember ? this.familyForm : this.form;
        if (formToUse.valid) {
            const data = formToUse.value;
            if (data.dob) {
                data.dob = Timestamp.fromDate(new Date(data.dob));
            }

            if (this.selectedAttachment) {
                data.attachmentUrl = await this._portalService.uploadFile(this.selectedAttachment, 'attachments', this.patientId);
            }

            if (this.isFamilyMember) {
                if (this.familyMemberId) {
                    this._portalService.updateFamilyMember(this.patientId, this.familyMemberId, data)
                        .then(() => console.log('Family member updated successfully!'))
                        .catch((error) => console.error('Error updating family member:', error));
                } else {
                    this._portalService.addFamilyMember(this.patientId, data)
                        .then(() => {
                            this._router.navigate(['/portal/patients/' + this.patientId + '/details']);
                            console.log('Family member created successfully!')
                        })
                        .catch((error) => console.error('Error creating family member:', error));
                }
            } else {
                if (this.patientId) {
                    this._portalService.updatePatient(this.patientId, data)
                        .then(() => console.log('Patient updated successfully!'))
                        .catch((error) => console.error('Error updating patient:', error));
                } else {
                    this._portalService.createPatient(data)
                        .then((docRef) => {
                            console.log('Patient created successfully with ID:', docRef.id);
                            this.patientId = docRef.id;
                        })
                        .catch((error) => console.error('Error creating patient:', error));
                }
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
