import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentsListComponent } from './appointments-list.component';
import { PortalService } from '../portal.service';


export const routes: Routes = [
  { path: '', redirectTo: '/portal/appointments-list/upcoming', pathMatch: 'full' },
  {
    path: '',
    component: AppointmentsListComponent,
    children: [
      {
        path: 'upcoming',
        loadChildren: () => import('./appointments/appointments.routes'),
      },
      // {
      //   path: 'upcoming',
      //   loadChildren: () => import('./upcomings/appointments/appointments.module').then(m => m.AppointmentsModule),
      // },
      {
        path: 'past',
        loadChildren: () => import('./past/appointments.routes'),
      },

      {
        path: 'cancelled',
        loadChildren: () => import('./cancelled/appointments.routes'),
      },

      {
        path: 'completed',
        loadChildren: () => import('./completed/appointments.routes'),
      },


    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentsListRouting { }
