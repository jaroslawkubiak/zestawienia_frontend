import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IComment } from '../comments/types/IComment';
import { ISet } from '../sets/types/ISet';
import { IValidSetForClient } from './for-client/types/IValidSetForClient';
import { IValidSetForSupplier } from './for-supplier/types/IValidSetForSupplier';

@Injectable({
  providedIn: 'root',
})
export class ExternalService {
  get httpHeaders(): HttpHeaders {
    return new HttpHeaders();
  }
  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    if (error.status === 400 && error.error.error === 'DuplicateEntry') {
      return throwError(
        () => new Error('Zestawienie o takiej nazwie już istnieje!'),
      );
    }
    return throwError(() => new Error('Wystąpił błąd serwera.'));
  }

  loadClientSetData(setHash: string, clientHash: string) {
    if (!setHash || !clientHash) {
      return throwError(() => new Error('Invalid params'));
    }

    return this.validateSetAndHashForClient(setHash, clientHash);
  }

  loadSupplierSetData(setHash: string, supplierHash: string) {
    if (!setHash || !supplierHash) {
      return throwError(() => new Error('Invalid params'));
    }

    return this.validateSetAndHashForSupplier(setHash, supplierHash);
  }

  validateSetAndHashForClient(
    setHash: string,
    clientHash: string,
  ): Observable<IValidSetForClient | null> {
    return this.http
      .get<IValidSetForClient | null>(
        `${environment.API_URL}/external/open-for-client/${setHash}/${clientHash}/getSetForClient`,
      )
      .pipe(catchError(this.handleError));
  }

  validateSetAndHashForSupplier(
    setHash: string,
    supplierHash: string,
  ): Observable<IValidSetForSupplier | null> {
    return this.http
      .get<IValidSetForSupplier | null>(
        `${environment.API_URL}/external/open-for-supplier/${setHash}/${supplierHash}/getSetForSupplier`,
      )
      .pipe(catchError(this.handleError));
  }

  getCommentsForSet(
    setHash: string,
    clientHash: string,
  ): Observable<IComment[]> {
    return this.http
      .get<
        IComment[]
      >(`${environment.API_URL}/external/${setHash}/${clientHash}/getCommentsForSet`)
      .pipe(catchError(this.handleError));
  }

  getCommentsForPosition(positionId: number): Observable<IComment[]> {
    return this.http
      .get<
        IComment[]
      >(`${environment.API_URL}/external/${positionId}/getCommentsForPosition`)
      .pipe(catchError(this.handleError));
  }

  updateLastActiveClientBookmark(
    setHash: string,
    newBookmark: number,
  ): Observable<ISet> {
    return this.http.patch<ISet>(
      `${environment.API_URL}/external/${setHash}/${newBookmark}/updateLastActiveClientBookmark`,
      {
        headers: this.httpHeaders,
      },
    );
  }
}
