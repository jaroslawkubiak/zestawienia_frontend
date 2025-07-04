import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ISetting } from './ISetting';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(private http: HttpClient) {}
  private handleError(error: HttpErrorResponse) {
    if (error.status === 400 && error.error.error === 'DuplicateEntry') {
      return throwError(() => new Error('DuplicateEntry'));
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  getByType(type: string): Observable<ISetting> {
    return this.http
      .get<ISetting>(`${environment.API_URL}/settings/${type}`)
      .pipe(catchError(this.handleError));
  }
}
