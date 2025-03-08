import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUser } from '../login/User';
import { ILoggedUser } from '../login/LoggedUser';
import { IClient } from '../components/clients/IClient';
import { ISupplier } from '../components/suppliers/ISupplier';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  logUser(credentials: IUser): Observable<ILoggedUser> {
    return this.http.post<ILoggedUser>(
      `${environment.API_URL}/auth/login`,
      credentials
    );
  }

  getClients(authorizationToken: string | null): Observable<IClient[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http.get<IClient[]>(`${environment.API_URL}/clients`, {
      headers,
    });
  }

  addClient(
    authorizationToken: string | null,
    client: Partial<IClient>
  ): Observable<IClient> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    const { id, ...newClient } = client as Partial<IClient>;

    return this.http.post<IClient>(
      `${environment.API_URL}/clients`,
      newClient,
      {
        headers,
      }
    );
  }

  saveClient(
    authorizationToken: string | null,
    client: Partial<IClient>
  ): Observable<IClient> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });
    const { id, ...updatedClient } = client as Partial<IClient>;

    return this.http.patch<IClient>(
      `${environment.API_URL}/clients/${id}`,
      updatedClient,
      {
        headers,
      }
    );
  }

  removeClients(
    authorizationToken: string | null,
    ids: number[]
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http.request('delete', `${environment.API_URL}/clients/`, {
      body: { ids },
      headers,
    });
  }

  //TODO FIX
  getSuppliers(authorizationToken: string | null): Observable<ISupplier[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http.get<ISupplier[]>(`${environment.API_URL}/suppliers`, {
      headers,
    });
  }

  //TODO FIX
  addSupplier(
    authorizationToken: string | null,
    client: Partial<IClient>
  ): Observable<IClient> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    const { id, ...newClient } = client as Partial<IClient>;

    return this.http.post<IClient>(
      `${environment.API_URL}/clients`,
      newClient,
      {
        headers,
      }
    );
  }

  //TODO FIX
  removeSuppliers(
    authorizationToken: string | null,
    ids: number[]
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http.request('delete', `${environment.API_URL}/clients/`, {
      body: { ids },
      headers,
    });
  }

  //TODO FIX
  saveSupplier(
    authorizationToken: string | null,
    client: Partial<IClient>
  ): Observable<IClient> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });
    const { id, ...updatedClient } = client as Partial<IClient>;

    return this.http.patch<IClient>(
      `${environment.API_URL}/clients/${id}`,
      updatedClient,
      {
        headers,
      }
    );
  }
}
