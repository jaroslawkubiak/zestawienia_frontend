import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUser } from '../types/User';
import { ILoggedUser } from '../types/LoggedUser';

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
}
