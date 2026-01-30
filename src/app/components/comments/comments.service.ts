import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { IComment } from './types/IComment';
import { IEditedPartialComment } from './types/IEditedPartialComment';
import { INewComment } from './types/INewComment';
import { INewPartialComment } from './types/INewPartialComment';
import { IUnreadComments } from './types/IUnreadComments';
import { IUpdatedComment } from './types/IUpdatedComment';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  userId = () => this.authService.getUserId();
  userName = () => this.authService.getUserName();
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}
  private handleError(error: HttpErrorResponse) {
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  getCommentsForPosition(positionId: number): Observable<IComment[]> {
    return this.http
      .get<
        IComment[]
      >(`${environment.API_URL}/comments/${positionId}/getCommentsForPosition`)
      .pipe(catchError(this.handleError));
  }

  addComment(newComment: INewPartialComment): Observable<IComment> {
    const isClient = newComment.authorType === 'client';
    const set = newComment.set;

    const updatedNewComment: INewComment = {
      ...newComment,
      authorId: isClient ? set.clientId.id : Number(this.userId()),
      authorName: isClient ? set.clientId.firstName : this.userName(),
    };

    return this.http
      .post<IComment>(
        `${environment.API_URL}/comments/addComment`,
        updatedNewComment,
      )
      .pipe(catchError(this.handleError));
  }

  editComment(editedComment: IEditedPartialComment): Observable<IComment> {
    const isClient = editedComment.authorType === 'client';
    const set = editedComment.set;

    const updatedComment: IUpdatedComment = {
      comment: editedComment.comment,
      commentId: editedComment.commentId,
      authorId: isClient ? set.clientId.id : Number(this.userId()),
      authorName: isClient ? set.clientId.firstName : this.userName(),
    };

    return this.http
      .patch<IComment>(
        `${environment.API_URL}/comments/editComment`,
        updatedComment,
      )
      .pipe(catchError(this.handleError));
  }

  deleteComment(id: number) {
    return this.http
      .delete(`${environment.API_URL}/comments/${id}/deleteComment`)
      .pipe(catchError(this.handleError));
  }

  toggleCommentAsNeedAttention(id: number): Observable<IComment> {
    const body = {
      id,
    };

    return this.http
      .patch<IComment>(`${environment.API_URL}/comments/needsAttention`, body)
      .pipe(catchError(this.handleError));
  }

  markAllCommentsAsNeedsAttention(
    positionId: number,
    readState: boolean,
    authorType: 'user' | 'client',
  ): Observable<IComment[]> {
    const oppositeAuthorType = authorType === 'user' ? 'client' : 'user';
    const body = {
      positionId,
      readState,
      authorType: oppositeAuthorType,
    };

    return this.http
      .patch<
        IComment[]
      >(`${environment.API_URL}/comments/allNeedsAttention`, body)
      .pipe(catchError(this.handleError));
  }

  // for welcome screen
  unreadComments(): Observable<IUnreadComments> {
    return this.http
      .get<IUnreadComments>(`${environment.API_URL}/comments/unreadComments`)
      .pipe(catchError(this.handleError));
  }

  // when open comments dialog - mark all unread comment as seenAt
  markAllCommentsAsSeen(positionId: number, authorType: 'user' | 'client') {
    return this.http.post<void>(
      `${environment.API_URL}/comments/markAllAsSeen`,
      {
        positionId,
        authorType,
      },
    );
  }
}
