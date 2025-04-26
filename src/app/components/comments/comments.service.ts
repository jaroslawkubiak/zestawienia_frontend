import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { ISet } from '../sets/types/ISet';
import { IComment } from './types/IComment';
import { IEditedComment } from './types/IEditedComment';
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
    positionId: number,
    set: ISet
  ): Observable<IComment> {
    const isClient = !!set?.clientId?.id;
    const newComment: INewComment = {
      comment,
      setId,
      positionId,
      authorType: isClient ? 'client' : 'user',
      authorId: isClient ? set.clientId.id : Number(this.userId()),
      authorName: isClient ? set.clientId.imie : this.userName() || '',
    };

    return this.http
      .post<IComment>(`${environment.API_URL}/comments/add`, newComment)
      .pipe(catchError(this.handleError));
  }

  editComment(editedComment: IEditedComment): Observable<IComment> {
    const updatedComment: Partial<IUpdatedComment> = {
      comment: editedComment.comment,
      commentId: editedComment.commentId,
    };

    // if user edit comment
    if (!editedComment.clientId) {
      updatedComment.authorId = Number(this.userId());
      updatedComment.authorName = this.userName() || '';
    } else {
      updatedComment.authorId = editedComment.clientId;
      updatedComment.authorName = editedComment.authorName;
    }

    return this.http
      .patch<IComment>(`${environment.API_URL}/comments/edit`, updatedComment)
      .pipe(catchError(this.handleError));
  }

  deleteComment(id: number): Observable<any> {
    return this.http
      .delete<any>(`${environment.API_URL}/comments/${id}`)
      .pipe(catchError(this.handleError));
  }

  toggleCommentRead(id: number): Observable<IComment> {
    const body = {
      id,
    };

    return this.http
      .patch<IComment>(`${environment.API_URL}/comments/`, body)
      .pipe(catchError(this.handleError));
  }

  markAllComments(
    positionId: number,
    readState: boolean,
    authorType: 'user' | 'client'
  ): Observable<IComment[]> {
    const body = {
      positionId,
      readState,
      authorType,
    };

    return this.http
      .patch<IComment[]>(`${environment.API_URL}/comments/positions`, body)
      .pipe(catchError(this.handleError));
  }
}
