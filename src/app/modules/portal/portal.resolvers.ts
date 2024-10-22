import { inject } from '@angular/core';
import { forkJoin } from 'rxjs';
// import { PortalService } from './portal.service';
import { AuthService } from 'app/core/auth/auth.service';


export const PortalInitialDataResolver = () =>
{
    // const portalService = inject(PortalService);
    // const _authService = inject(AuthService);

    // Fork join multiple API endpoint calls to wait all of them to finish
    return forkJoin([
    //   portalService.getDoctorProfile(),
    //   portalService.getUserStatus(),
    //   _authService.getNotification(),
    ]);
};


