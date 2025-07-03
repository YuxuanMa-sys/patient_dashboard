import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import {  AppointmentsListRouting, routes } from './appointments-list-routing';
import { SharedModule } from 'app/shared/shared.module';



@NgModule({
  declarations: [
    // AppointmentsListComponent removed since it's now standalone
  ],
  imports: [
    AppointmentsListRouting,
    SharedModule,
    RouterModule.forChild(routes),
    RouterLink,
  ]
})
export class AppointmentsListModule { }
