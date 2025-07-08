import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { MatDialogModule } from '@angular/material/dialog';
import { Timestamp } from 'firebase/firestore';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PatientService } from '../patients.service';
import { Subject, takeUntil } from 'rxjs';

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
        MatDialogModule,
        NgIf,
        NgFor,
        DatePipe,
        CommonModule,
        RouterLink
    ],
})
export class DetailsComponent implements OnInit, OnDestroy {
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

    // New properties for the redesigned UI
    showEditForm: boolean = false;
    showAppointmentDetails: boolean = false;
    selectedAppointment: any = null;
    displayAppointments: any[] = [];
    isEditing: boolean = false;
    data: any[] = []; // Store all patients for family relationships
    private destroy$ = new Subject<void>(); // For subscription cleanup

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
        this.initializeForms();
        this.loadInsuranceOptions();
        
        // Subscribe to route parameter changes to handle navigation between different patients
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
            console.log('Route params changed:', params);
            
            // Reset component state
            this.resetComponentState();
            
            // Determine if this is a family member route
            this.isFamilyMember = this._router.url.includes('/family/');
            
            // Extract patient ID and family member ID from URL
            if (params['id']) {
                this.patientId = params['id'];
            }
            if (params['patientId'] && this.isFamilyMember) {
                this.familyMemberId = params['patientId'];
            }

            // Load appropriate data based on route type
            if (this.patientId && !this.isFamilyMember) {
                this.loadPatientDetails();
                this.loadAppointments();
                this.loadPatientFamily();
                this.loadAllPatients(); // Load all patients for family relationships
                
                // Initialize display appointments with sample data
                this.initializeDisplayAppointments();
            } else if (this.familyMemberId && this.isFamilyMember) {
                this.loadFamilyMemberDetails();
            } else if (!this.patientId) {
                // This is a new patient creation, don't load family data
                console.log('Creating new patient - no family data loaded');
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    resetComponentState(): void {
        // Reset all component state variables
        this.contact = null;
        this.familyData = [];
        this.appointments = [];
        this.displayAppointments = [];
        this.attachmentUrl = null;
        this.selectedAttachment = null;
        this.selectedProfileImage = null;
        this.attachmentType = null;
        this.showEditForm = false;
        this.showAppointmentDetails = false;
        this.selectedAppointment = null;
        this.isEditing = false;
        this.loading = false;
        this.error = null;
        
        // Reset forms
        this.initializeForms();
    }

    initializeForms(): void {
        // Patient form
        this.form = this.fb.group({
            fname: [null, Validators.required],
            lname: [null, Validators.required],
            phone: [null],
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
            status: ['Active'],
            createdAt: new Date(),
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

    loadPatientDetails(): void {
        this._portalService.getPatientById(this.patientId).subscribe((patient) => {
            if (patient) {
                console.log(patient);
                this.attachmentUrl = patient.attachmentUrl ?? null;
                this.contact = patient;
                this.selectedProfileImage = patient.profilePictureUrl ?? null;

                // Convert dob only if it exists and is a Firestore timestamp
                const dob = patient.dob && patient.dob.seconds ? new Date(patient.dob.seconds * 1000) : null;

                this.form.patchValue({
                    profileImageUrl: patient.profileImageUrl ?? null,
                    attachmentUrl: patient.attachmentUrl ?? null,
                    fname: patient.fname,
                    lname: patient.lname,
                    number: patient.number,
                    dental_needs: patient.dental_needs,
                    insurance: patient.insurance,
                    email: patient.email,
                    dob: dob, // Set dob if valid, else null
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
            // Load all patients first to create family relationships
            this._portalService.getPatients().subscribe({
                next: (patients) => {
                    this.data = patients;
                    this.initializeFamilyData();
                    
                    // Find the specific family member from our initialized data
                    const familyMember = this.familyData.find(fm => fm.familyMemberId === this.familyMemberId);
                    
                    if (familyMember) {
                        this.contact = {
                            id: familyMember.familyMemberId,
                            fname: familyMember.fname,
                            lname: familyMember.lname,
                            email: familyMember.email,
                            phone: familyMember.phone,
                            dob: familyMember.dob,
                            gender: familyMember.gender,
                            address: familyMember.address,
                            notes: familyMember.notes,
                            status: familyMember.status,
                            languages: 'English',
                            relationship: familyMember.relationship,
                            profilePictureUrl: familyMember.profilePictureUrl,
                            createdAt: familyMember.dob // Use their DOB as a mock created date
                        };
                        
                        // Update the form with family member data
                        this.familyForm.patchValue({
                            fname: familyMember.fname,
                            lname: familyMember.lname,
                            email: familyMember.email,
                            phone: familyMember.phone,
                            dob: familyMember.dob?.toDate ? familyMember.dob.toDate() : null,
                            gender: familyMember.gender,
                            address: familyMember.address,
                            notes: familyMember.notes,
                            languages: 'English',
                            relationship: familyMember.relationship,
                            profilePictureUrl: familyMember.profilePictureUrl
                        });
                        
                        this.cdr.detectChanges();
                        console.log('Family member details loaded:', familyMember);
                    } else {
                        // Fallback: try to load the patient directly
                        const directPatient = patients.find(p => p.id === this.familyMemberId);
                        if (directPatient) {
                            this.contact = directPatient;
                            this.familyForm.patchValue({
                                fname: directPatient.fname,
                                lname: directPatient.lname,
                                email: directPatient.email,
                                phone: directPatient.phone || directPatient.number,
                                dob: directPatient.dob?.toDate ? directPatient.dob.toDate() : null,
                                gender: directPatient.gender,
                                address: directPatient.address,
                                notes: directPatient.notes,
                                languages: directPatient.languages || 'English',
                                relationship: 'Family Member',
                                profilePictureUrl: directPatient.profilePictureUrl
                            });
                            this.cdr.detectChanges();
                        } else {
                            console.error('Family member not found');
                        }
                    }
                },
                error: (error) => console.error('Error loading patients for family member:', error)
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

    /**
     * Load all patients for family relationship creation
     */
    loadAllPatients(): void {
        this._portalService.getPatients().subscribe({
            next: (patients) => {
                this.data = patients;
                // Initialize family relationships after loading patients
                this.initializeFamilyData();
                this.cdr.detectChanges();
            },
            error: (error) => console.error('Error fetching all patients:', error)
        });
    }

    onAttachmentSelect(event: Event): void {
        const fileInput = event.target as HTMLInputElement;
        this.selectedAttachments = fileInput.files ? Array.from(fileInput.files) : [];
        this.uploadAttachments();
        // Optionally, you can handle file type determination here if needed.
    }

    async uploadAttachments(): Promise<void> {
        if (this.selectedAttachments.length) {
            try {
                // Upload files and get an array of objects with URL, type, and name
                const uploadedFiles = await this._portalService.uploadFiles(this.selectedAttachments, 'attachments', this.patientId);

                // Update the local attachment array immediately for real-time display
                this.contact.attachmentUrls = [
                    ...(this.contact.attachmentUrls || []), // Include existing attachments
                    ...uploadedFiles // Append new uploaded files
                ];

                // Prepare data with updated array of attachments to save in Firestore
                const data = { attachmentUrls: this.contact.attachmentUrls };

                // Update Firestore for patient or family member
                if (this.isFamilyMember && this.familyMemberId) {
                    await this._portalService.updateFamilyMember(this.patientId, this.familyMemberId, data);
                    console.log('Attachments uploaded for family member!');
                } else {
                    await this._portalService.updatePatient(this.patientId, data);
                    console.log('Attachments uploaded for patient!');
                }

                // Clear selected files after upload
                this.selectedAttachments = [];

                // Trigger change detection to update the view immediately
                this.cdr.detectChanges();
            } catch (error) {
                console.error('Error uploading attachments:', error);
            }
        }
    }

    async onProfileImageSelect(event: Event): Promise<void> {
        const fileInput = event.target as HTMLInputElement;
        this.selectedProfileImage = fileInput.files ? fileInput.files[0] : null;

        if (this.selectedProfileImage) {
            // For new patients, we'll store the file and upload when the patient is created
            if (!this.patientId) {
                // Create a preview URL for immediate display
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (this.contact) {
                        this.contact.profilePictureUrl = e.target?.result as string;
                    } else {
                        this.contact = { profilePictureUrl: e.target?.result as string };
                    }
                    this.cdr.detectChanges();
                };
                reader.readAsDataURL(this.selectedProfileImage);
                
                // Update form for when patient is created
                this.form.patchValue({ profilePictureUrl: 'pending-upload' });
                this.familyForm.patchValue({ profilePictureUrl: 'pending-upload' });
            } else {
                // For existing patients, upload immediately
                const profilePictureUrl = await this._portalService.uploadFile(this.selectedProfileImage, 'profileImages', this.patientId);

                if (profilePictureUrl) {
                    this.form.patchValue({ profilePictureUrl });
                    this.familyForm.patchValue({ profilePictureUrl });
                    this.updateAttachmentUrl(profilePictureUrl, 'profilePictureUrl');
                }
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
            try {
                // Upload the image and get the download URL
                const profileImageUrl = await this._portalService.uploadFile(this.selectedProfileImage, 'profileImages', this.patientId);

                if (profileImageUrl) {
                    // Update the form and contact with the new profile picture URL
                    this.form.patchValue({ profilePictureUrl: profileImageUrl });
                    this.familyForm.patchValue({ profilePictureUrl: profileImageUrl });
                    this.contact.profilePictureUrl = profileImageUrl; // Update local `contact` data for immediate display

                    // Trigger change detection to update the view immediately
                    this.cdr.detectChanges();

                    // Optional: Update the Firestore database
                    this.updateAttachmentUrl(profileImageUrl, 'profilePictureUrl');
                }
            } catch (error) {
                console.error('Error uploading profile image:', error);
            }
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

    deleteFamilyMember(familyMemberId: string): void {
        if (confirm('Are you sure you want to delete this family member?')) {
            this._portalService.deleteFamilyMember(this.patientId, familyMemberId)
                .then(() => {
                    console.log('Family member deleted successfully!');
                    // Refresh the family data to remove the deleted member
                    this.loadPatientFamily();
                })
                .catch((error) => console.error('Error deleting family member:', error));
        }
    }

    async onSave(): Promise<void> {
        const formToUse = this.isFamilyMember ? this.familyForm : this.form;
        if (formToUse.valid) {
            const data = formToUse.value;

            // Only set dob if it has a valid value
            if (data.dob) {
                data.dob = Timestamp.fromDate(new Date(data.dob));
            }

            if (this.selectedAttachment) {
                data.attachmentUrl = await this._portalService.uploadFile(this.selectedAttachment, 'attachments', this.patientId);
            }

            if (this.isFamilyMember) {
                if (this.familyMemberId) {
                    // Updating a family member
                    this._portalService.updateFamilyMember(this.patientId, this.familyMemberId, data)
                        .then(() => console.log('Family member updated successfully!'))
                        .catch((error) => console.error('Error updating family member:', error));
                } else {
                    // Creating a new family member
                    this._portalService.addFamilyMember(this.patientId, data)
                        .then(() => {
                            this._router.navigate(['/portal/patients/' + this.patientId + '/details']);
                            console.log('Family member created successfully!')
                        })
                        .catch((error) => console.error('Error creating family member:', error));
                }
            } else {
                if (this.patientId) {
                    // Updating an existing patient
                    this._portalService.updatePatient(this.patientId, data)
                        .then(() => console.log('Patient updated successfully!'))
                        .catch((error) => console.error('Error updating patient:', error));
                } else {
                    // const smsCode = prompt("Kripya apne phone pe aayi SMS verification code daalein:");

                    // try {
                    //     const createdPatient = await this._portalService.createPatientWithPhone(data, smsCode);
                    //     console.log('Patient created successfully with ID:', createdPatient.id);
                    //     this.patientId = createdPatient.id;
                    //     this.loadPatientDetails(); // Agar aap refresh ya navigate karna chahte hain
                    // } catch (error) {
                    //     console.error('Error creating patient:', error);
                    // }
                    const userPassword = '123456'; // Default password for new patients

                    this._portalService.createPatientWithAuth(data, userPassword)
                        .then(async (createdPatient) => {
                            console.log('Patient and Auth user created successfully with ID:', createdPatient.id);
                            this.patientId = createdPatient.id; // For further updates, if needed

                            // Upload profile image if one was selected
                            if (this.selectedProfileImage) {
                                try {
                                    const profilePictureUrl = await this._portalService.uploadFile(this.selectedProfileImage, 'profileImages', this.patientId);
                                    if (profilePictureUrl) {
                                        await this._portalService.updatePatient(this.patientId, { profilePictureUrl });
                                        console.log('Profile image uploaded successfully');
                                    }
                                } catch (error) {
                                    console.error('Error uploading profile image:', error);
                                }
                            }

                            // Optionally, reload or navigate
                            this.loadPatientDetails();
                        })
                        .catch((error) => console.error('Error creating patient with Auth:', error));



                    // Creating a new patient
                    this._portalService.createPatient(data)
                        .then(async (createdPatient) => {
                            console.log('Patient created successfully with ID:', createdPatient.id);
                            this.patientId = createdPatient.id; // Set patientId here for further updates

                            // Upload profile image if one was selected
                            if (this.selectedProfileImage) {
                                try {
                                    const profilePictureUrl = await this._portalService.uploadFile(this.selectedProfileImage, 'profileImages', this.patientId);
                                    if (profilePictureUrl) {
                                        await this._portalService.updatePatient(this.patientId, { profilePictureUrl });
                                        console.log('Profile image uploaded successfully');
                                    }
                                } catch (error) {
                                    console.error('Error uploading profile image:', error);
                                }
                            }

                            // Optionally, navigate or reload data if needed
                            this.loadPatientDetails(); // Refresh patient details if required
                        })
                        .catch((error) => console.error('Error creating patient:', error));
                }
            }
        } else {
            console.error('Form is invalid');
        }
    }

    getFileType(url: string): string {
        const extension = url.split('.').pop()?.toLowerCase();
        if (!extension) return 'other';

        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            return 'image';
        } else if (['pdf'].includes(extension)) {
            return 'pdf';
        } else if (['mp4', 'mov', 'avi'].includes(extension)) {
            return 'video';
        } else {
            return 'other';
        }
    }

    getFileIcon(type: string | undefined): string {
        if (!type) return 'text-gray-500'; // Default icon color if type is undefined
        switch (type.toUpperCase()) {
            case 'PDF': return 'text-red-600';
            case 'DOC': return 'text-blue-600';
            case 'XLS': return 'text-green-600';
            case 'TXT': return 'text-gray-600';
            case 'JPG': return 'text-amber-600';
            default: return 'text-gray-500';
        }
    }

    getFileIconName(type: string | undefined): string {
        if (!type) return 'insert_drive_file'; // Default icon if type is undefined
        switch (type.toUpperCase()) {
            case 'PDF': return 'picture_as_pdf';
            case 'DOC': return 'description';
            case 'XLS': return 'table_chart';
            case 'TXT': return 'text_snippet';
            case 'JPG': return 'image';
            default: return 'insert_drive_file';
        }
    }

    getFileTypeColor(type: string | undefined): string {
        if (!type) return 'bg-gray-500'; // Default color if type is undefined
        switch (type.toUpperCase()) {
            case 'PDF': return 'bg-red-600';
            case 'DOC': return 'bg-blue-600';
            case 'XLS': return 'bg-green-600';
            case 'TXT': return 'bg-gray-600';
            case 'JPG': return 'bg-amber-600';
            default: return 'bg-gray-500';
        }
    }

    /**
     * Initialize display appointments with sample data matching the screenshots
     */
    initializeDisplayAppointments(): void {
        this.displayAppointments = [
            {
                type: 'General Checkup',
                doctor: 'Dr. Jamie Garcia',
                date: '03.07.21',
                time: '06:00 pm',
                reason: 'Lorem ipsum dolor sit amet del partidos de algao fil madr filhaail mje bilkul nhi pta'
            },
            {
                type: 'General Checkup',
                doctor: 'Dr. Jamie Garcia',
                date: '03.07.21',
                time: '06:00 pm',
                reason: 'Lorem ipsum dolor sit amet del partidos de algao fil madr filhaail mje bilkul nhi pta'
            },
            {
                type: 'General Checkup',
                doctor: 'Dr. Jamie Garcia',
                date: '03.07.21',
                time: '06:00 pm',
                reason: 'Lorem ipsum dolor sit amet del partidos de algao fil madr filhaail mje bilkul nhi pta'
            },
            {
                type: 'General Checkup',
                doctor: 'Dr. Jamie Garcia',
                date: '03.07.21',
                time: '06:00 pm',
                reason: 'Lorem ipsum dolor sit amet del partidos de algao fil madr filhaail mje bilkul nhi pta'
            },
            {
                type: 'General Checkup',
                doctor: 'Dr. Jamie Garcia',
                date: '03.07.21',
                time: '06:00 pm',
                reason: 'Lorem ipsum dolor sit amet del partidos de algao fil madr filhaail mje bilkul nhi pta'
            },
            {
                type: 'General Checkup',
                doctor: 'Dr. Jamie Garcia',
                date: '03.07.21',
                time: '06:00 pm',
                reason: 'Lorem ipsum dolor sit amet del partidos de algao fil madr filhaail mje bilkul nhi pta'
            },
            {
                type: 'General Checkup',
                doctor: 'Dr. Jamie Garcia',
                date: '03.07.21',
                time: '06:00 pm',
                reason: 'Lorem ipsum dolor sit amet del partidos de algao fil madr filhaail mje bilkul nhi pta'
            },
            {
                type: 'General Checkup',
                doctor: 'Dr. Jamie Garcia',
                date: '03.07.21',
                time: '06:00 pm',
                reason: 'Lorem ipsum dolor sit amet del partidos de algao fil madr filhaail mje bilkul nhi pta'
            }
        ];
    }

    /**
     * Initialize family relationships among existing patients
     */
    initializeFamilyData(): void {
        // Only create family relationships if we have actual patients and this is not the first patient
        if (this.data && this.data.length > 2) {
            this.createFamilyRelationships();
        } else {
            // Load patients first, then create relationships
            this._portalService.getPatients().subscribe({
                next: (patients) => {
                    this.data = patients;
                    if (patients.length > 2) {
                        this.createFamilyRelationships();
                    }
                },
                error: (error) => console.error('Error fetching patients for family relationships:', error)
            });
        }
    }

    /**
     * Create bidirectional family relationships among existing patients
     */
    createFamilyRelationships(): void {
        if (!this.data || this.data.length < 3) return;

        // Get current patient index
        const currentPatientIndex = this.data.findIndex(p => p.id === this.patientId);
        if (currentPatientIndex === -1) return;

        // Create relationships based on patient position
        const relationshipMap = this.buildRelationshipMap(currentPatientIndex);
        
        // Filter patients that have relationships with current patient
        this.familyData = this.data
            .filter(patient => relationshipMap[patient.id])
            .map(patient => ({
                familyMemberId: patient.id,
                fname: patient.fname,
                lname: patient.lname,
                relationship: relationshipMap[patient.id],
                dob: patient.dob,
                profilePictureUrl: patient.profilePictureUrl,
                gender: patient.gender,
                phone: patient.phone || patient.number,
                email: patient.email,
                address: patient.address,
                notes: patient.notes,
                status: patient.status || 'Active'
            }));

        this.cdr.detectChanges();
    }

    /**
     * Build bidirectional relationship map
     */
    buildRelationshipMap(currentIndex: number): { [patientId: string]: string } {
        const relationshipMap: { [patientId: string]: string } = {};
        
        // Define family structure patterns
        const familyPatterns = [
            // Pattern 1: Parent-Child relationships
            { 0: 'Father', 1: 'Son', 2: 'Daughter' },
            // Pattern 2: Spouse-Child relationships  
            { 0: 'Spouse', 1: 'Father', 2: 'Mother' },
            // Pattern 3: Sibling relationships
            { 0: 'Brother', 1: 'Sister', 2: 'Brother' }
        ];

        // Select pattern based on available patients
        const patternIndex = currentIndex % familyPatterns.length;
        const selectedPattern = familyPatterns[patternIndex];

        // Apply relationships to available patients
        let patientIndex = 0;
        for (let i = 0; i < this.data.length && patientIndex < 3; i++) {
            if (i !== currentIndex && patientIndex < 2) { // Skip current patient, limit to 2 family members
                relationshipMap[this.data[i].id] = selectedPattern[patientIndex + 1]; // +1 because 0 is current patient
                patientIndex++;
            }
        }

        return relationshipMap;
    }

    /**
     * Generate patient ID for display
     */
    generatePatientId(): string {
        return this.contact?.id?.substring(0, 6) || '332142';
    }

    /**
     * Get last active date for app status
     */
    getLastActiveDate(): string {
        return '23.06.21 | 12:34 pm';
    }

    /**
     * Get patient avatar URL with fallback (same logic as list component)
     */
    getPatientAvatar(patient: any): string {
        if (patient?.profilePictureUrl) {
            return patient.profilePictureUrl;
        }
        
        // For new patients (no ID), return empty string to trigger placeholder
        if (!patient?.id || !this.patientId) {
            return '';
        }
        
        // Use different default avatars based on gender or randomly for existing patients
        const defaultAvatars = [
            'images/avatars/male-01.jpg',
            'images/avatars/female-01.jpg',
            'images/avatars/male-02.jpg',
            'images/avatars/female-02.jpg',
            'images/avatars/male-03.jpg',
            'images/avatars/female-03.jpg'
        ];
        
        // Use patient ID to consistently assign the same default avatar
        const index = patient?.id ? patient.id.length % defaultAvatars.length : 0;
        return defaultAvatars[index];
    }

    /**
     * Get family member avatar URL with fallback
     */
    getFamilyMemberAvatar(familyMember: any): string {
        if (familyMember?.profilePictureUrl) {
            return familyMember.profilePictureUrl;
        }
        
        // Use different default avatars based on gender
        const maleAvatars = [
            'images/avatars/male-01.jpg',
            'images/avatars/male-02.jpg',
            'images/avatars/male-03.jpg'
        ];
        
        const femaleAvatars = [
            'images/avatars/female-01.jpg',
            'images/avatars/female-02.jpg',
            'images/avatars/female-03.jpg'
        ];
        
        const avatars = familyMember?.gender === 'Male' ? maleAvatars : femaleAvatars;
        const index = familyMember?.familyMemberId ? familyMember.familyMemberId.length % avatars.length : 0;
        return avatars[index];
    }

    /**
     * Handle image loading errors
     */
    onImageError(event: any): void {
        // Fallback to a default avatar if image fails to load
        event.target.src = 'images/avatars/male-01.jpg';
    }

    /**
     * Open new patient form
     */
    openNewPatientForm(): void {
        this._router.navigate(['/portal/patients/create']);
    }

    /**
     * Debug family member navigation
     */
    debugFamilyMemberNavigation(family: any): void {
        console.log('Family member clicked:', family);
        console.log('Family member ID:', family.familyMemberId);
        console.log('Navigation URL:', `/portal/patients/${family.familyMemberId}/details`);
        
        // Navigate to the family member's patient details page
        this._router.navigate(['/portal/patients/' + family.familyMemberId + '/details']);
    }

    /**
     * Open edit form modal
     */
    openEditForm(): void {
        this.isEditing = true;
        this.showEditForm = true;
        
        // Populate form with current contact data
        if (this.contact) {
            if (this.isFamilyMember) {
                // Populate family form for family members
                this.familyForm.patchValue({
                    fname: this.contact.fname,
                    lname: this.contact.lname,
                    phone: this.contact.phone || this.contact.number,
                    email: this.contact.email,
                    address: this.contact.address,
                    notes: this.contact.notes,
                    gender: this.contact.gender,
                    languages: this.contact.languages,
                    relationship: this.contact.relationship,
                    dob: this.contact.dob?.toDate ? this.contact.dob.toDate() : null
                });
            } else {
                // Populate main form for regular patients
                this.form.patchValue({
                    fname: this.contact.fname,
                    lname: this.contact.lname,
                    phone: this.contact.phone || this.contact.number,
                    email: this.contact.email,
                    address: this.contact.address,
                    notes: this.contact.notes,
                    gender: this.contact.gender,
                    languages: this.contact.languages,
                    insurance: this.contact.insurance,
                    dental_needs: this.contact.dental_needs,
                    dob: this.contact.dob?.toDate ? this.contact.dob.toDate() : null
                });
            }
        }
    }

    /**
     * Close edit form modal
     */
    closeEditForm(): void {
        this.isEditing = false;
        this.showEditForm = false;
    }

    /**
     * Save edited patient data
     */
    saveEditedPatient(): void {
        const formToUse = this.isFamilyMember ? this.familyForm : this.form;
        
        if (formToUse.valid) {
            const updatedData = formToUse.value;
            
            if (this.isFamilyMember && this.familyMemberId) {
                // Update family member
                this._portalService.updateFamilyMember(this.patientId, this.familyMemberId, updatedData)
                    .then(() => {
                        console.log('Family member updated successfully');
                        this.loadFamilyMemberDetails(); // Refresh the data
                        this.closeEditForm();
                    })
                    .catch((error) => {
                        console.error('Error updating family member:', error);
                    });
            } else {
                // Update main patient
                this._portalService.updatePatient(this.patientId, updatedData)
                    .then(() => {
                        console.log('Patient updated successfully');
                        this.loadPatientDetails(); // Refresh the data
                        this.closeEditForm();
                    })
                    .catch((error) => {
                        console.error('Error updating patient:', error);
                    });
            }
        }
    }

    /**
     * Open appointment details modal
     */
    openAppointmentDetails(appointment: any): void {
        this.selectedAppointment = appointment;
        this.showAppointmentDetails = true;
    }

    /**
     * Close appointment details modal
     */
    closeAppointmentDetails(): void {
        this.showAppointmentDetails = false;
        this.selectedAppointment = null;
    }
}
