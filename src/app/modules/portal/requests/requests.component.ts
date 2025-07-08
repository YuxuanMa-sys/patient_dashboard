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
import { RequestsService } from './requests.service';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss'],
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
export class RequestsComponent implements OnInit {
  // Filter properties
  searchQuery: string = '';
  dateFilter: Date | null = null;
  doctorFilter: string = '';
  appointmentTypeFilter: string = '';
  
  // Sample data
  availableDoctors = [
    { name: 'Dr. Jamie Garcia', id: 1 },
    { name: 'Dr. Olivia Wilde', id: 2 },
    { name: 'Dr. Anderson Phillips', id: 3 },
    { name: 'Dr. Maddison May', id: 4 },
    { name: 'Dr. Martin Odegaard', id: 5 }
  ];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private requestsService: RequestsService
  ) {}

  ngOnInit(): void {
    // Initialize component
  }

  // Filter methods
  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    // Update filters in service
    this.requestsService.updateFilters({
      searchQuery: this.searchQuery,
      dateFilter: this.dateFilter,
      doctorFilter: this.doctorFilter,
      appointmentTypeFilter: this.appointmentTypeFilter
    });
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
