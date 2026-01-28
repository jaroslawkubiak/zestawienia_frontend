import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../login/auth.service';
import { IUser } from '../../../login/types/IUser';
import { IBookmarksWithTableColumns } from '../../bookmarks/types/IBookmarksWithTableColumns';
import { SuppliersService } from '../../suppliers/suppliers.service';
import { IPosition } from '../positions-table/types/IPosition';
import { IPositionStatus } from '../positions-table/types/IPositionStatus';
import { PositionStatusList } from '../PositionStatusList';
import { IClonePosition } from '../types/IClonePosition';
import { ICompleteSet } from '../types/ICompleteSet';
import { INewEmptyPosition } from '../types/INewEmptyPosition';
import { INewSet } from '../types/INewSet';
import { ISet } from '../types/ISet';
import { IUpdateSet } from '../types/IUpdateSet';
import { IValidSetForClient } from '../types/IValidSetForClient';
import { IValidSetForSupplier } from '../types/IValidSetForSupplier';

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
  ) {}

  private handleError(error: HttpErrorResponse) {
    if (error.status === 400 && error.error.error === 'DuplicateEntry') {
      return throwError(
        () => new Error('Zestawienie o takiej nazwie już istnieje!'),
      );
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  getPositions(setId: number): Observable<IPosition[]> {
    return this.http
      .get<
        IPosition[]
      >(`${environment.API_URL}/positions/${setId}/getPositions`)
      .pipe(catchError(this.handleError));
  }

  getPositionsForSupplier(
    setId: number,
    supplierId: number,
  ): Observable<IPosition[]> {
    return this.http
      .get<
        IPosition[]
      >(`${environment.API_URL}/positions/${setId}/${supplierId}/getPositionList`)
      .pipe(catchError(this.handleError));
  }

  getSet(setId: number): Observable<ISet> {
    return this.http
      .get<ISet>(`${environment.API_URL}/sets/${setId}/getSet`)
      .pipe(catchError(this.handleError));
  }

  validateSetAndHashForClient(
    setHash: string,
    clientHash: string,
  ): Observable<IValidSetForClient | null> {
    return this.http
      .get<IValidSetForClient | null>(
        `${environment.API_URL}/sets/open-for-client/${setHash}/${clientHash}`,
      )
      .pipe(catchError(this.handleError));
  }

  validateSetAndHashForSupplier(
    setHash: string,
    supplierHash: string,
  ): Observable<IValidSetForSupplier | null> {
    return this.http
      .get<IValidSetForSupplier | null>(
        `${environment.API_URL}/sets/open-for-supplier/${setHash}/${supplierHash}`,
      )
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
          return {
            ...position,
            status: position.status
              ? this.positionStatus.find(
                  (item) => position.status === item.label,
                ) || ''
              : position.status,
          };
        });

        return { set, positions: updatedPositions, suppliers };
      }),
    );
  }

  addEmptyPosition(
    set: ISet,
    selectedBookmarkId: number,
    kolejnosc: number,
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
      .post<IPosition>(`${environment.API_URL}/positions/addNew`, newPosition, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  cloneAndPreparePosition(
    positionId: number,
    formData: IPosition[],
    bookmarks: IBookmarksWithTableColumns[],
    selectedBookmarkId: number,
    setId: number,
  ): Observable<IPosition> {
    const original = formData.find((p) => p.id === positionId);

    if (!original) {
      return throwError(
        () => new Error(`Position with ID ${positionId} not found`),
      );
    }

    const bookmark = bookmarks.find((b) => b.id === selectedBookmarkId);
    if (!bookmark) {
      return throwError(
        () => new Error(`Bookmark with ID ${selectedBookmarkId} not found`),
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
        { headers },
      )
      .pipe(
        map((response: IPosition) => {
          // if response.status = string — change for object from list
          if (response.status) {
            const statusObj = this.positionStatus.find(
              (s) => s.label === response.status,
            );
            response.status = (statusObj as IPositionStatus) || '';
          }

          return response;
        }),
        catchError(this.handleError),
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
        `${environment.API_URL}/sets/${savedSet.set.id}/saveSet`,
        createSavedSet,
        {
          headers,
        },
      )
      .pipe(catchError(this.handleError));
  }

  // take edited data from form and update this.positions array
  updatePosition(
    positions: IPosition[],
    formData: IPosition[],
    positionToDelete: Set<number>,
  ): IPosition[] {
    const formDataMap = new Map(
      formData.map((form: IPosition) => [form.id, form]),
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
