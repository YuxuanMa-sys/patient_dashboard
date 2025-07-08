import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-appointments-list',
  templateUrl: './appointments-list.component.html',
  styleUrls: ['./appointments-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatOptionModule
  ]
})
export class AppointmentsListComponent implements OnInit {
  // Filter properties
  searchQuery: string = '';
  dateFilter: Date | null = null;
  doctorFilter: string = '';
  appointmentTypeFilter: string = '';
  
  // View properties
  currentView: 'table' | 'calendar' = 'table';
  
  // Modal properties
  showAddModal: boolean = false;
  addAppointmentForm: FormGroup;
  
  // Tag functionality for reasons
  selectedReasons: string[] = ['Tooth Pain', 'Swollen Gums', 'Bad Breath'];
  
  // Sample data
  availableDoctors = [
    { name: 'Dr. Jamie Garcia', id: 1 },
    { name: 'Dr. Olivia Wilde', id: 2 },
    { name: 'Dr. Anderson Phillips', id: 3 },
    { name: 'Dr. Maddison May', id: 4 },
    { name: 'Dr. Martin Odegaard', id: 5 }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Initialize component
  }

  private initializeForm(): void {
    this.addAppointmentForm = this.fb.group({
      patientName: ['', Validators.required],
      doctor: ['', Validators.required],
      category: ['Virtual', Validators.required],
      date: ['03.07.21', Validators.required],
      time: ['06:00 pm', Validators.required],
      message: ['Lorem ipsum dolor sit amet del partidos de algao fil madr filhaail mje bilkul nhi pta']
    });
  }

  // Filter methods
  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    // Emit filter changes to child components
    // This will be handled by the individual appointment components
    console.log('Applying filters:', {
      search: this.searchQuery,
      date: this.dateFilter,
      doctor: this.doctorFilter,
      appointmentType: this.appointmentTypeFilter
    });
  }

  // View methods
  toggleView(): void {
    this.currentView = this.currentView === 'table' ? 'calendar' : 'table';
    
    // Navigate to calendar view if needed
    if (this.currentView === 'calendar') {
      this.router.navigate(['/portal/appointments-list/calendar']);
    } else {
      this.router.navigate(['/portal/appointments-list/upcoming']);
    }
  }

  // Modal methods
  openAddAppointmentModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.addAppointmentForm.reset();
    this.selectedReasons = ['Tooth Pain', 'Swollen Gums', 'Bad Breath']; // Reset to default
    this.initializeForm();
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

  // Helper methods
  getFilterSummary(): string {
    const filters = [];
    if (this.searchQuery) filters.push(`Search: ${this.searchQuery}`);
    if (this.dateFilter) filters.push(`Date: ${this.dateFilter.toDateString()}`);
    if (this.doctorFilter) filters.push(`Doctor: ${this.doctorFilter}`);
    if (this.appointmentTypeFilter) filters.push(`Type: ${this.appointmentTypeFilter}`);
    
    return filters.length > 0 ? filters.join(', ') : 'No filters applied';
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.dateFilter = null;
    this.doctorFilter = '';
    this.appointmentTypeFilter = '';
    this.applyFilters();
  }
}
