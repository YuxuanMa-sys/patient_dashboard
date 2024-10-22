import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {  PastAppointmentsComponent } from './past.component';
import { PastAppointmentsService } from './past.service';
import { AppointmentsListService } from '../appointments-list.service';


export const routes: Routes = [
  {
    path: '',
    component: PastAppointmentsComponent,
    resolve: {
      today: () => inject(AppointmentsListService).past(),
    },


  }]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalRouting { }
