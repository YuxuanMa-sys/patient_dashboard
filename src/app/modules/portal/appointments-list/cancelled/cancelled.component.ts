import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CancelledAppointmentsService } from './past.service';
import { MatPaginator } from '@angular/material/paginator';
import { ApexOptions, ChartComponent } from 'ng-apexcharts';
import { AppointmentsListService } from '../appointments-list.service';
import { environment } from 'environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentDetailModalComponent } from 'app/modules/landing/common/appointment-detail/appointment-detail.component';
import { cloneDeep } from 'lodash';


@Component({
  selector: 'app-cancelled',
  templateUrl: './cancelled.component.html',
  styleUrls: ['./cancelled.component.scss'],
})
export class CancelledAppointmentsComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly url: string = environment.assets + 'utitlity/';
  readonly avatar: string = environment.cloudFront + 'public/users/profile/';

  recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
  recentTransactionsTableColumns: string[] = ['name', 'date', 'type', 'insurance', 'issue_seeking', 'status', 'action'];
  data: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  cancelled: any;
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
    this._appointmentsListService.cancelled$
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((data) => {
      // Store the data
      this.cancelled = data;
      // Prepare the chart data
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
