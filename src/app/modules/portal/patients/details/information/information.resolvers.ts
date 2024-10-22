import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { PatientsService } from '../../patients.service';





@Injectable({
  providedIn: 'root'
})
export class SingleResolver implements Resolve<any>
{
  constructor(
     private _service: PatientsService,
     private _router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
     return this._service.getById(route.paramMap.get('id'))
        .pipe(
           catchError((error) => {
              const parentUrl = state.url.split('/').slice(0, -1).join('/');
              this._router.navigateByUrl(parentUrl);

              return throwError(() => new Error(error));
           })
        );
  }
}

 

