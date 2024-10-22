import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UpcomingsComponent } from './upcomings.component';



export const routes: Routes = [
  {
    path: '',
    component: UpcomingsComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./appointments/appointments.module').then(m => m.AppointmentsModule),
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UpcomingsRouting { }
