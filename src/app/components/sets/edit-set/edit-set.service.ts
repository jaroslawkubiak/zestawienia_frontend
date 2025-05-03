import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../login/auth.service';
import { IUser } from '../../../login/types/IUser';
import { IBookmark } from '../../bookmarks/IBookmark';
import { SuppliersService } from '../../suppliers/suppliers.service';
import { SetsService } from '../sets.service';
import { IClonePosition } from '../types/IClonePosition';
import { ICompleteSet } from '../types/ICompleteSet';
import { INewEmptyPosition } from '../types/INewEmptyPosition';
import { INewSet } from '../types/INewSet';
import { IPosition } from '../types/IPosition';
import { ISet } from '../types/ISet';
import { IUpdateSet } from '../types/IUpdateSet';
import { IPositionStatus, PositionStatusList } from './PositionStatus';

@Injectable({
  providedIn: 'root',
})
export class EditSetService {
  authorizationToken = () => this.authService.getAuthorizationToken();
  userId = () => this.authService.getUserId();
  positionStatus: IPositionStatus[] = PositionStatusList;

  constructor(
    private http: HttpClient,
    private supplierService: SuppliersService,
    private authService: AuthService,
    private setsService: SetsService
  ) {}
  private handleError(error: HttpErrorResponse) {
    if (error.status === 400 && error.error.error === 'DuplicateEntry') {
      return throwError(
        () => new Error('Zestawienie o takiej nazwie już istnieje!')
      );
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  getPositions(setId: number): Observable<IPosition[]> {
    return this.http
      .get<IPosition[]>(`${environment.API_URL}/positions/${setId}`)
      .pipe(catchError(this.handleError));
  }

  getSet(setId: number): Observable<ISet> {
    return this.http
      .get<ISet>(`${environment.API_URL}/sets/${setId}`)
      .pipe(catchError(this.handleError));
  }

  validateSetAndHash(setId: number, hash: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${environment.API_URL}/sets/${setId}/${hash}`)
      .pipe(catchError(this.handleError));
  }

  loadSetData(setId: number): Observable<ICompleteSet> {
    return forkJoin({
      set: this.getSet(setId),
      positions: this.getPositions(setId),
      suppliers: this.supplierService.getSuppliers(),
    }).pipe(
      map(({ set, positions, suppliers }) => {
        const updatedPositions = positions.map((position) => {
          const comments =
            set.comments?.filter(
              (comment) => comment.positionId.id === position.id
            ) || [];

          const newComments =
            comments.length > 0
              ? this.setsService.countNewComments(comments, 'user')
              : undefined;

          return {
            ...position,
            comments,
            newComments,
            status: position.status
              ? this.positionStatus.find(
                  (item) => position.status === item.label
                ) || ''
              : position.status,
          };
        });

        if (set.comments) {
          const newComments = this.setsService.countNewComments(
            set.comments,
            'user'
          );
          set = { ...set, newComments };
        }

        return { set, positions: updatedPositions, suppliers };
      })
    );
  }

  addEmptyPosition(
    set: ISet,
    selectedBookmarkId: number,
    kolejnosc: number
  ): Observable<IPosition> {
    const bookmark = set.bookmarks.find((b) => b.id === selectedBookmarkId);

    if (!bookmark) {
      return throwError(() => new Error('Nie znaleziono zakładki'));
    }

    const newPosition: INewEmptyPosition = {
      kolejnosc,
      bookmarkId: bookmark,
      setId: { id: +set.id } as ISet,
      createdBy: { id: this.userId() } as IUser,
      updatedBy: { id: this.userId() } as IUser,
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http
      .post<IPosition>(`${environment.API_URL}/positions/new`, newPosition, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  cloneAndPreparePosition(
    positionId: number,
    formData: IPosition[],
    bookmarks: IBookmark[],
    selectedBookmarkId: number,
    setId: number
  ): Observable<IPosition> {
    const original = formData.find((p) => p.id === positionId);

    if (!original) {
      return throwError(
        () => new Error(`Position with ID ${positionId} not found`)
      );
    }

    const bookmark = bookmarks.find((b) => b.id === selectedBookmarkId);
    if (!bookmark) {
      return throwError(
        () => new Error(`Bookmark with ID ${selectedBookmarkId} not found`)
      );
    }

    const { id, comments, newComments, ...cloneData } = original;

    const cloneStatus =
      cloneData.status &&
      typeof cloneData.status === 'object' &&
      'label' in cloneData.status
        ? cloneData.status.label
        : cloneData.status;

    const newClonePosition: IClonePosition = {
      ...cloneData,
      bookmarkId: bookmark,
      status: cloneStatus,

      setId: { id: +setId } as ISet,
      createdBy: { id: this.userId() } as IUser,
      updatedBy: { id: this.userId() } as IUser,
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http
      .post<IPosition>(
        `${environment.API_URL}/positions/clone`,
        newClonePosition,
        { headers }
      )
      .pipe(
        map((response: IPosition) => {
          // if response.status = string — change for object from list
          if (response.status) {
            const statusObj = this.positionStatus.find(
              (s) => s.label === response.status
            );
            response.status = (statusObj as IPositionStatus) || '';
          }

          return response;
        }),
        catchError(this.handleError)
      );
  }
  saveSet(savedSet: IUpdateSet): Observable<INewSet> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    const createSavedSet: IUpdateSet = {
      ...savedSet,
      userId: this.userId(),
    };

    return this.http
      .patch<INewSet>(
        `${environment.API_URL}/sets/${savedSet.set.id}`,
        createSavedSet,
        {
          headers,
        }
      )
      .pipe(catchError(this.handleError));
  }

  // take edited data from form and update this.positions array
  updatePosition(
    positions: IPosition[],
    formData: IPosition[],
    positionToDelete: Set<number>
  ): IPosition[] {
    const formDataMap = new Map(
      formData.map((form: IPosition) => [form.id, form])
    );

    // update data from form to all set positions and filter out deleted positions
    const updatedPositions = positions
      .filter((item) => !positionToDelete.has(item.id))
      .map((position: IPosition) => {
        const form = formDataMap.get(position.id);
        return form ? { ...position, ...form } : position;
      });

    return updatedPositions;
  }
}
