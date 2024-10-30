import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InformationComponent } from './information.component';

export const routes: Routes = [
  {
    path: '',
    component: InformationComponent,
    // resolve: {
    //   singleResolver: SingleResolver
    // },

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InformationRouting { }
