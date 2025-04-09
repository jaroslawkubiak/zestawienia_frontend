import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../login/auth.service';
import { IFileDetails } from '../components/sets/show-files/types/IFileDetails';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  authorizationToken = () => this.authService.getAuthorizationToken();
  userId = () => this.authService.getUserId();
  BASE_URL = 'http://localhost:3005/uploads/sets/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // save created pdf from set
  savePdf(setId: number, formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http.post<any>(
      `${environment.API_URL}/files/upload/${setId}/pdf`,
      formData,
      {
        headers,
      }
    );
  }

  // save attached files to set
  saveFile(setId: number, formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http.post<any>(
      `${environment.API_URL}/files/upload/${setId}/files`,
      formData,
      {
        reportProgress: true,
        observe: 'events',
        headers,
      }
    );
  }

  // download file as blob
  downloadFile(
    setId: number,
    innerPath: string,
    fileName: string
  ): Observable<Blob> {
    const url = `${this.BASE_URL}${setId}/${innerPath}/${fileName}`;

    return this.http.get(url, {
      headers: new HttpHeaders(),
      responseType: 'blob',
    });
  }

  // download file and save on client
  downloadAndSaveFile(setId: number, file: IFileDetails): void {
    this.downloadFile(setId, file.dir, file.name).subscribe(
      (fileBlob: Blob) => {
        saveAs(fileBlob, file.name);
      }
    );
  }

  deleteFile(setId: number, file: IFileDetails): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http.delete<any>(
      `${environment.API_URL}/files/${setId}/${file.dir}/${file.name}`,
      {
        headers,
      }
    );
  }
}
