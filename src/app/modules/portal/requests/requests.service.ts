import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface RequestFilters {
  searchQuery: string;
  dateFilter: Date | null;
  doctorFilter: string;
  appointmentTypeFilter: string;
}

@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  private filtersSubject = new BehaviorSubject<RequestFilters>({
    searchQuery: '',
    dateFilter: null,
    doctorFilter: '',
    appointmentTypeFilter: ''
  });

  public filters$ = this.filtersSubject.asObservable();

  updateFilters(filters: RequestFilters): void {
    this.filtersSubject.next(filters);
  }

  getCurrentFilters(): RequestFilters {
    return this.filtersSubject.value;
  }
} 