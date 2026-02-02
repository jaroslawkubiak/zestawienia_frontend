import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EditSetService } from '../../sets/edit-set/edit-set.service';
import { ISet } from '../../sets/types/ISet';

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

  updateLastUsedClientBookmark(
    setHash: string,
    newBookmark: number,
  ): Observable<ISet> {
    return this.http.patch<ISet>(
      `${environment.API_URL}/sets/${setHash}/${newBookmark}/lastUsedClientBookmark`,
      {
        headers: this.httpHeaders,
      },
    );
  }
}
