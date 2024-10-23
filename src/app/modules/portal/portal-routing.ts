import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';
import { PortalComponent } from './portal.component';
import { PortalService } from './portal.service';

export const routes: Routes = [

    { path: '', redirectTo: '/portal/dashboard', pathMatch: 'full' },
    {
        path: '',
        component: PortalComponent,
        resolve: {
            // profile: () => inject(PortalService).getProfile(),
            //   profile: doctorPortalInitialDataResolver,
        },
        children: [
            {
                path: 'dashboard',
                loadChildren: () => import('app/modules/portal/dashboard/dashboard.routes'),
                resolve: {
                    // profile: () => inject(PortalService).getProfile(),
                    // contacts : PatientsResolver,
                },
            },
            {
                path: 'appointments-list',
                loadChildren: () => import('./appointments-list/appointments-list.module').then(m => m.AppointmentsListModule),
            },

            {
                path: 'patients',
                loadChildren: () => import('./patients/patients.module').then(m => m.PatientsModule),
            },
            {
                path: 'new-patients',
                loadChildren: () => import('./patients-new/patients.module').then(m => m.PatientsModule),
            },

            {
                path: 'requests',
                loadChildren: () => import('./requests/requests.module').then(m => m.RequestsModule),
            },

            {
                path: 'announcements',
                loadChildren: () => import('./announcements/promotion.module').then(m => m.PromotionModule),
            },
            {
                path: 'promotion',
                loadChildren: () => import('./promotion/promotion.module').then(m => m.PromotionModule),
            },

            {
                path: 'staff',
                loadChildren: () => import('./staff/staff.module').then(m => m.StaffModule),
            },

            //   {
            //     path: 'inbox',
            //     loadChildren: () => import('../pages/coming-soon/coming-soon.routes'),
            //   },
            //   {
            //     path: 'availability',
            //     component: AvailabilityComponent,
            //     // loadChildren: () => import('../pages/coming-soon/coming-soon.routes'),
            //   },
            //   {
            //     path: 'promotions',
            //     loadChildren: () => import('../pages/coming-soon/coming-soon.routes'),
            //   },
            //   {
            //     path: 'request-badge',
            //     loadChildren: () => import('../pages/coming-soon/coming-soon.routes'),
            //   },
            //   {
            //     path: 'program',
            //     loadChildren: () => import('../pages/coming-soon/coming-soon.routes'),
            //   },
            //   {
            //     path: 'reports',
            //     loadChildren: () => import('../pages/coming-soon/coming-soon.routes'),
            //   },
            //   {
            //     path: 'appointments-list',
            //     loadChildren: () => import('./appointments-list/appointments-list.module').then(m => m.AppointmentsListModule),
            //   },

            //   {
            //     path: 'translations',
            //     loadChildren: () => import('./translation/translation.module').then(m => m.TranslationModule),
            //   },
            //   {
            //     path: 'patient-request',
            //     loadChildren: () => import('./patient-request/patient-request.module').then(m => m.PatientRequestModule),
            //   },
            //   {
            //     path: 'clinic-settings',
            //     loadChildren: () => import('./clinic-setting/clinic-setting.module').then(m => m.ClinicSettingModule),
            //   },
            //   {
            //     path: 'reviews',
            //     loadChildren: () => import('./reviews/reviews.module').then(m => m.ReviewsModule),
            //   },
            //   {
            //     path: 'packages',
            //     loadChildren: () => import('./packages/packages.routes')
            //   },
            //   {
            //     path: 'packages/:id',
            //     loadChildren: () => import('./paypal/paypal.routes')
            //   },
        ]
    },
    //   {
    //     path: '',
    //     component: PortalComponent,
    //     children: [
    //       {
    //         path: 'profile-update',
    //         loadChildren: () => import('./profile-update/profile-update.routes')
    //       },
    //       {
    //         path: 'profile-setting',
    //         loadChildren: () => import('./profile-setting/profile-setting.module').then(m => m.ProfileSettingModule)
    //       },
    //       {
    //         path: 'verification-inprogress',
    //         loadChildren: () => import('./verifications/verifications.routes')
    //       },
    //       // {
    //       //   path: 'clinic-setting',
    //       //   loadChildren: () => import('./clinic-setting/clinic-setting.routes')
    //       // },
    //     ]
    //   }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PortalRouting { }
