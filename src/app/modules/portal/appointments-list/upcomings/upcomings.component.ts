import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-upcomings',
  templateUrl: './upcomings.component.html',
  styleUrls: ['./upcomings.component.scss'],
  // standalone   : true,
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingsComponent {

}
