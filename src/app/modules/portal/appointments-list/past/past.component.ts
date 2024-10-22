import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { ApexOptions, ChartComponent } from 'ng-apexcharts';
import { AppointmentsListService } from '../appointments-list.service';
import { environment } from 'environments/environment';
import { MatDialog } from '@angular/material/dialog';

import { cloneDeep } from 'lodash';
import { AppointmentDetailModalComponent } from 'app/modules/landing/common/appointment-detail/appointment-detail.component';

@Component({
  selector: 'app-past',
  templateUrl: './past.component.html',
  styleUrls: ['./past.component.scss'],
})
export class PastAppointmentsComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly avatar: string = environment.cloudFront + 'public/users/profile/';
  @ViewChild('btcChartComponent') btcChartComponent: ChartComponent;
    appConfig: any;
  drawerMode: 'over' | 'side' = 'side';
  drawerOpened: boolean = true;
  products$: Observable<any[]>;

  readonly url: string = environment.assets + 'utitlity/';


  recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
  recentTransactionsTableColumns: string[] = ['name', 'date', 'type', 'insurance', 'issue_seeking', 'status', 'action'];
  data: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  past: any;
    /**
     * Constructor
     */
    constructor(
      private _matDialog: MatDialog,
      private _appointmentsListService: AppointmentsListService)
    {
    }

  ngOnInit(): void
  {

    this._appointmentsListService.past$
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((data) => {
      // Store the data
      this.past = data;
      // Prepare the chart data
    });

    // this._financeService.data$
    // .pipe(takeUntil(this._unsubscribeAll))
    // .subscribe((data) => {
    //   // Store the data
    //   this.data = data;
    //   console.log(data);

    //   for (let i = 1; i <= 10; i++) {
    //     const randomType = Math.random() < 0.5 ? 'In-Person' : 'Virtual';
    //     const randomStatus = ['Cancelled', 'Upcoming', 'Pending', 'Rejected', 'Miss', 'Completed'][Math.floor(Math.random() * 6)];

    //     this.data.appointments.push({
    //         id: i.toString(),
    //         name: `Patient ${i}`,
    //         image: 'assets/images/avatars/brian-hughes.jpg',
    //         date: '2019-10-07T22:22:37.274Z', // You can generate random dates as well
    //         type: randomType,
    //         status: randomStatus,
    //         insurance: 'assets/images/insurance1.png',
    //         issue_seeking: 'Booking issue description goes here', // You can customize this field
    //     });
    // }
    //   // this.data.recentTransactions = [];

    //   // Store the table data
    //   this.recentTransactionsDataSource.data = data.recentTransactions;

    //   // Prepare the chart data
    // });

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
    /**
     * After view init
     */
    ngAfterViewInit(): void
    {

    }


  trackByFn(index: number, item: any): any
  {
      return item.id || index;
  }

      /**
     * On destroy
     */
      ngOnDestroy(): void
      {
          // Unsubscribe from all subscriptions
          this._unsubscribeAll.next(null);
          this._unsubscribeAll.complete();
      }
}
