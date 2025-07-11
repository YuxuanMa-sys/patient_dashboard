import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';
import { PortalComponent } from './portal.component';
import { PortalService } from './portal.service';
import { InsuranceComponent } from './insurance/insurance.component';
import { ProvidersComponent } from './providers/providers.component';

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
                loadComponent: () => import('./requests/requests.component').then(m => m.RequestsComponent),
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

            {
                path: 'providers',
                component: ProvidersComponent,
            },

            {
                path: 'notifications',
                loadChildren: () => import('./notifications/contact.module').then(m => m.ContactModule),
            },

            { path: 'insurance', component: InsuranceComponent},

            {
                path: 'services',
                loadChildren: () => import('./services/services.routes')
            },

            { path: 'settings', loadChildren: () => import('./settings/settings.routes') },

            { path: 'clinic-details', loadChildren: () => import('./account/account.routes') },

            { path: 'clinic-gallery', loadChildren: () => import('./gallery/gallery.routes') },

            {
                path: 'chat',
                loadChildren: () => import('./chat/chat.routes')
            },


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
