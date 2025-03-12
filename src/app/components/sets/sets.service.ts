import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { INewSet } from './new-set/INewSet';


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

  getSets(authorizationToken: string | null): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http
      .get<any[]>(`${environment.API_URL}/sets`, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  addSet(
    authorizationToken: string | null,
    newSet: Partial<INewSet>
  ): Observable<INewSet> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    // const { id, ...newClient } = newSet as Partial<INewSet>;

    return this.http
      .post<INewSet>(`${environment.API_URL}/sets/new`, newSet, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

}