import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { IComment } from './types/IComment';
import { INewComment } from './types/INewComment';
import { IUpdatedComment } from './types/IUpdatedComment';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  userId = () => this.authService.getUserId();
  userName = () => this.authService.getUserName();
  constructor(private http: HttpClient, private authService: AuthService) {}
  private handleError(error: HttpErrorResponse) {
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  addComment(
    comment: string,
    setId: number,
    positionId: number
  ): Observable<IComment> {
    const newComment: INewComment = {
      comment,
      setId,
      positionId,
      authorType: 'user',
      authorId: Number(this.userId()),
      authorName: this.userName() || '',
    };

    return this.http
      .post<IComment>(`${environment.API_URL}/comments/add`, newComment)
      .pipe(catchError(this.handleError));
  }

  editComment(commentId: number, comment: string): Observable<IComment> {
    const updatedComment: IUpdatedComment = {
      comment: comment,
      commentId: commentId,
      authorId: Number(this.userId()),
      authorName: this.userName() || '',
    };

    return this.http
      .patch<IComment>(`${environment.API_URL}/comments/edit`, updatedComment)
      .pipe(catchError(this.handleError));
  }

  deleteComment(id: number): Observable<any> {
    return this.http
      .delete<any>(`${environment.API_URL}/comments/${id}`)
      .pipe(catchError(this.handleError));
  }
}
