import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact.component';
import { ListComponent } from './list/list.component';


export const routes: Routes = [
  // { path: '', redirectTo: '/doctor-portal/appointments-list/upcoming', pathMatch: 'full' },
  {
    path: '',
    component: ContactComponent,

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
export class ContactRouting { }
