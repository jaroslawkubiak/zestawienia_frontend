import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { ISupplier } from './types/ISupplier';

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  authorizationToken = () => this.authService.getAuthorizationToken();
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
      return throwError(() => new Error(error.error.message));
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  getSuppliers(): Observable<ISupplier[]> {
    return this.http
      .get<ISupplier[]>(`${environment.API_URL}/suppliers/getSuppliers`, {
        headers: this.httpHeaders,
      })
      .pipe(catchError(this.handleError));
  }

  addSupplier(supplier: Partial<ISupplier>): Observable<ISupplier> {
    const { id, ...newSupplier } = supplier as Partial<ISupplier>;

    return this.http
      .post<ISupplier>(
        `${environment.API_URL}/suppliers/addSupplier`,
        newSupplier,
        {
          headers: this.httpHeaders,
        },
      )
      .pipe(catchError(this.handleError));
  }

  removeSuppliers(ids: number[]): Observable<any> {
    return this.http
      .request('delete', `${environment.API_URL}/suppliers/deleteSupplier`, {
        body: { ids },
        headers: this.httpHeaders,
      })
      .pipe(catchError(this.handleError));
  }

  saveSupplier(supplier: Partial<ISupplier>): Observable<ISupplier> {
    const { id, ...updatedSupplier } = supplier as Partial<ISupplier>;

    return this.http
      .patch<ISupplier>(
        `${environment.API_URL}/suppliers/${id}/saveSupplier`,
        updatedSupplier,
        {
          headers: this.httpHeaders,
        },
      )
      .pipe(catchError(this.handleError));
  }
}
