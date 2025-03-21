import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ILoggedUser } from '../login/ILoggedUser';
import { ILoginUser } from '../login/ILoginUser';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    if (error.status === 400 && error.error.error === 'DuplicateEntry') {
      return throwError(() => new Error('Taka wartość już istnieje!'));
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  logUser(credentials: ILoginUser): Observable<ILoggedUser> {
    return this.http
      .post<ILoggedUser>(`${environment.API_URL}/auth/login`, credentials)
      .pipe(catchError(this.handleError));
  }
}
