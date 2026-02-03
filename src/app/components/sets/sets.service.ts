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
import { ISavedSet } from './types/ISavedSet';
import { ISet } from './types/ISet';

@Injectable({
  providedIn: 'root',
})
export class SetsService {
  authorizationToken = () => this.authService.getAuthorizationToken();
  userId = () => this.authService.getUserId();
  get httpHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}
  private handleError(error: HttpErrorResponse) {
    if (error.status === 400 && error.error.error === 'DuplicateEntry') {
      return throwError(
        () => new Error('Zestawienie o takiej nazwie już istnieje!'),
      );
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  getSets(): Observable<ISet[]> {
    return this.http
      .get<ISet[]>(`${environment.API_URL}/sets/getSets`, {
        headers: this.httpHeaders,
      })
      .pipe(catchError(this.handleError));
  }

  addSet(newSet: INewSet): Observable<ISavedSet> {
    const createSet: INewSet = { ...newSet, createdBy: Number(this.userId()) };

    return this.http
      .post<ISavedSet>(`${environment.API_URL}/sets/addNew`, createSet, {
        headers: this.httpHeaders,
      })
      .pipe(catchError(this.handleError));
  }

  remove(id: number): Observable<any> {
    return this.http
      .delete<any>(`${environment.API_URL}/sets/${id}`, {
        headers: this.httpHeaders,
      })
      .pipe(catchError(this.handleError));
  }
}
