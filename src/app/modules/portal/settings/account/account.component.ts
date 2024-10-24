import { TextFieldModule } from '@angular/cdk/text-field';
import { NgClass, NgFor } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
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
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PortalService } from '../../portal.service';

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
        MatDatepickerModule,
        NgFor,
        NgClass
    ],
})
export class SettingsAccountComponent implements OnInit {
    reqForm: UntypedFormGroup;
    public weekDays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // weekDays = [
    //     { name: 'Monday', active: false },
    //     { name: 'Tuesday', active: false },
    //     { name: 'Wednesday', active: false },
    //     { name: 'Thursday', active: false },
    //     { name: 'Friday', active: false },
    //     { name: 'Saturday', active: false },
    //     { name: 'Sunday', active: false }
    // ];
    timeZones: string[] = ['UTC', 'GMT', 'CST', 'EST']; // Add your time zones
    clinicOperatingHours = {
        operatingWeekDays: [],
        startTime: '',
        endTime: '',
        slots: '',
        appointmentDuration: '',
        midBreakStartTime: '',
        midBreakEndTime: '',
        timezoneName: '',
    };
    public slots: { start_time: string; end_time: string; display: string }[] = [];
    public duration = [
        { name: '10 minutes', value: 10 },
        { name: '15 minutes', value: 15 },
        { name: '30 minutes', value: 30 },
        { name: '60 minutes', value: 60 },
        { name: '2 hours', value: 120 },
        { name: '3 hours', value: 180 }
    ]

    slotsTime: string[] = [
        '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
        '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
        '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ];
    /**
     * Constructor
     */
    constructor(private _formBuilder: UntypedFormBuilder,
        private _portalService: PortalService,
        private cdr: ChangeDetectorRef
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.reqForm = this._formBuilder.group({
            startTime: ['', Validators.required],
            endTime: ['', Validators.required],
            slots: ['', Validators.required],
            appointmentDuration: ['', Validators.required],
            midBreakStartTime: [''],
            midBreakEndTime: [''],
            timezoneName: ['']
        });


        this.reqForm.get('slots')?.valueChanges.subscribe(() => {
            this.generateAvailableSlots();
        });

        this.reqForm.get('startTime')?.valueChanges.subscribe(() => {
            this.generateAvailableSlots();
        });

        this.reqForm.get('endTime')?.valueChanges.subscribe(() => {
            this.generateAvailableSlots();
        });

        this.reqForm.get('appointmentDuration')?.valueChanges.subscribe(() => {
            this.generateAvailableSlots();
        });
    }

    onWeekClick(week: string): void {
        if (this.clinicOperatingHours.operatingWeekDays.includes(week)) {
            this.clinicOperatingHours.operatingWeekDays =
                this.clinicOperatingHours.operatingWeekDays.filter((w) => w !== week);
        } else {
            this.clinicOperatingHours.operatingWeekDays.push(week);
        }
    }




    generateAvailableSlots() {
        const startTime = this.reqForm.get('startTime')?.value;
        const endTime = this.reqForm.get('endTime')?.value;
        const slots = this.reqForm.get('slots')?.value;
        const appointmentDuration = this.reqForm.get('appointmentDuration')?.value;

        // Clear previous slots
        this.slots = [];

        if (startTime && endTime && slots && appointmentDuration) {
            const start = this.timeToMinutes(startTime);
            const end = this.timeToMinutes(endTime);
            const totalDuration = end - start;
            const duration = appointmentDuration;

            if (totalDuration > 0) {
                const slotDuration = Math.floor(totalDuration / slots);
                let currentTime = start;

                for (let i = 0; i < slots; i++) {
                    if (currentTime + duration <= end) {
                        const slotStart = this.minutesToTime(currentTime);
                        const slotEnd = this.minutesToTime(currentTime + duration);
                        this.slots.push({
                            start_time: slotStart,
                            end_time: slotEnd,
                            display: `${slotStart} - ${slotEnd}`
                        });
                        currentTime += slotDuration;
                    }
                }
            }
        }
    }


    timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    minutesToTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }



    getRange(start: number, end: number): number[] {
        const range: number[] = [];
        for (let i = start; i <= end; i++) {
            range.push(i);
        }
        return range;
    }


    saveClinicInfo() {
        if (this.reqForm.valid) {
            const finalPayload = {
                operatingWeekDays: this.clinicOperatingHours.operatingWeekDays,
                slots: this.reqForm.value.slots,
                startTime: this.reqForm.value.startTime,
                endTime: this.reqForm.value.endTime,
                appointmentDuration: this.reqForm.value.appointmentDuration,
                midBreakStartTime: this.reqForm.value.midBreakStartTime,
                midBreakEndTime: this.reqForm.value.midBreakEndTime,
                timezoneName: this.reqForm.value.timezoneName
            };


            console.log(finalPayload); // Output final payload to console
            // Save logic goes here

            this._portalService.saveOperatingHours(finalPayload)
            .then(() => {
                console.log('Data saved successfully');
                // Show success message here if needed
            })
            .catch((error) => {
                console.error('Error saving data:', error);
                // Show error message here if needed
            });
        }
    }
}
