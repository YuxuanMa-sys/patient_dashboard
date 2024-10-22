import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import { environment } from 'environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { ApexOptions, ChartComponent } from 'ng-apexcharts';
import { AppointmentsListService } from '../../appointments-list.service';
import { MatDialog } from '@angular/material/dialog';

import { cloneDeep } from 'lodash';
import { AppointmentDetailModalComponent } from 'app/modules/landing/common/appointment-detail/appointment-detail.component';
import { ActivatedRoute } from '@angular/router';

import { PortalService } from 'app/modules/portal/portal.service';
import { ClinicStatus } from 'app/_enums/clinicStatus.enum';
import { DocumentReference, getDoc } from 'firebase/firestore';



@Component({
    selector: 'app-appointments',
    templateUrl: './appointments.component.html',
    styleUrls: ['./appointments.component.scss'],
})
export class AppointmentsComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('btcChartComponent') btcChartComponent: ChartComponent;
    appConfig: any;
    btcOptions: ApexOptions = {};
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    products$: Observable<any[]>;
    readonly avatar: string = environment.cloudFront + 'public/users/profile/';
    readonly url: string = environment.assets + 'utitlity/';
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['name', 'date', 'type', 'doctor', 'issue_seeking', 'status', 'action'];
    data: any[] = [];
    today: any;
    upcoming: any;
    clinics: any[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    allClinics: any[];
    appointments: any[];
    sortedData: any[];

    loading: boolean = true;
    /**
     * Constructor
     */
    constructor(
        private _matDialog: MatDialog,
        private _appointmentsListService: AppointmentsListService,
        private route: ActivatedRoute,
        private _portalService: PortalService,
        private cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {

        this.route.data.subscribe((data) => {
            console.log('Resolved clinics data:', data['upcoming']);  // Add this log
            this.clinics = data['upcoming']; // Check if data is available
        });

        this._appointmentsListService.upcoming$

            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                // Store the data
                this.upcoming = data;
                // Prepare the chart data
            });

        this._appointmentsListService.today$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                // Store the data
                this.today = data;
                // Prepare the chart data
            });


        this.getAppointments();
        // this._portalService.getClinics().subscribe((res) => {
        //     this.allClinics = res.map((e: any) => {
        //         return {
        //             id: e.payload.doc.id,
        //             ...e.payload.doc.data(),
        //         };
        //     });
        //     console.log(this.allClinics);

        // });



    }


    getAppointments(): void {
        this._portalService.getAppointments().subscribe((res) => {

          this.appointments = res.map((e: any) => {
            return {
              $key: e.id, ...e // Adjusted: Using 'e.id' from the new structure
            };
          }).filter(a => {
            // console.log('Appointment before filter:', a); // Log each appointment before filtering
            return a.status !== ClinicStatus.PENDING && a.provider_id; // Filter based on conditions
          });


          // Step 2: Process each appointment to resolve patient and provider data
          this.appointments.forEach((e, index) => {
            if (e.patient_id) {
            //   console.log('Patient ID for appointment:', e.patient_id, 'Type:', typeof e.patient_id);
            //   console.log('Patient ID Structure:', JSON.stringify(e.patient_id, null, 2));

              // Check if patient_id is a DocumentReference
              if (e.patient_id instanceof DocumentReference) {
                // console.log('Fetching patient data...');
                getDoc(e.patient_id).then((p) => { // Use getDoc instead of e.patient_id.get()
                  if (p.exists()) {
                    e['patient'] = p.data(); // Attach patient data
                    // console.log('Patient data:', e['patient']);
                  }
                }).catch((err) => console.error('Error fetching patient data:', err));
              } else {
                console.error('Invalid patient_id:', e.patient_id); // Log invalid patient_id
              }
            } else {
              console.error('Missing patient_id:', e.patient_id); // Log missing patient_id
            }
          });

          this.loading = false;
          this.cdr.detectChanges();

        }, (err) => {
          console.error('Error fetching appointments:', err); // Log error if fetching appointments fails
        });
      }


    sortData(sort: Sort) {
        const data = this.appointments.slice();
        if (!sort.active || sort.direction === '') {
            this.sortedData = data;
            return;
        }
        this.sortedData = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'patient_name': return this.compare(a.patient.fname, b.patient.fname, isAsc);
                case 'appointment_type': return this.compare(a.appointment_type, b.appointment_type, isAsc);
                case 'appointment_reason': return this.compare(a.appointment_reason, b.appointment_reason, isAsc);
                case 'status': return this.compare(a.status, b.status, isAsc);
                case 'doctor_name': return this.compare(a.provider.name, b.provider.name, isAsc);
                case 'confirmed_date': return this.compareDate(a, b, isAsc);
                default: return 0;
            }
        });
    }

    compareDate(a: any, b: any, isAsc: boolean) {
        if (b.confirmed_date) return 1;
        if (a.confirmed_date) return -1;
        if (b.confirmed_date && a.confirmed_date) return isAsc ? a.confirmed_date.toDate().getTime() - b.confirmed_date.toDate().getTime() : b.confirmed_date.toDate().getTime() - a.confirmed_date.toDate().getTime();
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
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

    openApptCompleteDialog(data: any): void {
        // const dialogRef = this._matDialog.open(AppointmentCompleteModalComponent, {
        //   autoFocus: false,
        //   data: cloneDeep(data)
        // });

        // dialogRef.afterClosed().subscribe(result => {
        //   console.log(result);

        //   // Yahan par aap modal se wapas aaya data result mein prapt kar sakte hain.
        //   // this.form.get('availability_id').setValue(result.availability_id);
        //   // this.form.get('availability_slot_id').setValue(result.availability_slot_id);
        //   // this.form.get('dated').setValue(result.dated);
        //   // this.form.get('start_time').setValue(result.start_time);
        //   // this.form.get('end_time').setValue(result.end_time);
        //   // this.form.get('type').setValue(result.type);
        // });
    }
    /**
     * After view init
     */
    ngAfterViewInit(): void {

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
