import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import {  AppointmentsListRouting, routes } from './appointments-list-routing';
import { AppointmentsListComponent } from './appointments-list.component';
import { SharedModule } from 'app/shared/shared.module';



@NgModule({
  declarations: [
    AppointmentsListComponent
  ],
  imports: [
    AppointmentsListRouting,
    SharedModule,
    RouterModule.forChild(routes),
    RouterLink,
  ]
})
export class AppointmentsListModule { }
