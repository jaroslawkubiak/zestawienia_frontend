import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { INewSet } from './types/INewSet';
import { ISet } from './types/ISet';

@Injectable({
  providedIn: 'root',
})
export class SetsService {
  authorizationToken = () => this.authService.getAuthorizationToken();
  userId = () => this.authService.getUserId();

  constructor(private http: HttpClient, private authService: AuthService) {}
  private handleError(error: HttpErrorResponse) {
    if (error.status === 400 && error.error.error === 'DuplicateEntry') {
      return throwError(
        () => new Error('Zestawienie o takiej nazwie już istnieje!')
      );
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  getSets(): Observable<ISet[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http
      .get<ISet[]>(`${environment.API_URL}/sets`, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  addSet(newSet: INewSet): Observable<INewSet> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    const createSet: INewSet = { ...newSet, createdBy: Number(this.userId()) };

    return this.http
      .post<INewSet>(`${environment.API_URL}/sets/new`, createSet, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }
}
