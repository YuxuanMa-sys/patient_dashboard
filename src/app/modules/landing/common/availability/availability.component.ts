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


@Component({
    selector: 'availability',
    templateUrl: './availability.component.html',
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
        MatDatepickerModule, MatDividerModule, DatePipe, CommonModule],
    providers: [DatePipe]
})
export class AvailabilityModalComponent implements OnInit, OnDestroy {
    selectedAppointmentType: string = 'In-Person';
    selectedAvailability: string = 'Week';
    formValue = {};
    patients: any[] = [];
    staff: any[] = [];
    appointmentSlots: any[] = [];
    currentWeekRange: any;
    loading: boolean;
    error: string;
    operatingHours: any;
    operatingHoursVirtual: any;
    operatingHoursInPerson: any;
    form: FormGroup;
    availableSlots: any;
    familyMembers: any[];
    selectedSlot: any;
    selectedDay: string = 'Monday';
    selectedSlots: { [key: string]: any } = {};

    /**
     * Constructor
     */
    constructor(
        private _portalService: PortalService,
        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) private _data: { data: any },
        private _matDialogRef: MatDialogRef<AvailabilityModalComponent>,
        private _scrollStrategyOptions: ScrollStrategyOptions,
        private router: Router,
        private route: ActivatedRoute,
        private datePipe: DatePipe,
        private fb: FormBuilder,
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
            patientId: [null, Validators.required],
            doctorId: [null, Validators.required],
            appointmentType: ['In-Person', Validators.required],
            appointmentReason: [null, Validators.required],
            appointmentFor: ['self'],
            familyMemberId: [null],
            date: [''],
            selectedSlot: [null, Validators.required]
        });

        this.loadPatients();
        this.loadStaff();
        this.getOperatingHours();
        this.getOperatingHoursVirtual();
        this.onAppointmentTypeChange(this.selectedAppointmentType);
    }

    onAppointmentTypeChange(type: string): void {
        this.selectedAppointmentType = type;
        if (type === 'In-Person') {
            this._portalService.getOperatingHoursNew().subscribe((data: any) => {
                this.operatingHoursInPerson = data;
                this.generateSlotsForDays(data.operatingWeekDays, data, 'inPerson');
            });
        } else {
            this._portalService.getVirtualOperatingHours().subscribe((data: any) => {
                this.operatingHoursVirtual = data;
                this.generateSlotsForDays(data.operatingWeekDays, data.slots, 'virtual');
            });
        }
    }

    generateSlotsForDays(operatingDays: string[], data: any, type: 'inPerson' | 'virtual'): void {
        this.availableSlots = [];

        operatingDays.forEach(day => {
            const nextDate = this.getNextDateForDay(day);

            if (type === 'inPerson') {
                const daySlots = this.generateInPersonSlots(data, nextDate);
                this.availableSlots.push({ date: nextDate, slots: daySlots });
            } else if (type === 'virtual') {
                const daySlots = this.generateVirtualSlots(data, nextDate);
                this.availableSlots.push({ date: nextDate, slots: daySlots });
            }
        });

        this.cdr.detectChanges();
    }

    generateInPersonSlots(data: any, date: Date): any[] {
        const slots = [];
        const { startTime, endTime, appointmentDuration, midBreakStartTime, midBreakEndTime } = data;

        const startMinutes = this.convertTimeToMinutes(startTime);
        const endMinutes = this.convertTimeToMinutes(endTime);
        const midBreakStartMinutes = this.convertTimeToMinutes(midBreakStartTime);
        const midBreakEndMinutes = this.convertTimeToMinutes(midBreakEndTime);
        const currentMinutes = date.toDateString() === new Date().toDateString() ? this.convertTimeToMinutes(this.getCurrentTime()) : 0;

        for (let time = startMinutes; time < endMinutes; time += appointmentDuration) {
            const slotStart = this.convertMinutesToTime(time);
            const slotEnd = this.convertMinutesToTime(time + appointmentDuration);
            const isDisabled = (time >= midBreakStartMinutes && time < midBreakEndMinutes) || (date.toDateString() === new Date().toDateString() && time < currentMinutes);

            slots.push({
                startTime: slotStart,
                endTime: slotEnd,
                duration: appointmentDuration,
                isDisabled,
                date
            });
        }

        return slots;
    }

    generateVirtualSlots(slotsData: any[], date: Date): any[] {
        return slotsData.map(slot => ({
            ...slot,
            isDisabled: false,
            date: date,
        }));
    }

    getNextDateForDay(day: string): Date {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        const currentDay = today.getDay();
        const targetDay = daysOfWeek.indexOf(day);

        // Calculate how many days until the next occurrence of the target day
        const daysUntilNextOccurrence = (targetDay - currentDay + 7) % 7 || 7;
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntilNextOccurrence);

        return nextDate;
    }

    convertTimeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    convertMinutesToTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    getCurrentTime(): string {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    selectSlot(slot: any): void {
        console.log(slot);

        if (!slot.isDisabled) {
            // Convert `date` to a string format (e.g., ISO string) before patching to the form
            this.selectedSlots[slot.date.toDateString()] = slot;
            this.form.patchValue({
                selectedSlot: slot.startTime,
                date: slot.date.toISOString() // Convert to ISO string
            });
        }
    }



    async saveAppointment(): Promise<void> {
        console.log(this.form.value);

        if (this.form.valid) {
            const appointmentData = {
                ...this.form.value,
                date: this.form.value.date, // This will now be the ISO string of the date
                status: 'Upcoming'
            };

            console.log('Appointment saved:', appointmentData);
            await this._portalService.addAppointment(appointmentData);
        }
    }


    onPatientChange(patientId: string): void {
        this._portalService.getFamilyMembers(patientId).subscribe((family) => {
            this.familyMembers = family;
        });
    }

    loadPatients() {
        this._portalService.getPatients().subscribe({
            next: (data) => {
                if (data && data.length > 0) {
                    this.patients = data;  // Assign the fetched data to the data array

                }
                this.loading = false; // Turn off loading after data fetch
                this.cdr.detectChanges();
                console.log('Patients:', this.patients);
            },
            error: (err) => {
                console.error('Error fetching patients:', err);
                this.error = 'An error occurred while fetching patients.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadStaff() {
        this._portalService.getStaffList().subscribe({
            next: (res) => {
                // Step 1: Map and filter patients
                this.staff = res
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

    getOperatingHours() {
        this._portalService.getOperatingHoursNew().subscribe((data: any) => {
            if (data) {
                console.log(data);

                this.operatingHoursInPerson = data;

            }
        });
    }
    getOperatingHoursVirtual() {
        this._portalService.getVirtualOperatingHours().subscribe((data: any) => {
            if (data) {
                console.log(data);

                this.operatingHoursVirtual = data;

                // this.clinicOperatingHours.slots.forEach((slot: any, index: number) => {
                //     if (this.slotDetails.at(index)) {
                //         this.slotDetails.at(index).patchValue(slot);
                //     }
                // });
            }
        });
    }

    getCurrentWeekRange() {
        // Calculate and format current week range
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
