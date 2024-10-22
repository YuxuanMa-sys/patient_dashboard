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
        loadChildren: () => import('./upcomings/upcomings.module').then(m => m.UpcomingsModule),
      },
      // {
      //   path: 'upcoming',
      //   loadChildren: () => import('./upcomings/appointments/appointments.module').then(m => m.AppointmentsModule),
      // },
      {
        path: 'past',
        loadChildren: () => import('./past/past.module').then(m => m.PastAppointmentsModule),
      },
      {
        path: 'cancelled',
        loadChildren: () => import('./cancelled/past.module').then(m => m.CancelledAppointmentsModule),
      },

    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentsListRouting { }
