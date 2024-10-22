import { inject } from '@angular/core';
import { forkJoin } from 'rxjs';

import { PatientsService } from './patients.service';
import { PortalService } from '../portal.service';


export const patientsInitialDataResolver = () =>
{
    var profile:  any;
    const data = inject(PatientsService);

    // Fork join multiple API endpoint calls to wait all of them to finish
    return forkJoin([
      data.getAll(profile.id),
    ]);
};


