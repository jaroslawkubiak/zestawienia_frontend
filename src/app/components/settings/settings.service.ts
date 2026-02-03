import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IChangePassword } from './types/IChangePassword';
import { DbSettings } from './types/IDbSettings';

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

  getSettingByNames(names: string[]): Observable<DbSettings[]> {
    return this.http
      .post<DbSettings[]>(`${environment.API_URL}/settings/getSettingByNames`, names)
      .pipe(catchError(this.handleError));
  }

  getSettingByName(name: string): Observable<DbSettings> {
    return this.http
      .get<DbSettings>(`${environment.API_URL}/settings/${name}`)
      .pipe(catchError(this.handleError));
  }

  findAll(): Observable<DbSettings[]> {
    return this.http
      .get<DbSettings[]>(`${environment.API_URL}/settings`)
      .pipe(catchError(this.handleError));
  }

  changePassword(payload: IChangePassword): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.API_URL}/auth/passwordChange`,
      payload,
    );
  }

  saveSettings(payload: DbSettings[]): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${environment.API_URL}/settings`,
      payload,
    );
  }
}
