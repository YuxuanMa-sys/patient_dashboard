import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Route, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatOptionModule } from '@angular/material/core';
import { ListComponent } from './list/list.component';
import { RequestsComponent } from './requests.component';
import { AppointmentRequestDetailModalComponent } from './appointment-request-detail-modal/appointment-request-detail-modal.component';

const routes: Route[] = [
    {
        path: '',
        component: RequestsComponent,
        children: [
            {
                path: '',
                component: ListComponent
            }
        ]
    }
];

@NgModule({
    declarations: [
        ListComponent,
        RequestsComponent,
        AppointmentRequestDetailModalComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatMenuModule,
        MatTooltipModule,
        MatDialogModule,
        MatOptionModule
    ]
})
export class RequestsModule {
}
