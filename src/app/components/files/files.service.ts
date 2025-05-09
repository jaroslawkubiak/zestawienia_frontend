import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { IFileFullDetails } from './types/IFileFullDetails';

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
  saveFile(
    setId: number,
    formData: FormData,
    uploadFolder: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authorizationToken()}`,
    });

    return this.http.post<any>(
      `${environment.API_URL}/files/upload/${setId}/${uploadFolder}`,
      formData,
      {
        reportProgress: true,
        observe: 'events',
        headers,
      }
    );
  }

  // download file as blob
  downloadFile(url: string): Observable<Blob> {
    return this.http.get(url, {
      headers: new HttpHeaders(),
      responseType: 'blob',
    });
  }

  // download file and save on client
  downloadAndSaveFile(file: IFileFullDetails): void {
    const url = `${environment.FILES_URL}${file.path}/${file.fileName}`;

    this.downloadFile(url).subscribe((fileBlob: Blob) => {
      saveAs(fileBlob, file.fileName);
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
