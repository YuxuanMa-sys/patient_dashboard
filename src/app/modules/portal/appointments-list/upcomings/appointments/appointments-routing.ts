import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentsComponent } from './appointments.component';
import { AppointmentsListService } from '../../appointments-list.service';
import { PortalService } from 'app/modules/portal/portal.service';

export const routes: Routes = [
    {
        path: '',
        component: AppointmentsComponent,
        // resolve: {
        //     upcoming: () => inject(PortalService).getAppointments(),
        // },
    }]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PortalRouting { }
