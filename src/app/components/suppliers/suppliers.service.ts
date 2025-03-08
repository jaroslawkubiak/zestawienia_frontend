import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ISupplier } from './ISupplier';

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    if (error.status === 400 && error.error.error === 'DuplicateEntry') {
      return throwError(
        () => new Error('Dostawca o takiej nazwie już istnieje!')
      );
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  getSuppliers(authorizationToken: string | null): Observable<ISupplier[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http
      .get<ISupplier[]>(`${environment.API_URL}/suppliers`, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  addSupplier(
    authorizationToken: string | null,
    supplier: Partial<ISupplier>
  ): Observable<ISupplier> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    const { id, ...newSupplier } = supplier as Partial<ISupplier>;

    return this.http
      .post<ISupplier>(`${environment.API_URL}/suppliers`, newSupplier, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  removeSuppliers(
    authorizationToken: string | null,
    ids: number[]
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http
      .request('delete', `${environment.API_URL}/suppliers/`, {
        body: { ids },
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  saveSupplier(
    authorizationToken: string | null,
    supplier: Partial<ISupplier>
  ): Observable<ISupplier> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });
    const { id, ...updatedSupplier } = supplier as Partial<ISupplier>;

    return this.http
      .patch<ISupplier>(
        `${environment.API_URL}/suppliers/${id}`,
        updatedSupplier,
        {
          headers,
        }
      )
      .pipe(catchError(this.handleError));
  }
}
