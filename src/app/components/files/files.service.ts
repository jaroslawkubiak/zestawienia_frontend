import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { NotificationService } from '../../services/notification.service';
import { FileDirectoryList } from './FileDirectoryList';
import { IDeletedFileResponse } from './types/IDeletedFileResponse';
import { IDirectories } from './types/IDirectories';
import { IDownloadZip } from './types/IDownloadZip';
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
      'x-user-id': this.userId(),
    });
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  // when client see new files - mark them as seenAt
  markFileAsSeen(ids: number[]): Observable<void> {
    return this.http.post<void>(
      `${environment.API_URL}/files/markFilesAsSeen`,
      ids,
      {
        headers: this.httpHeaders,
      },
    );
  }

  // save created zip from set files
  downloadFiles(ids: number[]): Observable<Blob> {
    const directories: IDirectories[] = FileDirectoryList.map((dir) => {
      return {
        dir: dir.type,
        dirLabel: dir.safeDirName,
      };
    });

    const body: IDownloadZip = { ids, directories };

    return this.http.post(`${environment.API_URL}/files/download-zip`, body, {
      headers: this.httpHeaders,
      responseType: 'blob',
    });
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
  
  // save avatar file
  saveAvatarFile(
    formData: FormData,
  ): Observable<HttpEvent<IUploadFileResponse>> {
    return this.http.post<IUploadFileResponse>(
      `${environment.API_URL}/avatar/upload`,
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
