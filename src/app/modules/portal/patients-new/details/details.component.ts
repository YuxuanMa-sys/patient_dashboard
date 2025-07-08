import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PortalService } from '../../portal.service';
import { NgIf, NgFor, CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ClinicStatus } from 'app/_enums/clinicStatus.enum';

@Component({
    selector: 'app-new-patient-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
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
export class NewPatientDetailsComponent implements OnInit, OnDestroy {
    patientRequest: any = null;
    patientId: string;
    loading: boolean = true;
    error: string | null = null;
    private destroy$ = new Subject<void>();

    // Mock additional request data if not available from API
    requestDetails = {
        preferredAppointmentTime: 'Morning (9:00 AM - 12:00 PM)',
        reasonForJoining: 'Looking for a reliable healthcare provider in the area',
        previousDoctor: 'Dr. Smith at City Medical Center',
        emergencyContact: {
            name: 'John Doe',
            relation: 'Spouse',
            phone: '+1-555-0123'
        },
        insurance: {
            provider: 'HealthCare Plus',
            policyNumber: 'HP123456789',
            groupNumber: 'GRP001'
        },
        allergies: ['Penicillin', 'Peanuts'],
        medications: ['Lisinopril 10mg daily', 'Metformin 500mg twice daily'],
        medicalHistory: 'Hypertension, Type 2 Diabetes'
    };

    constructor(
        private route: ActivatedRoute,
        private _portalService: PortalService,
        private cdr: ChangeDetectorRef,
        private _router: Router
    ) { }

    ngOnInit(): void {
        // Subscribe to route parameter changes
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
            if (params['id']) {
                this.patientId = params['id'];
                this.loadPatientRequestDetails();
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadPatientRequestDetails(): void {
        this.loading = true;
        this._portalService.getPatientById(this.patientId).subscribe({
            next: (patient) => {
                if (patient) {
                    this.patientRequest = patient;
                    this.loading = false;
                    this.cdr.detectChanges();
                    console.log('Patient request details:', patient);
                } else {
                    this.error = 'Patient request not found';
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            },
            error: (error) => {
                console.error('Error fetching patient request:', error);
                this.error = 'Error loading patient request details';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Get patient avatar URL with fallback
     */
    getPatientAvatar(patient: any): string {
        if (patient?.profilePictureUrl) {
            return patient.profilePictureUrl;
        }
        
        // Use default avatars based on gender
        const defaultAvatars = [
            'images/avatars/male-01.jpg',
            'images/avatars/female-01.jpg',
            'images/avatars/male-02.jpg',
            'images/avatars/female-02.jpg'
        ];
        
        const index = patient?.id ? patient.id.length % defaultAvatars.length : 0;
        return defaultAvatars[index];
    }

    /**
     * Handle image loading errors
     */
    onImageError(event: any): void {
        event.target.src = 'images/avatars/male-01.jpg';
    }

    /**
     * Approve patient request and convert to active patient
     */
    approvePatientRequest(): void {
        if (this.patientRequest) {
            const updateData = {
                status: ClinicStatus.ACTIVE,
                approvedAt: new Date(),
                approvedBy: 'Current Doctor' // In real app, get from auth service
            };

            this._portalService.updatePatient(this.patientId, updateData)
                .then(() => {
                    console.log('Patient request approved successfully');
                    // Navigate back to new patients list
                    this._router.navigate(['/portal/new-patients']);
                })
                .catch((error) => {
                    console.error('Error approving patient request:', error);
                    this.error = 'Error approving patient request';
                    this.cdr.detectChanges();
                });
        }
    }

    /**
     * Reject patient request
     */
    rejectPatientRequest(): void {
        if (this.patientRequest) {
            const updateData = {
                status: 'Rejected',
                rejectedAt: new Date(),
                rejectedBy: 'Current Doctor' // In real app, get from auth service
            };

            this._portalService.updatePatient(this.patientId, updateData)
                .then(() => {
                    console.log('Patient request rejected successfully');
                    // Navigate back to new patients list
                    this._router.navigate(['/portal/new-patients']);
                })
                .catch((error) => {
                    console.error('Error rejecting patient request:', error);
                    this.error = 'Error rejecting patient request';
                    this.cdr.detectChanges();
                });
        }
    }

    /**
     * Navigate back to new patients list
     */
    goBack(): void {
        this._router.navigate(['/portal/new-patients']);
    }

    /**
     * Format date for display
     */
    formatDate(date: any): string {
        if (!date) return 'N/A';
        if (date.toDate) {
            return date.toDate().toLocaleDateString();
        }
        return new Date(date).toLocaleDateString();
    }

    /**
     * Get patient age
     */
    getPatientAge(dob: any): string {
        if (!dob) return 'N/A';
        
        const birthDate = dob.toDate ? dob.toDate() : new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return (age - 1).toString();
        }
        
        return age.toString();
    }
} 