import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffComponent } from './staff.component';
import { ListComponent } from './list/list.component';
import { StaffService } from './staff.service';
import { staffInitialDataResolver } from './staff.resolvers';


export const routes: Routes = [
  // { path: '', redirectTo: '/doctor-portal/appointments-list/upcoming', pathMatch: 'full' },
  {
    path: '',
    component: StaffComponent,

    children: [
      {
        path: '',
        component: ListComponent,
        // resolve: {
        //   patient: patientsInitialDataResolver,
        //   // data: () => inject(PatientsService).getData(),
        // }
      },
    ]
  }
]



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRouting { }
