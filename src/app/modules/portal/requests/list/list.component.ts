import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import moment from 'moment';
import { environment } from 'environments/environment';
import { PortalService } from '../../portal.service';
import { FormGroup } from '@angular/forms';
import { ClinicStatus } from 'app/_enums/clinicStatus.enum';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly avatar: string = environment.cloudFront + 'public/users/profile/';
  recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
  tableColumn: string[] = ['name', 'phone', 'gender', 'status', 'date added', 'action'];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

    patientCount: number = 0;
    query: string;
    patientForm: FormGroup;
    cities = [];
    patients: Array<any> = [];
    sortedData: Array<any>;
    patientsToShow: Array<any> = [];
    allClinics: Array<any> = [];
    currentClinicId: string = null;
    currentUser: string = null;
    selectedPatient: any;
    patientToDelete: any;
    showAddDialog = false;
    showUpdateDialog = false;
    showDeleteDialog = false;
    uploadingImage = false;
    selectedImage: string | ArrayBuffer = null;
    imageDownloadURL: any;
    uploadedImageURL: string = null;
    phonePattern: RegExp =
      /^[+]{1}[1]{1}[\s]*((\([0-9]{3}\))|[0-9]{3})[\s\-]?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[0-9]{4}$/;


      data: any[] = []; // Initialize data as an empty array
      loading: boolean = true;
      error: string | null = null;
  /**
   * Constructor
   */
  constructor(
    private _portalService: PortalService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
this.getPatients();
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {

  }

  getPatients(): void {
    this._portalService.getPatients().subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.data = data;  // Assign the fetched data to the data array

          }
          this.loading = false; // Turn off loading after data fetch
          this.cdr.detectChanges();
          console.log('Patients:', this.data);
        },
        error: (err) => {
          console.error('Error fetching patients:', err);
          this.error = 'An error occurred while fetching patients.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getCurrentAge(dob: string): string {
    const birthDate = moment(dob);
    const today = moment();
    const years = today.diff(birthDate, 'years');
    birthDate.add(years, 'years');
    const months = today.diff(birthDate, 'months');
    let ageString = years + ' years';

    if (years < 1) {
      ageString =  months + ' months';
    }

    return ageString;
  }




  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  /**
 * On destroy
 */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
