import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {  CancelledAppointmentsComponent } from './cancelled.component';
import { CancelledAppointmentsService } from './past.service';
import { AppointmentsListService } from '../appointments-list.service';


export const routes: Routes = [

  {
    path: '',
    component: CancelledAppointmentsComponent,
    resolve: {
      data: () => inject(AppointmentsListService).cancelled(),
    },



  }]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalRouting { }
