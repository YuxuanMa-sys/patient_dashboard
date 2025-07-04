import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-appointment-request-detail-modal',
  templateUrl: './appointment-request-detail-modal.component.html',
  styleUrls: ['./appointment-request-detail-modal.component.scss']
})
export class AppointmentRequestDetailModalComponent {
  selectedDoctor: string = '';

  constructor(
    private _matDialogRef: MatDialogRef<AppointmentRequestDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

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