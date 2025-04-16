import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { IComment } from './types/IComment';
import { INewComment } from './types/INewComment';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  userId = () => this.authService.getUserId();
  constructor(private http: HttpClient, private authService: AuthService) {}
  private handleError(error: HttpErrorResponse) {
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  addComment(
    message: string,
    setId: number,
    positionId: number
  ): Observable<IComment> {
    const newComment: INewComment = {
      comment: message,
      setId,
      positionId,
      authorType: 'user',
      authorId: Number(this.userId()),
    };

    return this.http
      .post<IComment>(`${environment.API_URL}/comments`, newComment, {})
      .pipe(catchError(this.handleError));
  }
}
