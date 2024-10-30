import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientsComponent } from './patients.component';
import { ListComponent } from './list/list.component';



export const routes: Routes = [
    // { path: '', redirectTo: '/doctor-portal/appointments-list/upcoming', pathMatch: 'full' },
    {
        path: '',
        component: PatientsComponent,

        children: [
            {
                path: '',
                component: ListComponent,
            },
            {
                path: 'create',
                loadChildren: () => import('./details/details.routes')
            },
            {
                path: ':id/details',
                loadChildren: () => import('./details/details.routes')
            },
            {
                path: ':id/family/create',
                loadChildren: () => import('./details/details.routes')
            },
            {
                path: ':id/family/:patientId/details',
                loadChildren: () => import('./details/details.routes')
            }
        ]
    }
]



@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PatientsRouting { }
