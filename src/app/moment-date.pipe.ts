import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'momentDate'
})
export class MomentDatePipe implements PipeTransform {
  transform(value: Date | null, format: string = 'MMMM Do YYYY, h:mm:ss a'): string {
    return value ? moment(value).format(format) : 'N/A';
  }
}
