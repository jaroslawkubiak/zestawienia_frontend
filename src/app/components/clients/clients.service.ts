import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IClient } from './IClient';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    if (error.status === 400 && error.error.error === 'DuplicateEntry') {
      return throwError(() => new Error('Klient o takiej nazwie już istnieje!'));
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  getClients(authorizationToken: string | null): Observable<IClient[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http
      .get<IClient[]>(`${environment.API_URL}/clients`, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  addClient(
    authorizationToken: string | null,
    client: Partial<IClient>
  ): Observable<IClient> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    const { id, ...newClient } = client as Partial<IClient>;

    return this.http
      .post<IClient>(`${environment.API_URL}/clients`, newClient, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  saveClient(
    authorizationToken: string | null,
    client: Partial<IClient>
  ): Observable<IClient> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });
    const { id, ...updatedClient } = client as Partial<IClient>;

    return this.http
      .patch<IClient>(`${environment.API_URL}/clients/${id}`, updatedClient, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  removeClients(
    authorizationToken: string | null,
    ids: number[]
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http
      .request('delete', `${environment.API_URL}/clients/`, {
        body: { ids },
        headers,
      })
      .pipe(catchError(this.handleError));
  }
}
