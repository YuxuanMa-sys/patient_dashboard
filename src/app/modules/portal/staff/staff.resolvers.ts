import { inject } from '@angular/core';
import { forkJoin } from 'rxjs';

import { StaffService } from './staff.service';
import { PortalService } from '../portal.service';


export const staffInitialDataResolver = () =>
{
    var profile:  any;
    const data = inject(StaffService);

    // Fork join multiple API endpoint calls to wait all of them to finish
    return forkJoin([
      data.getAll(profile.id),
    ]);
};


