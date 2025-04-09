import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../login/auth.service';
import { IUser } from '../../../login/IUser';
import { IFileList } from '../../../services/types/IFileList';
import { SuppliersService } from '../../suppliers/suppliers.service';
import { ISupplier } from '../../suppliers/types/ISupplier';
import { IClonePosition } from '../types/IClonePosition';
import { INewEmptyPosition } from '../types/INewEmptyPosition';
import { INewSet } from '../types/INewSet';
import { IPosition } from '../types/IPosition';
import { ISet } from '../types/ISet';
import { IUpdateSet } from '../types/IUpdateSet';
import { IPositionStatus, PositionStatusList } from './PositionStatus';

interface ICompleteSet {
  set: ISet;
  positions: IPosition[];
  suppliers: ISupplier[];
}

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
    private authService: AuthService
  ) {}
  private handleError(error: HttpErrorResponse) {
    if (error.status === 400 && error.error.error === 'DuplicateEntry') {
      return throwError(
        () => new Error('Zestawienie o takiej nazwie już istnieje!')
      );
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  getPositions(setId: string): Observable<IPosition[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http
      .get<IPosition[]>(`${environment.API_URL}/positions/${setId}`, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  getSet(setId: string): Observable<ISet> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http
      .get<ISet>(`${environment.API_URL}/sets/${setId}`, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  getSetFiles(setId: string): Observable<IFileList> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http
      .get<IFileList>(`${environment.API_URL}/files/${setId}`, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  loadSetData(setId: string): Observable<ICompleteSet> {
    return forkJoin({
      set: this.getSet(setId),
      positions: this.getPositions(setId),
      suppliers: this.supplierService.getSuppliers(),
    }).pipe(
      map(({ set, positions, suppliers }) => {
        const updatedPositions = positions.map((position) => ({
          ...position,
          status: position.status
            ? this.positionStatus.find((item) => position.status === item.label) || ''
            : position.status,
        }));

        return { set, positions: updatedPositions, suppliers };
      })
    );
  }

  addPosition(newPosition: INewEmptyPosition): Observable<IPosition> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    const createPosition: INewEmptyPosition = {
      ...newPosition,
      createdBy: { id: this.userId() } as IUser,
      updatedBy: { id: this.userId() } as IUser,
    };

    return this.http
      .post<IPosition>(`${environment.API_URL}/positions/new`, createPosition, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  clonePosition(clonePosition: IClonePosition): Observable<IPosition> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    const createClonePosition: INewEmptyPosition = {
      ...clonePosition,
      createdBy: { id: this.userId() } as IUser,
      updatedBy: { id: this.userId() } as IUser,
    };

    return this.http
      .post<IPosition>(
        `${environment.API_URL}/positions/clone`,
        createClonePosition,
        {
          headers,
        }
      )
      .pipe(catchError(this.handleError));
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

  // take edited data from form and update this.position array
  updatePosition(positions: IPosition[], formData: IPosition[]): IPosition[] {
    const formDataMap = new Map(
      formData.map((form: IPosition) => [form.id, form])
    );

    return positions.map((position: IPosition) => {
      const form = formDataMap.get(position.id);
      return form ? { ...position, ...form } : position;
    });
  }
}
