import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-appointment-request-detail-modal',
  templateUrl: './appointment-request-detail-modal.component.html',
  styleUrls: ['./appointment-request-detail-modal.component.scss']
})
export class AppointmentRequestDetailModalComponent {
  selectedDoctor: string = '';

  // Available doctors for assignment
  availableDoctors = [
    { id: 1, name: 'Dr. Jamie Garcia', specialization: 'General Dentistry' },
    { id: 2, name: 'Dr. Olivia Wilde', specialization: 'Orthodontics' },
    { id: 3, name: 'Dr. Anderson Phillips', specialization: 'Oral Surgery' },
    { id: 4, name: 'Dr. Maddison May', specialization: 'Pediatric Dentistry' },
    { id: 5, name: 'Dr. Martin Odegaard', specialization: 'Periodontics' }
  ];

  constructor(
    private _matDialogRef: MatDialogRef<AppointmentRequestDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datePipe: DatePipe
  ) {}

  formatDateTime(date: Date): string {
    if (!date) return '';
    
    // Format to match: "03.07.21 | 06:00 pm"
    const formattedDate = this.datePipe.transform(date, 'dd.MM.yy');
    const formattedTime = this.datePipe.transform(date, 'hh:mm a');
    
    return `${formattedDate} | ${formattedTime}`;
  }

  confirmAppointment(): void {
    // Handle appointment confirmation
    console.log('Confirming appointment with doctor:', this.selectedDoctor);
    this._matDialogRef.close(true);
  }

  declineAppointment(): void {
    // Handle appointment decline
    console.log('Declining appointment');
    this._matDialogRef.close(false);
  }

  close(): void {
    this._matDialogRef.close();
  }
} 