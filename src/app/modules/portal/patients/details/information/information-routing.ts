import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InformationComponent } from './information.component';
import { SingleResolver } from './information.resolvers';

export const routes: Routes = [
  {
    path: '',
    component: InformationComponent,
    resolve: {
      singleResolver: SingleResolver
      // data: () => inject(AppointmentsService).getData(),
    },
    // children: [
    //   {
    //     path: 'profile-update',
    //     loadChildren: () => import('app/modules/doctor-portal/portal.routes')
    //   },
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InformationRouting { }
