import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { NotificationService } from '../../services/notification.service';
import { IDeletedFileResponse } from './types/IDeletedFileResponse';
import { IFileFullDetails } from './types/IFileFullDetails';
import { IUploadFileResponse } from './types/IUploadFileResponse';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  authorizationToken = () => this.authService.getAuthorizationToken();
  userId = () => this.authService.getUserId();
  get httpHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  // save created zip from set files
  downloadFiles(ids: number[]): Observable<Blob> {
    return this.http.post(
      `${environment.API_URL}/files/download-zip`,
      { ids },
      {
        headers: this.httpHeaders,
        responseType: 'blob',
      },
    );
  }

  // save created pdf from set
  savePdf(setId: number, formData: FormData): Observable<any> {
    return this.http.post<any>(
      `${environment.API_URL}/files/upload/${setId}/pdf`,
      formData,
      {
        headers: this.httpHeaders,
      },
    );
  }

  // save attached files to set
  saveFile(
    setId: number,
    setHash: string,
    formData: FormData,
    uploadFolder: string,
  ): Observable<HttpEvent<IUploadFileResponse>> {
    return this.http.post<IUploadFileResponse>(
      `${environment.API_URL}/files/upload/${setId}/${setHash}/${uploadFolder}`,
      formData,
      {
        reportProgress: true,
        observe: 'events',
        headers: this.httpHeaders,
      },
    );
  }

  // download file and save on client
  downloadAndSaveFile(file: IFileFullDetails, setId: number): void {
    const url = `${environment.API_URL}/files/download/${setId}/${file.id}`;

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
  deleteFile(id: number): Observable<IDeletedFileResponse> {
    return this.http.delete<IDeletedFileResponse>(
      `${environment.API_URL}/files/${id}/deleteFile`,
      {
        headers: this.httpHeaders,
      },
    );
  }

  // batch delete files
  deleteFiles(ids: number[]): Observable<void> {
    return this.http.delete<void>(
      `${environment.API_URL}/files/deleteSomeFiles`,
      {
        headers: this.httpHeaders,
        body: { ids },
      },
    );
  }
}
