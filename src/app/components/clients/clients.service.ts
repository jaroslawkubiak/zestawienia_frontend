import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { IClient } from './IClient';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  authorizationToken = () => this.authService.getAuthorizationToken();

  constructor(private http: HttpClient, private authService: AuthService) {}

  private handleError(error: HttpErrorResponse) {
    if (error.status === 400 && error.error.error === 'DuplicateEntry') {
      return throwError(() => new Error(error.error.message));
    } else if (error.error.message) {
      return throwError(() => new Error(error.error.message));
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  getClients(): Observable<IClient[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http
      .get<IClient[]>(`${environment.API_URL}/clients`, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  addClient(client: Partial<IClient>): Observable<IClient> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    const { id, ...newClient } = client as Partial<IClient>;

    return this.http
      .post<IClient>(`${environment.API_URL}/clients`, newClient, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  saveClient(client: Partial<IClient>): Observable<IClient> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });
    const { id, ...updatedClient } = client as Partial<IClient>;

    return this.http
      .patch<IClient>(`${environment.API_URL}/clients/${id}`, updatedClient, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  removeClients(ids: number[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http
      .request('delete', `${environment.API_URL}/clients/`, {
        body: { ids },
        headers,
      })
      .pipe(catchError(this.handleError));
  }
}
