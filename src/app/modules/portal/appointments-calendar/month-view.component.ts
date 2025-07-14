import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.scss']
})
export class MonthViewComponent implements OnInit {
  @Input() appointments: any[] = [];
  @Input() currentMonth: Date;

  monthWeeks: Date[][] = [];
  weekDays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  ngOnInit() {
    this.generateMonthGrid();
  }

  generateMonthGrid() {
    const start = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const end = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    let current = new Date(start);
    current.setDate(current.getDate() - ((current.getDay() + 6) % 7)); // Start from Monday
    this.monthWeeks = [];
    while (current <= end || this.monthWeeks.length < 5) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      this.monthWeeks.push(week);
    }
  }

  isToday(day: Date): boolean {
    const today = new Date();
    return day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear();
  }

  isCurrentMonth(day: Date): boolean {
    return day.getMonth() === this.currentMonth.getMonth();
  }

  getAppointments(day: Date): any[] {
    return this.appointments.filter(appt => {
      const apptDate = new Date(appt.date);
      return apptDate.getDate() === day.getDate() &&
             apptDate.getMonth() === day.getMonth() &&
             apptDate.getFullYear() === day.getFullYear();
    });
  }
} 