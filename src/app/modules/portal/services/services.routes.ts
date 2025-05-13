import { Routes } from '@angular/router';
import { ServicesListComponent } from './list/list.component';

export default [
    {
        path: '', // Default route for '/portal/services'
        component: ServicesListComponent,
        // You might add resolvers here later if needed
    },
    // Add routes for add/edit components later, e.g.:
    // {
    //     path: 'new',
    //     component: ServiceAddComponent,
    // },
    // {
    //     path: ':id/edit',
    //     component: ServiceEditComponent,
    // },
] as Routes;
