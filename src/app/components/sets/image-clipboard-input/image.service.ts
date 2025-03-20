import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  constructor(private http: HttpClient) {}
  saveImage(
    userId: number,
    authorizationToken: string | null,
    setId: number,
    positionId: number,
    formData: FormData
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authorizationToken}`,
    });

    return this.http.post<any>(
      `${environment.API_URL}/images/${setId}/${positionId}?userId=${userId}`,
      formData,
      {
        headers,
      }
    );
  }
}
