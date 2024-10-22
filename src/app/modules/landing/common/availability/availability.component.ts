import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { debounceTime, map, Observable, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { LandingService } from '../../landing.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseScrollbarDirective } from '@3DexCRM/directives/scrollbar';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { environment } from 'environments/environment';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { DoctorService } from '../../listing/doctor-profile/doctor.service';
import { HomeService } from '../../home/home.service';

@Component({
    selector: 'availability',
    templateUrl: './availability.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatButtonModule, MatIconModule, FormsModule,
        TextFieldModule, NgFor, MatCheckboxModule,
        RouterLink, MatSelectModule,
        NgClass, MatRippleModule, MatMenuModule, MatDialogModule, AsyncPipe,
        MatDatepickerModule, MatDividerModule, MatRadioModule, DatePipe, CommonModule],
        providers: [DatePipe]
})
export class AvailabilityModalComponent implements OnInit, OnDestroy, AfterViewInit {
    readonly avatar: string = environment.cloudFront + 'public/users/profile/';
    readonly url: string = environment.assets + 'utitlity/';
    note$: Observable<any>;
    single: any;
    singleAvailibity: any;
    labels$: Observable<any[]>;
    buttonStatus: boolean;
    formValue = {};
    selectedAppointmentType: string = '';
    issues_seeking: any;
    selectedAvailability: string = '';
    services: any[];

    noteChanged: Subject<any> = new Subject<any>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    currentWeekRange: string;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) private _data: { data: any },
        private _matDialogRef: MatDialogRef<AvailabilityModalComponent>,
        private _scrollStrategyOptions: ScrollStrategyOptions,
        private router: Router,
        private route: ActivatedRoute,
        private _doctorService: LandingService,
        private datePipe: DatePipe
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.single = this._data;
        this.selectedAppointmentType = 'In-Person';
        this.selectedAvailability = 'Week';

        this.single.availabilities.sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });

        this._doctorService.services$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((res) => {
                this.services = res['data'];
                this.issues_seeking = this.services.length > 0 ? this.services[0].name : '';
                this._changeDetectorRef.markForCheck();
            });

            this.currentWeekRange = this.getCurrentWeekRange();

            
    }

    getCurrentWeekRange(): string {
        const currentDate = new Date();
        const currentDay = currentDate.getDay();
    
        // Calculate the start date of the current week starting from Tuesday
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - currentDay + (currentDay <= 2 ? 2 : 9));
    
        // Calculate the end date of the current week ending on Monday
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
    
        // Format the date range using the DatePipe
        const formattedStartDate = this.datePipe.transform(startDate, 'EEE, MMM d', 'en-US');
        const formattedEndDate = this.datePipe.transform(endDate, 'EEE, MMM d', 'en-US');
    
        return `${formattedStartDate} – ${formattedEndDate}`;
      }

    isSlotInNextWeek(day: string): string {
        const currentDate = new Date();

        // Calculate the date of the next occurrence of the specified day
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayIndex = days.indexOf(day);
        const daysUntilNextOccurrence = (currentDayIndex - currentDate.getDay() + 7) % 7;

        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + daysUntilNextOccurrence);

        // Manually format the date as "Mon, 23, 2022" using Intl.DateTimeFormat
        const formatter = new Intl.DateTimeFormat('en-US', {
            // weekday: 'short',
            // day: '2-digit',
            // year: 'numeric',
            // //   month: '2-digit'

            weekday: 'short',
            month: 'short',
            day: 'numeric',
        
        });
        const nextDateFormatted = formatter.format(nextDate);

        return nextDateFormatted;
    }


    dayOfWeekToNumber(day: string): number {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days.indexOf(day);
    }

    getFormattedDate(day: string): string {
        const currentDate = new Date();
        const daysUntilNextOccurrence = (this.dayOfWeekToNumber(day) - currentDate.getDay() + 7) % 7;
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + daysUntilNextOccurrence);

        const month = (nextDate.getMonth() + 1).toString().padStart(2, '0');
        const dayOfMonth = nextDate.getDate().toString().padStart(2, '0');
        const year = nextDate.getFullYear();

        return `${month}-${dayOfMonth}-${year}`;
    }


    close() {
        this._matDialogRef.close();
    }
    /**
    * On destroy
    */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {

    }

    getSlot(availability_id, slot_id, date, start_time, end_time, type) {
        this.buttonStatus = true;
        this.formValue = {
            "availability_id": availability_id,
            "availability_slot_id": slot_id,
            "dated": date,
            "start_time": start_time,
            "end_time": end_time,
            "type": type,
            'issues_seeking': this.issues_seeking
        }


        this.booknow();
    }

    booknow() {
        this._matDialogRef.close();
        this.router.navigate(['doctors/' + this.single.id + '/review'], {
            relativeTo: this.route,
            queryParams: this.formValue,
            queryParamsHandling: 'merge',
        });
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
