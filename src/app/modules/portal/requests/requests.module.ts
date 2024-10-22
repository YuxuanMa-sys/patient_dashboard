import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';

import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { routes } from '../portal-routing';
import { RequestsRouting } from './requests-routing';
import { ListComponent } from './list/list.component';
import { RequestsComponent } from './requests.component';





@NgModule({
    declarations: [
        RequestsComponent,
        ListComponent
    ],
    imports: [
        RequestsRouting,
        SharedModule,
        RouterModule.forChild(routes),
        RouterLink,
        MatIconModule,
        MatStepperModule,
        MatFormFieldModule, MatInputModule, MatSelectModule,
        MatOptionModule, MatButtonModule, MatCheckboxModule, MatRadioModule,
        MatDatepickerModule,
        MatProgressSpinnerModule,
        MatMenuModule, MatDividerModule,
        NgClass, MatTableModule,
        MatSortModule, DatePipe,
    ]
})
export class RequestsModule { }
