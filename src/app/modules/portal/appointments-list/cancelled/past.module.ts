import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { PortalRouting, routes } from './cancelled-routing';
import {  CancelledAppointmentsComponent } from './cancelled.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatTabsModule} from '@angular/material/tabs';
import { SharedModule } from 'app/shared/shared.module';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';



@NgModule({
  declarations: [
    CancelledAppointmentsComponent
  ],
  imports: [
    PortalRouting,
    MatTabsModule,
    SharedModule,
    RouterModule.forChild(routes),
    MatIconModule,
    FormsModule, ReactiveFormsModule, MatStepperModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatOptionModule, MatButtonModule, MatCheckboxModule, MatRadioModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatMenuModule, MatDividerModule,
    NgClass, MatTableModule,
    MatSortModule, DatePipe,
    AsyncPipe,
    MatSlideToggleModule
  ]
})
export class CancelledAppointmentsModule { }
