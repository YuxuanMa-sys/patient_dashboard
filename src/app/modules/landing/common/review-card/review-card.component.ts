import { FuseCardComponent } from '@3DexCRM/components/card';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterLink } from '@angular/router';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-review-card',
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss'],
  exportAs       : 'review-card',
  standalone: true,
  imports: [MatButtonModule, RouterLink, MatIconModule, FuseCardComponent, CommonModule,
    MatSlideToggleModule, MatDatepickerModule, ReactiveFormsModule, DatePipe,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,


],

providers: [DatePipe]
})
export class ReviewCardComponent {
  readonly avatar: string = environment.cloudFront + 'public/users/profile/';

  @Input() data: any;
  constructor(

  )
  {
    
  }

}
