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


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly avatar: string = environment.cloudFront + 'public/users/profile/';
  readonly url: string = environment.assets + 'utitlity/';
  recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
  recentTransactionsTableColumns: string[] = ['name', 'date', 'type', 'doctor', 'issue_seeking', 'status', 'action'];
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
    appointments: any[];
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
this.getAllRequests();
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {

  }

  getAllRequests(): void {
    this._portalService.getAlongWithPendingAppointments().subscribe({
      next: (res) => {
        this.appointments = res.map((e: any) => {
          return {
            id: e.id,  // Adjusted id mapping
            ...e
          };
        });

        // Filter and sort the appointments
        this.appointments = this.appointments.filter(a => a.createdAt && a.status === ClinicStatus.PENDING);
        this.appointments.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());

        // Attach patient data for each appointment
        this.appointments.forEach((e, index) => {
          if (e.patient_id) {
            e.patient_id.get().then((p) => {
              if (p.exists) {
                e['patient'] = p.data();
              }
              if (index === this.appointments.length - 1) {
                this.sortedData = this.appointments.slice(); // Finalize sorted data
              }
            });
          }
        });
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
