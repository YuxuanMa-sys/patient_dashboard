import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  sendNotification(notificationData: { type: any, referenceId: string; }): Observable<any> {
    return this._httpClient.post<any>(`${environment.firebase.cloudFunctionUrl}/app/api/notifications/trigger`, notificationData);
  }
  constructor(
    private _httpClient: HttpClient

  ) { }
}
