import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { PortalRouting, routes } from './portal-routing';
import { PortalComponent } from './portal.component';
import { SharedModule } from 'app/shared/shared.module';



@NgModule({
  declarations: [
    PortalComponent,
    // AvailabilityComponent
  ],
  imports: [
    PortalRouting,
    SharedModule,
    RouterModule.forChild(routes),
    RouterLink,
  ],
  providers: [DatePipe]
})
export class PortalModule { }
