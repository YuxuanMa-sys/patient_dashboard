import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { RequestsComponent } from './requests.component';

export const routes: Routes = [
  {
    path: '',
    component: RequestsComponent,
    children: [
      { path: '', redirectTo: 'active', pathMatch: 'full' },
      {
        path: 'active',
        component: ListComponent,
        data: { status: 'active' }
      },
      {
        path: 'cancelled',
        component: ListComponent,
        data: { status: 'cancelled' }
      },
      {
        path: 'completed',
        component: ListComponent,
        data: { status: 'completed' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestsRouting { }
