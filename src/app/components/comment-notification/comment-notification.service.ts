import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { ICommentNotificationLogs } from './types/ICommentNotificationLogs';
import { ICommentNotificationWithTimers } from './types/ICommentNotificationWithTimers';

@Injectable({
  providedIn: 'root',
})
export class CommentNotificationService {
  userId = () => this.authService.getUserId();
  authorizationToken = () => this.authService.getAuthorizationToken();

  get httpHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });
  }
  private handleError(error: HttpErrorResponse) {
    if (error.status === 400 && error.error.error === 'DuplicateEntry') {
      return throwError(
        () => new Error('Zestawienie o takiej nazwie już istnieje!'),
      );
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  getCommentNotifications(): Observable<ICommentNotificationWithTimers> {
    return this.http
      .get<ICommentNotificationWithTimers>(
        `${environment.API_URL}/comment-notification/getAllCommentNotificationLogs`,
        {
          headers: this.httpHeaders,
        },
      )
      .pipe(catchError(this.handleError));
  }
}
