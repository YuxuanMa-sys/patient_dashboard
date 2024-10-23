import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PromotionComponent } from './promotion.component';
import { ListComponent } from './list/list.component';


export const routes: Routes = [
  // { path: '', redirectTo: '/doctor-portal/appointments-list/upcoming', pathMatch: 'full' },
  {
    path: '',
    component: PromotionComponent,

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
export class PromotionRouting { }
