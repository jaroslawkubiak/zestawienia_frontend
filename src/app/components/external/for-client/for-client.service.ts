import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EditSetService } from '../../sets/edit-set/edit-set.service';
import { ISet } from '../../sets/types/ISet';
import { IComment } from '../../comments/types/IComment';

@Injectable({
  providedIn: 'root',
})
export class ForClientService {
  get httpHeaders(): HttpHeaders {
    return new HttpHeaders();
  }

  constructor(
    private http: HttpClient,
    private editSetService: EditSetService,
  ) {}

  loadClientSetData(setHash: string, clientHash: string) {
    if (!setHash || !clientHash) {
      return throwError(() => new Error('Invalid params'));
    }

    return this.editSetService.validateSetAndHashForClient(setHash, clientHash);
  }

  getCommentsForSet(setId: number): Observable<IComment[]> {
    return this.editSetService.getCommentsForSet(setId);
  }

  updateLastActiveClientBookmark(
    setHash: string,
    newBookmark: number,
  ): Observable<ISet> {
    return this.http.patch<ISet>(
      `${environment.API_URL}/sets/${setHash}/${newBookmark}/lastActiveClientBookmark`,
      {
        headers: this.httpHeaders,
      },
    );
  }
}
