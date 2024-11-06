import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AppointmentsComponent } from './appointments.component';


export default [
    {
        path: '',
        component: AppointmentsComponent,
    },
] as Routes;
