import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PositionService {
  constructor(private http: HttpClient) {}
  private handleError(error: HttpErrorResponse) {
    if (error.status === 400 && error.error.error === 'DuplicateEntry') {
      return throwError(
        () => new Error('Pozycja o takiej nazwie już istnieje!')
      );
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  getSets(authorizationToken: string | null): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http
      .get<any[]>(`${environment.API_URL}/position`, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }
}
