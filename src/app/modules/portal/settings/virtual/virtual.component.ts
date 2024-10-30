import { TextFieldModule } from '@angular/cdk/text-field';
import { NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
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
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'settings-virtual',
    templateUrl: './virtual.component.html',
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
        MatCheckboxModule,
        NgFor,
        NgClass,
        NgIf
    ],
})
export class SettingsVirtualComponent implements OnInit {
    reqForm: FormGroup;
    public weekDays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    timeZones: string[] = ['UTC', 'GMT', 'CST', 'EST']; // Add your time zones
    clinicOperatingHours = {
        operatingWeekDays: [],
        numberOfSlots: 0, // Set as a number instead of a string
        isSameForAllDays: false,
        slots: []
    };

    slots: { startTime: string; duration: string }[] = [];

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
    loading: boolean;
    operatingHours: any;
    /**
     * Constructor
     */
    constructor(private _formBuilder: UntypedFormBuilder,
        private _portalService: PortalService,
        private fb: FormBuilder,
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
        this.reqForm = this.fb.group({
            operatingWeekDays: [[]],
            isSameForAllDays: [false],
            numberOfSlots: [''],
            slotDetails: this.fb.array([]) // FormArray for slots
        });

        this.reqForm.get('numberOfSlots')?.valueChanges.subscribe((value) => {
            this.updateSlots(value);
        });

        this.getOperatingHours();
    }

    // Getter for FormArray of slots
    get slotDetails(): FormArray {
        return this.reqForm.get('slotDetails') as FormArray;
    }

    // Function to update slots based on numberOfSlots value
    updateSlots(numberOfSlots: number) {
        // Clear existing slots
        this.slotDetails.clear();
        this.slots = Array.from({ length: numberOfSlots });

        // Add a form group for each slot
        for (let i = 0; i < numberOfSlots; i++) {
            this.slotDetails.push(
                this.fb.group({
                    startTime: [''],
                    duration: ['']
                })
            );
        }
    }

    getOperatingHours() {
        this._portalService.getVirtualOperatingHours().subscribe((data: any) => {
            if (data) {
                this.clinicOperatingHours = data;
                this.reqForm.patchValue({
                    numberOfSlots: this.clinicOperatingHours.numberOfSlots || '',
                    isSameForAllDays: this.clinicOperatingHours.isSameForAllDays || false,
                    operatingWeekDays: this.clinicOperatingHours.operatingWeekDays || []
                });

                // Update the slots in the form
                this.updateSlots(this.clinicOperatingHours.numberOfSlots);
                this.clinicOperatingHours.slots.forEach((slot: any, index: number) => {
                    if (this.slotDetails.at(index)) {
                        this.slotDetails.at(index).patchValue(slot);
                    }
                });
            }
        });
    }


    onWeekClick(week: string) {
        // Toggle the selected state of the week in clinicOperatingHours.operatingWeekDays
        if (this.clinicOperatingHours.operatingWeekDays.includes(week)) {
            this.clinicOperatingHours.operatingWeekDays = this.clinicOperatingHours.operatingWeekDays.filter(
                (day) => day !== week
            );
        } else {
            this.clinicOperatingHours.operatingWeekDays.push(week);
        }

        // Update the form control with the new array of selected days
        this.reqForm.get('operatingWeekDays')?.setValue(this.clinicOperatingHours.operatingWeekDays);
    }


    generateAvailableSlots() {
        const numberOfSlots = this.reqForm.get('numberOfSlots')?.value;

        this.slots = [];
        for (let i = 0; i < numberOfSlots; i++) {
            this.slots.push({
                startTime: '', // This will be updated with user input
                duration: '' // This will be updated with user input
            });
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

    saveClinicInfo() {
        if (this.reqForm.valid) {
            const slots = this.slotDetails.value.map((slot: any) => ({
                startTime: slot.startTime,
                duration: slot.duration
            }));

            const finalPayload = {
                operatingWeekDays: this.reqForm.value.operatingWeekDays,
                isSameForAllDays: this.reqForm.value.isSameForAllDays,
                numberOfSlots: this.reqForm.value.numberOfSlots,
                slots: slots
            };

            console.log(finalPayload);

            this._portalService.saveVirtualOperatingHours(finalPayload)
                .then(() => console.log('Data saved successfully'))
                .catch((error) => console.error('Error saving data:', error));
        }
    }

}
