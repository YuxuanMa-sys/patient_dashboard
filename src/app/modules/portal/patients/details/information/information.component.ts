import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { ApexOptions, ChartComponent } from 'ng-apexcharts';
import moment from 'moment';
import { environment } from 'environments/environment';




@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
})
export class InformationComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly avatar: string = environment.cloudFront + 'public/users/profile/';
  data: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor()
    {
    }

  ngOnInit(): void
  {

    // this._patientsService.contact$
    // .pipe(takeUntil(this._unsubscribeAll))
    // .subscribe((data) => {
    //   // Store the data
    //   this.data = data;
    // });

  }

  getCurrentAge(dob: string): string {
    const birthDate = moment(dob);
    const today = moment();
    const years = today.diff(birthDate, 'years');
    birthDate.add(years, 'years');
    const months = today.diff(birthDate, 'months');
    let ageString = years + ' years';

    if (years < 1) {
      ageString = months + ' months';
    }

    return ageString;
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
