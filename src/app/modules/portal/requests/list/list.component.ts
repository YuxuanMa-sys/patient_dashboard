import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import moment from 'moment';
import { environment } from 'environments/environment';
import { PortalService } from '../../portal.service';
import { FormGroup } from '@angular/forms';
import { ClinicStatus } from 'app/_enums/clinicStatus.enum';
import { AppointmentDetailModalComponent } from 'app/modules/landing/common/appointment-detail/appointment-detail.component';
import { cloneDeep } from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { DocumentReference, getDoc } from 'firebase/firestore';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly avatar: string = environment.cloudFront + 'public/users/profile/';
  readonly url: string = environment.assets + 'utitlity/';
  recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
  recentTransactionsTableColumns: string[] = ['name',  'type', 'issue_seeking', 'date', 'status', 'action'];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

    patientCount: number = 0;
    query: string;
    patientForm: FormGroup;
    cities = [];
    patients: Array<any> = [];
    sortedData: Array<any>;
    patientsToShow: Array<any> = [];


      data: any[] = []; // Initialize data as an empty array
      loading: boolean = true;
      error: string | null = null;
    appointments: any[] = [];
  /**
   * Constructor
   */
  constructor(
    private _matDialog: MatDialog,
    private _portalService: PortalService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
this.getAppointments();
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {

  }

  getAppointments(): void {
    this._portalService.getAlongWithPendingAppointments().subscribe({
        next: (res) => {
            this.appointments = res; // Contains enriched appointments with patient and doctor data
            this.loading = false;
            console.log(res);

            this.cdr.detectChanges();
            console.log('Enriched Appointments:', this.appointments);
        },
        error: (err) => {
            console.error('Error fetching appointments:', err);
        }
    });
}



  getAllRequests(): void {
    this._portalService.getAlongWithPendingAppointments().subscribe({
      next: (res) => {
        this.appointments = [];

        // Step 1: Map over the documents and format the appointment objects
        this.appointments = res.map((e: any) => {
          return {
            id: e.id,  // Adjusted id mapping
            ...e,
          };
        });

        // Step 2: Filter and sort appointments based on status and createdAt
        this.appointments = this.appointments.filter(a => a.createdAt && a.status === ClinicStatus.PENDING);
        this.appointments.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());

        // Step 3: Fetch patient data for each appointment
        this.appointments.forEach((e, index) => {
          if (e.patient_id instanceof DocumentReference) {  // Ensure patient_id is a DocumentReference
            getDoc(e.patient_id).then((p) => {
              if (p.exists()) {
                e['patient'] = p.data(); // Attach patient data
              }
              if (index === this.appointments.length - 1) {
                this.sortedData = this.appointments.slice();  // Finalize sorted data
                this.cdr.detectChanges();  // Trigger change detection
              }
            }).catch(err => {
              console.error('Error fetching patient data:', err);
            });
          }
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching pending appointments:', err);
      }
    });
  }


  openApptDetailDialog(data: any): void {
    const dialogRef = this._matDialog.open(AppointmentDetailModalComponent, {
        autoFocus: false,
        data: cloneDeep(data)
    });

    dialogRef.afterClosed().subscribe(result => {
        console.log(result);

        // Yahan par aap modal se wapas aaya data result mein prapt kar sakte hain.
        // this.form.get('availability_id').setValue(result.availability_id);
        // this.form.get('availability_slot_id').setValue(result.availability_slot_id);
        // this.form.get('dated').setValue(result.dated);
        // this.form.get('start_time').setValue(result.start_time);
        // this.form.get('end_time').setValue(result.end_time);
        // this.form.get('type').setValue(result.type);
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
