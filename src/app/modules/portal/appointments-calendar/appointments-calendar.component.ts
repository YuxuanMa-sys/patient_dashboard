import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PortalService } from '../portal.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
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
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatNativeDateModule,
    MatOptionModule,
    MatCardModule
  ]
})
export class AppointmentsCalendarComponent implements OnInit, OnDestroy {
  // Modal properties
  selectedAppointment: any = null;
  showAppointmentDetails: boolean = false;
  showChangeModal: boolean = false;
  showDoctorDropdown: boolean = false;
  showRescheduleModal: boolean = false;
  rescheduleMessage: string = '';
  showAddModal: boolean = false;
  addAppointmentForm: FormGroup;
  selectedReasons: string[] = ['Tooth Pain', 'Swollen Gums', 'Bad Breath'];
  
  // Expanded cards tracking
  expandedCards: Set<number> = new Set();
  
  // Filtered appointments
  filteredAppointments: any[] = [];
  
  // Filter properties
  searchQuery: string = '';
  dateFilter: string = '';
  doctorFilter: string = '';
  appointmentTypeFilter: string = '';
  
  // Calendar properties
  currentView: string = 'day';
  selectedDoctor: string = 'All Doctors';
  currentDate: Date = new Date();
  
  // Available doctors
  availableDoctors = [
    { name: 'All Doctors', avatar: 'images/avatars/male-01.jpg', id: 0 },
    { name: 'Dr. Jamie Rivera', avatar: 'images/avatars/female-01.jpg', id: 1 },
    { name: 'Dr. Oliver Grant', avatar: 'images/avatars/male-02.jpg', id: 2 },
    { name: 'Dr. John Doe', avatar: 'images/avatars/male-03.jpg', id: 3 },
    { name: 'Dr. Natasha Romanoff', avatar: 'images/avatars/female-02.jpg', id: 4 },
    { name: 'Dr. Rahul Sharma', avatar: 'images/avatars/male-04.jpg', id: 5 },
    { name: 'Dr. Albert Johnson', avatar: 'images/avatars/male-05.jpg', id: 6 }
  ];
  
  // Time slots
  timeSlots = [
    '08:00 am', '09:00 am', '10:00 am', '11:00 am', 
    '12:00 pm', '01:00 pm', '02:00 pm', '03:00 pm', 
    '04:00 pm', '05:00 pm', '06:00 pm'
  ];
  
  // Sample appointments data
  appointments = [
    {
      id: 1,
      patient: { name: 'Ryan Siphron' },
      doctor: { name: 'Dr. Jamie Rivera' },
      type: 'General Meeting',
      category: 'Virtual',
      time: '08:00 am',
      slot: 1,
      issuesMentioned: ['Tooth Pain', 'Swollen Gums', 'Bad Breath']
    },
    {
      id: 2,
      patient: { name: 'Hanna Stanton' },
      doctor: { name: 'Dr. Oliver Grant' },
      type: 'General Meeting',
      category: 'Virtual',
      time: '08:00 am',
      slot: 4
    },
    {
      id: 3,
      patient: { name: 'Nolan Carder' },
      doctor: { name: 'Dr. Natasha Romanoff' },
      type: 'General Meeting',
      category: 'Virtual',
      time: '10:00 am',
      slot: 1
    },
    {
      id: 4,
      patient: { name: 'Paityn Culhane' },
      doctor: { name: 'Dr. John Doe' },
      type: 'Cavity Filling',
      category: 'In-Person',
      time: '09:00 am',
      slot: 3,
      issuesMentioned: ['Swollen Gums', 'Bad Breath', 'Tooth Pain']
    },
    {
      id: 5,
      patient: { name: 'Maren Korsgaard' },
      doctor: { name: 'Dr. Natasha Romanoff' },
      type: 'General Meeting',
      category: 'In-Person',
      time: '10:00 am',
      slot: 4
    },
    {
      id: 6,
      patient: { name: 'Cristofer Levin' },
      doctor: { name: 'Dr. John Doe' },
      type: 'General Meeting',
      category: 'In-Person',
      time: '11:00 am',
      slot: 1
    },
    {
      id: 7,
      patient: { name: 'Angel Siphron' },
      doctor: { name: 'Dr. Rahul Sharma' },
      type: 'Cavity Filling',
      category: 'Virtual',
      time: '11:00 am',
      slot: 5,
      issuesMentioned: ['Cavity', 'Tooth Sensitivity']
    },
    {
      id: 8,
      patient: { name: 'Carter Dorwart' },
      doctor: { name: 'Dr. Albert Johnson' },
      type: 'Cavity Filling',
      category: 'Virtual',
      time: '12:00 pm',
      slot: 1
    },
    {
      id: 9,
      patient: { name: 'Craig Dokidis' },
      doctor: { name: 'Dr. Rahul Sharma' },
      type: 'General Meeting',
      category: 'In-Person',
      time: '12:00 pm',
      slot: 2
    },
    {
      id: 10,
      patient: { name: 'Kianna Lipshutz' },
      doctor: { name: 'Dr. Oliver Grant' },
      type: 'General Meeting',
      category: 'In-Person',
      time: '12:00 pm',
      slot: 5
    },
    {
      id: 11,
      patient: { name: 'Alanah Rae' },
      doctor: { name: 'Dr. Albert Johnson' },
      type: 'Cavity Filling',
      category: 'Virtual',
      time: '01:00 pm',
      slot: 4,
      issuesMentioned: ['Tooth Pain', 'Cavity']
    }
  ];
  
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private portalService: PortalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.initializeAddForm();
  }

  ngOnInit(): void {
    this.filteredAppointments = [...this.appointments];
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
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
    return this.filteredAppointments.filter(apt => apt.time === time && apt.slot === slot);
  }

  toggleCardExpansion(appointmentId: number): void {
    if (this.expandedCards.has(appointmentId)) {
      this.expandedCards.delete(appointmentId);
    } else {
      this.expandedCards.add(appointmentId);
    }
  }

  isCardExpanded(appointmentId: number): boolean {
    return this.expandedCards.has(appointmentId);
  }

  // Action methods
  rescheduleAppointment(appointment: any): void {
    this.selectedAppointment = appointment;
    this.rescheduleMessage = 'Lorem ipsum dolor set amit del partido de algao fil madr filhaal mje bilkul nhi pta';
    this.showRescheduleModal = true;
  }

  checkInAppointment(appointment: any): void {
    console.log('Checking in appointment:', appointment);
    // Handle check-in logic here
  }

  cancelAppointment(appointment: any): void {
    console.log('Canceling appointment:', appointment);
    // Handle cancel logic here
  }

  // Reschedule modal methods
  closeRescheduleModal(): void {
    this.showRescheduleModal = false;
    this.selectedAppointment = null;
    this.rescheduleMessage = '';
  }

  confirmReschedule(): void {
    console.log('Confirming reschedule for:', this.selectedAppointment);
    console.log('Reschedule message:', this.rescheduleMessage);
    // Handle reschedule confirmation logic here
    this.closeRescheduleModal();
    alert('Appointment rescheduled successfully!');
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
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.appointments];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.patient.name.toLowerCase().includes(query) ||
        apt.doctor.name.toLowerCase().includes(query) ||
        apt.type.toLowerCase().includes(query)
      );
    }

    // Apply doctor filter
    if (this.doctorFilter) {
      filtered = filtered.filter(apt => apt.doctor.name === this.doctorFilter);
    }

    // Apply appointment type filter
    if (this.appointmentTypeFilter) {
      filtered = filtered.filter(apt => apt.type === this.appointmentTypeFilter);
    }

    // Apply date filter (if implemented)
    if (this.dateFilter) {
      // Add date filtering logic if needed
    }

    this.filteredAppointments = filtered;
  }

  getDoctorAvatar(doctorName: string): string {
    const doctor = this.availableDoctors.find(d => d.name === doctorName);
    return doctor?.avatar || 'images/avatars/male-01.jpg';
  }

  getDoctorColor(doctorName: string): string {
    const doctorColors = [
      'bg-blue-50 border border-blue-200',     // Dr. Jamie Rivera
      'bg-green-50 border border-green-200',   // Dr. Oliver Grant  
      'bg-purple-50 border border-purple-200', // Dr. John Doe
      'bg-pink-50 border border-pink-200',     // Dr. Natasha Romanoff
      'bg-yellow-50 border border-yellow-200', // Dr. Rahul Sharma
      'bg-red-50 border border-red-200',       // Dr. Albert Johnson
      'bg-indigo-50 border border-indigo-200'  // Additional color
    ];

    const doctor = this.availableDoctors.find(d => d.name === doctorName);
    if (doctor && doctor.id > 0) {
      return doctorColors[(doctor.id - 1) % doctorColors.length];
    }
    return 'bg-gray-50 border border-gray-200';
  }

  openAddAppointmentModal(): void {
    this.showAddModal = true;
  }

  goToTableView(): void {
    this.router.navigate(['/portal/appointments-list/upcoming']);
  }

  // Add appointment modal methods
  closeAddModal(): void {
    this.showAddModal = false;
    this.addAppointmentForm.reset();
    this.selectedReasons = ['Tooth Pain', 'Swollen Gums', 'Bad Breath']; // Reset to default
    this.initializeAddForm();
  }

  onAddAppointment(): void {
    if (this.addAppointmentForm.valid) {
      const appointmentData = {
        ...this.addAppointmentForm.value,
        reasonsForVisit: this.selectedReasons
      };
      console.log('Adding appointment:', appointmentData);
      
      // Here you would typically call a service to save the appointment
      // For now, we'll just close the modal
      this.closeAddModal();
      
      // Show success message or handle the response
      alert('Appointment added successfully!');
    }
  }

  // Tag functionality methods
  addReason(event: KeyboardEvent): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    
    if (value && !this.selectedReasons.includes(value)) {
      this.selectedReasons.push(value);
      input.value = '';
    }
  }

  removeReason(reason: string): void {
    const index = this.selectedReasons.indexOf(reason);
    if (index >= 0) {
      this.selectedReasons.splice(index, 1);
    }
  }

  getPatientAvatar(patientName: string): string {
    // Generate avatar based on patient name
    const femaleNames = ['hanna', 'paityn', 'maren', 'angel', 'kianna', 'alanah'];
    const isFemaleName = femaleNames.some(name => patientName.toLowerCase().includes(name));
    
    if (isFemaleName) {
      const femaleAvatars = ['female-01.jpg', 'female-02.jpg', 'female-03.jpg', 'female-04.jpg', 'female-05.jpg', 'female-06.jpg'];
      const index = Math.abs(patientName.charCodeAt(0)) % femaleAvatars.length;
      return `images/avatars/${femaleAvatars[index]}`;
    } else {
      const maleAvatars = ['male-01.jpg', 'male-02.jpg', 'male-03.jpg', 'male-04.jpg', 'male-05.jpg'];
      const index = Math.abs(patientName.charCodeAt(0)) % maleAvatars.length;
      return `images/avatars/${maleAvatars[index]}`;
    }
  }

  private initializeAddForm(): void {
    this.addAppointmentForm = this.formBuilder.group({
      patientName: ['', Validators.required],
      doctor: ['', Validators.required],
      category: ['Virtual', Validators.required],
      date: ['03.07.21', Validators.required],
      time: ['06:00 pm', Validators.required],
      message: ['Lorem ipsum dolor sit amet del partidos de algao fil madr filhaail mje bilkul nhi pta']
    });
  }
} 