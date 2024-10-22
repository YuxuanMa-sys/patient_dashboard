import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientsComponent } from './patients.component';
import { ListComponent } from './list/list.component';
import { PatientsService } from './patients.service';
import { patientsInitialDataResolver } from './patients.resolvers';


export const routes: Routes = [
  // { path: '', redirectTo: '/doctor-portal/appointments-list/upcoming', pathMatch: 'full' },
  {
    path: '',
    component: PatientsComponent,

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
export class PatientsRouting { }
