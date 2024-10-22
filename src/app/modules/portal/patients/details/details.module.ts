import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { UpcomingsRouting, routes } from './details-routing';
import { UpcomingsComponent } from './details.component';
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
export class DetailsModule { }
