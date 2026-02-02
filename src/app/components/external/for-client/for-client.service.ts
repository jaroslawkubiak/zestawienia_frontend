import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ISet } from '../../sets/types/ISet';

@Injectable({
  providedIn: 'root',
})
export class ForClientService {
  get httpHeaders(): HttpHeaders {
    return new HttpHeaders();
  }

  constructor(private http: HttpClient) {}

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
