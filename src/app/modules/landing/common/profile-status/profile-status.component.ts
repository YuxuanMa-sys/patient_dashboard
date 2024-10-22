import { FuseCardComponent } from '@3DexCRM/components/card';
import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterLink } from '@angular/router';
import { AvailabilityModalComponent } from '../availability/availability.component';
import { MatDialog } from '@angular/material/dialog';
import { cloneDeep } from 'lodash';
import { environment } from 'environments/environment';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-profile-status',
  templateUrl: './profile-status.component.html',
  styleUrls: ['./profile-status.component.scss'],
  exportAs: 'profile-status',
  standalone: true,
  imports: [MatButtonModule, RouterLink, MatIconModule, FuseCardComponent, CommonModule,
    MatSlideToggleModule, MatDatepickerModule, ReactiveFormsModule, DatePipe,
    MatSelectModule,
    MatOptionModule,
    MatInputModule, MatProgressBarModule
  ],

  providers: [DatePipe]
})
export class ProfileStatusComponent {
  @Input() item: any;
  readonly url: string = environment.assets + 'utitlity/';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _matDialog: MatDialog,
  ) {

  }

  ngOnInit(): void {
  }

      /**
     * Open the note dialog
     */
      openAvailabilityDialog(data: any): void
      {
          this._matDialog.open(AvailabilityModalComponent, {
              autoFocus: false,
              data   :cloneDeep(data)
          });
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
            weekday: 'short',
            day: '2-digit',
            year: 'numeric',
          //   month: '2-digit'
          });
          const nextDateFormatted = formatter.format(nextDate);
        
          return nextDateFormatted;
        }

}
