import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { INewSet } from './new-set/INewSet';
import { ISet } from './ISet';
import { IPosition } from './positions/IPosition';

@Injectable({
  providedIn: 'root',
})
export class SetsService {
  constructor(private http: HttpClient) {}
  private handleError(error: HttpErrorResponse) {
    if (error.status === 400 && error.error.error === 'DuplicateEntry') {
      return throwError(
        () => new Error('Zestawienie o takiej nazwie już istnieje!')
      );
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  getSets(authorizationToken: string | null): Observable<ISet[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http
      .get<ISet[]>(`${environment.API_URL}/sets`, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  getPositions(
    authorizationToken: string,
    setId: string
  ): Observable<IPosition[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http
      .get<IPosition[]>(`${environment.API_URL}/sets/position/${setId}`, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  getSet(authorizationToken: string, setId: string): Observable<ISet[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http
      .get<ISet[]>(`${environment.API_URL}/sets/${setId}`, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  addSet(
    authorizationToken: string | null,
    newSet: INewSet
  ): Observable<INewSet> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http
      .post<INewSet>(`${environment.API_URL}/sets/new`, newSet, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }
}
