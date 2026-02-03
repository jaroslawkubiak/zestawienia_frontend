import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../login/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  userId = () => this.authService.getUserId();
  authorizationToken = () => this.authService.getAuthorizationToken();
  get httpHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}
  saveImage(
    setId: number,
    setHash: string,
    positionId: number,
    formData: FormData,
  ): Observable<any> {
    return this.http.post<any>(
      `${
        environment.API_URL
      }/images/${setId}/${setHash}/${positionId}?userId=${this.userId()}`,
      formData,
      {
        headers: this.httpHeaders,
      },
    );
  }
}
