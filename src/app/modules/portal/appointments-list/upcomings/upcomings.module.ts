import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { UpcomingsRouting, routes } from './upcomings-routing';
import { UpcomingsComponent } from './upcomings.component';
import { SharedModule } from 'app/shared/shared.module';



@NgModule({
  declarations: [
    UpcomingsComponent
  ],
  imports: [
    UpcomingsRouting,
    SharedModule,
    RouterModule.forChild(routes),
    RouterLink,
  ]
})
export class UpcomingsModule { }
