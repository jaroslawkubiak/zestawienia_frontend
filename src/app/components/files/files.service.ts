import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { NotificationService } from '../../services/notification.service';
import { IFileFullDetails } from './types/IFileFullDetails';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  authorizationToken = () => this.authService.getAuthorizationToken();
  userId = () => this.authService.getUserId();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  // save created zip from set files
  downloadFiles(ids: number[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http.post(
      `${environment.API_URL}/files/download-zip`,
      { ids },
      {
        headers,
        responseType: 'blob',
      }
    );
  }

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
  saveFile(
    setId: number,
    setHash: string,
    formData: FormData,
    uploadFolder: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http.post<any>(
      `${environment.API_URL}/files/upload/${setId}/${setHash}/${uploadFolder}`,
      formData,
      {
        reportProgress: true,
        observe: 'events',
        headers,
      }
    );
  }

  // download file and save on client
  downloadAndSaveFile(file: IFileFullDetails): void {
    const url = `${environment.API_URL}/files/download/${file.setId.id}/${file.id}`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (fileBlob) => {
        saveAs(fileBlob, file.fileName);
      },
      error: async (err) => {
        if (err.error instanceof Blob) {
          const text = await err.error.text();
          const json = JSON.parse(text);
          this.notificationService.showNotification('error', json.message);
        }
      },
    });
  }

  // delete one file
  deleteFile(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http.delete<any>(`${environment.API_URL}/files/${id}`, {
      headers,
    });
  }

  // batch delete files
  deleteFiles(ids: number[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http.delete<any>(`${environment.API_URL}/files`, {
      headers,
      body: { ids },
    });
  }
}
