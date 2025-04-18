import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IFileDetails } from '../components/sets/show-files/types/IFileDetails';
import { AuthService } from '../login/auth.service';
import { IFileList } from './types/IFileList';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  authorizationToken = () => this.authService.getAuthorizationToken();
  userId = () => this.authService.getUserId();

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
    const url = `${environment.FILES_URL}${setId}/${innerPath}/${fileName}`;

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

  prepareFilesList(setId: number, filesList: IFileList) {
    return filesList.files.map((file) => {
      const fileParts = file.split('.');
      const extension = fileParts[fileParts.length - 1].toUpperCase() as
        | 'JPEG'
        | 'PNG'
        | 'JPG'
        | 'PDF';
      return {
        id: Math.floor(Math.random() * 9999),
        name: file,
        shortName: fileParts[0],
        extension: extension,
        path: `${environment.FILES_URL}${setId}/files/${file}`,
        dir: 'files',
      } as IFileDetails;
    });
  }

  preparePdfFilesList(setId: number, filesList: IFileList) {
    return filesList.pdf.map((file) => {
      const fileParts = file.split('.');
      const extension = fileParts[fileParts.length - 1].toUpperCase() as 'PDF';
      return {
        id: Math.floor(Math.random() * 9999),
        name: file,
        shortName: fileParts[0],
        extension: extension,
        path: `${environment.FILES_URL}${setId}/pdf/${file}`,
        dir: 'pdf',
      } as IFileDetails;
    });
  }
}
