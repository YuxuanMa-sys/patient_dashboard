import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.scss']
})
export class WeekViewComponent implements OnInit {
  @Input() appointments: any[] = [];
  @Input() doctors: any[] = [];
  @Input() currentWeekStartDate: Date;

  weekDays: Date[] = [];
  timeSlots: string[] = [];
  maxCards: number = 3;

  ngOnInit() {
    this.generateWeekDays();
    this.generateTimeSlots();
  }

  generateWeekDays() {
    const start = new Date(this.currentWeekStartDate);
    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  generateTimeSlots() {
    // Example: 8am to 8pm, every hour
    this.timeSlots = Array.from({ length: 13 }, (_, i) => `${8 + i}:00`);
  }

  isToday(day: Date): boolean {
    const today = new Date();
    return day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear();
  }

  getAppointments(day: Date, time: string): any[] {
    // Filter appointments for this day and time slot
    return this.appointments.filter(appt => {
      const apptDate = new Date(appt.date);
      return apptDate.getDate() === day.getDate() &&
             apptDate.getMonth() === day.getMonth() &&
             apptDate.getFullYear() === day.getFullYear() &&
             appt.time === time;
    });
  }
} 