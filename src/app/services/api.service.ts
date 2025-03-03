import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUser } from '../login/User';
import { ILoggedUser } from '../login/LoggedUser';
import { IKlient } from '../components/klienci/IKlient';

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

  getClients(authorizationToken: string | null): Observable<IKlient[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http.get<IKlient[]>(`${environment.API_URL}/klienci`, {
      headers,
    });
  }
}
