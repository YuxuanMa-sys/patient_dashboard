import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UpcomingsComponent } from './details.component';



export const routes: Routes = [
  // { path: '', redirectTo: '/doctor-portal/appointments-list/upcoming', pathMatch: 'full' },
  {
    path: '',
    component: UpcomingsComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./information/information.module').then(m => m.InformationModule),
      },



    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UpcomingsRouting { }
