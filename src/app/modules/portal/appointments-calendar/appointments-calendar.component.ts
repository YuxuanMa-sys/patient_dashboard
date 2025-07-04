import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { PortalService } from '../portal.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-appointments-calendar',
  templateUrl: './appointments-calendar.component.html',
  styleUrls: ['./appointments-calendar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatOptionModule,
    MatCardModule
  ]
})
export class AppointmentsCalendarComponent implements OnInit, OnDestroy {
  // Calendar properties
  currentDate: Date = new Date('2021-07-22');
  currentView: 'day' | 'week' | 'month' = 'day';
  selectedDoctor: string = 'Dentist';
  
  // Search and filter properties
  searchQuery: string = '';
  dateFilter: Date | null = null;
  doctorFilter: string = '';
  appointmentTypeFilter: string = '';
  
  // Time slots for calendar
  timeSlots = [
    '08:00 am', '09:00 am', '10:00 am', '11:00 am', '12:00 pm', '01:00 pm'
  ];
  
  // Sample appointments data
  appointments = [
    {
      id: 1,
      patient: { 
        name: 'Ryan Siphron', 
        avatar: 'assets/images/avatars/male-01.jpg' 
      },
      doctor: { 
        name: 'Dr. Jamie Rivera' 
      },
      type: 'General Meeting',
      category: 'Virtual',
      time: '08:00 am',
      slot: 1,
      status: 'Active',
      issuesMentioned: ['Swollen Gums', 'Bad Breath', 'Tooth Pain']
    },
    {
      id: 2,
      patient: { 
        name: 'Hanna Stanton', 
        avatar: 'assets/images/avatars/female-01.jpg' 
      },
      doctor: { 
        name: 'Dr. Oliver Grant' 
      },
      type: 'General Meeting',
      category: 'Virtual',
      time: '08:00 am',
      slot: 4,
      status: 'Active'
    },
    {
      id: 3,
      patient: { 
        name: 'Paityn Culhane', 
        avatar: 'assets/images/avatars/female-02.jpg' 
      },
      doctor: { 
        name: 'Dr. John Doe' 
      },
      type: 'Cavity Filling',
      category: 'In-Person',
      time: '09:00 am',
      slot: 3,
      status: 'Active'
    },
    {
      id: 4,
      patient: { 
        name: 'Nolan Carder', 
        avatar: 'assets/images/avatars/male-02.jpg' 
      },
      doctor: { 
        name: 'Dr. Natasha Romanoff' 
      },
      type: 'General Meeting',
      category: 'Virtual',
      time: '10:00 am',
      slot: 1,
      status: 'Active'
    },
    {
      id: 5,
      patient: { 
        name: 'Maren Korsgaard', 
        avatar: 'assets/images/avatars/female-03.jpg' 
      },
      doctor: { 
        name: 'Dr. Natasha Romanoff' 
      },
      type: 'General Meeting',
      category: 'In-Person',
      time: '10:00 am',
      slot: 4,
      status: 'Active'
    },
    {
      id: 6,
      patient: { 
        name: 'Cristofer Levin', 
        avatar: 'assets/images/avatars/male-03.jpg' 
      },
      doctor: { 
        name: 'Dr. John Doe' 
      },
      type: 'General Meeting',
      category: 'In-Person',
      time: '11:00 am',
      slot: 1,
      status: 'Active'
    },
    {
      id: 7,
      patient: { 
        name: 'Angel Siphron', 
        avatar: 'assets/images/avatars/female-04.jpg' 
      },
      doctor: { 
        name: 'Dr. Rahul Sharma' 
      },
      type: 'Cavity Filling',
      category: 'Virtual',
      time: '11:00 am',
      slot: 5,
      status: 'Active'
    },
    {
      id: 8,
      patient: { 
        name: 'Carter Dorwart', 
        avatar: 'assets/images/avatars/male-04.jpg' 
      },
      doctor: { 
        name: 'Dr. Albert Johnson' 
      },
      type: 'Cavity Filling',
      category: 'Virtual',
      time: '12:00 pm',
      slot: 1,
      status: 'Active'
    },
    {
      id: 9,
      patient: { 
        name: 'Craig Dokidis', 
        avatar: 'assets/images/avatars/male-05.jpg' 
      },
      doctor: { 
        name: 'Dr. Rahul Sharma' 
      },
      type: 'General Meeting',
      category: 'In-Person',
      time: '12:00 pm',
      slot: 3,
      status: 'Active'
    },
    {
      id: 10,
      patient: { 
        name: 'Kianna Lipshutz', 
        avatar: 'assets/images/avatars/female-05.jpg' 
      },
      doctor: { 
        name: 'Dr. Oliver Grant' 
      },
      type: 'General Meeting',
      category: 'In-Person',
      time: '12:00 pm',
      slot: 5,
      status: 'Active'
    },
    {
      id: 11,
      patient: { 
        name: 'Alanah Rae', 
        avatar: 'assets/images/avatars/female-06.jpg' 
      },
      doctor: { 
        name: 'Dr. Albert Johnson' 
      },
      type: 'Cavity Filling',
      category: 'Virtual',
      time: '01:00 pm',
      slot: 4,
      status: 'Active'
    }
  ];
  
  // Available doctors for dropdown
  availableDoctors = [
    { name: 'Dr. Asfand Mendoza', id: 1 },
    { name: 'Dr. Talan Torff', id: 2 },
    { name: 'Dr. Davis Workman', id: 3 },
    { name: 'Dr. Omar Torff', id: 4 },
    { name: 'Dr. Skylar Westervelt', id: 5 },
    { name: 'Dr. Abram Dorwart', id: 6 },
    { name: 'Dr. Wilson Curtis', id: 7 },
    { name: 'Dr. Erin Carder', id: 8 }
  ];
  
  // Modal properties
  selectedAppointment: any = null;
  showAppointmentDetails: boolean = false;
  showChangeModal: boolean = false;
  showDoctorDropdown: boolean = false;
  
  // Form
  changeAppointmentForm: FormGroup;
  
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private portalService: PortalService,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private initializeForm(): void {
    this.changeAppointmentForm = this.fb.group({
      patientName: ['', Validators.required],
      doctor: ['', Validators.required],
      category: ['Virtual', Validators.required],
      date: ['03.07.21', Validators.required],
      time: ['06:00 pm', Validators.required],
      rescheduleMessage: ['Lorem ipsum dolor sit amet del partidos de algao fil madr filhaail mje bilkul nhi pta']
    });
  }

  // Calendar navigation
  getCurrentDateFormatted(): string {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return this.currentDate.toLocaleDateString('en-US', options);
  }

  previousDay(): void {
    this.currentDate = new Date(this.currentDate.getTime() - 24 * 60 * 60 * 1000);
  }

  nextDay(): void {
    this.currentDate = new Date(this.currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  setView(view: 'day' | 'week' | 'month'): void {
    this.currentView = view;
  }

  // Doctor selection
  toggleDoctorDropdown(): void {
    this.showDoctorDropdown = !this.showDoctorDropdown;
  }

  selectDoctor(doctor: string): void {
    this.selectedDoctor = doctor;
    this.showDoctorDropdown = false;
  }

  // Appointment management
  getAppointmentsForTimeSlot(time: string, slot: number): any[] {
    return this.appointments.filter(apt => apt.time === time && apt.slot === slot);
  }

  openAppointmentDetails(appointment: any): void {
    this.selectedAppointment = appointment;
    this.showAppointmentDetails = true;
  }

  closeAppointmentDetails(): void {
    this.showAppointmentDetails = false;
    this.selectedAppointment = null;
  }

  openChangeModal(): void {
    if (this.selectedAppointment) {
      this.showChangeModal = true;
      this.changeAppointmentForm.patchValue({
        patientName: this.selectedAppointment.patient.name,
        doctor: this.selectedAppointment.doctor.name,
        category: this.selectedAppointment.category
      });
    }
  }

  closeChangeModal(): void {
    this.showChangeModal = false;
    this.changeAppointmentForm.reset();
    this.initializeForm();
  }

  onChangeAppointment(): void {
    if (this.changeAppointmentForm.valid) {
      console.log('Changing appointment:', this.changeAppointmentForm.value);
      this.closeChangeModal();
      this.closeAppointmentDetails();
      alert('Appointment updated successfully!');
    }
  }

  // Action methods
  rescheduleAppointment(appointment: any): void {
    this.selectedAppointment = appointment;
    this.openChangeModal();
  }

  checkInAppointment(appointment: any): void {
    console.log('Checking in appointment:', appointment);
    alert('Patient checked in successfully!');
  }

  cancelAppointment(appointment: any): void {
    console.log('Canceling appointment:', appointment);
    alert('Appointment canceled successfully!');
  }

  // Utility methods
  getCategoryColor(category: string): string {
    switch (category) {
      case 'Virtual':
        return 'bg-blue-100 text-blue-800';
      case 'In-Person':
        return 'bg-green-100 text-green-800';
      case 'Teledentistry':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Search and filter methods
  onSearchChange(): void {
    // Implement search logic here
    console.log('Search query:', this.searchQuery);
  }

  onFilterChange(): void {
    // Implement filter logic here
    console.log('Filters:', {
      date: this.dateFilter,
      doctor: this.doctorFilter,
      type: this.appointmentTypeFilter
    });
  }

  openAddAppointmentModal(): void {
    // Implement add appointment modal logic
    console.log('Opening add appointment modal');
  }

  goToTableView(): void {
    // Navigate to table view
    console.log('Going to table view');
    window.location.href = '/portal/appointments-list';
  }
} 