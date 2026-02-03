import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';

@Injectable({
  providedIn: 'root',
})
export class BookmarksService {
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
      return throwError(() => new Error('DuplicateEntry'));
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  getBookmarks(): Observable<any[]> {
    return this.http
      .get<any[]>(`${environment.API_URL}/bookmarks`, {
        headers: this.httpHeaders,
      })
      .pipe(catchError(this.handleError));
  }
}
