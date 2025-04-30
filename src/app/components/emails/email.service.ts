import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { IEmailDetails } from './types/IEmailDetails';
import { IEmailsList } from './types/IEmailsList';
import { IEmailsToSet } from './types/IEmailsToSet';

@Injectable({
  providedIn: 'root',
})
export class EmailsService {
  userId = () => this.authService.getUserId();

  constructor(private http: HttpClient, private authService: AuthService) {}

  getEmails(): Observable<IEmailsList[]> {
    return this.http.get<IEmailsList[]>(`${environment.API_URL}/email`, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  getEmailBySetId(setId: number): Observable<IEmailsToSet[]> {
    return this.http.get<IEmailsToSet[]>(
      `${environment.API_URL}/email/${setId}`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  sendEmail(emailDetails: IEmailDetails): Observable<any> {
    const newEmail: IEmailDetails = {
      ...emailDetails,
      userId: this.userId(),
    };

    return this.http.post(`${environment.API_URL}/email/send`, newEmail, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  createLinkForClient(setId: number, setHash: string): string {
    return `${environment.FRONT_URL}/${setId}/${setHash}`;
  }

  createLinkForSupplier(
    setId: number,
    setHash: string,
    supplierHash: string
  ): string {
    return `${environment.FRONT_URL}/${setId}/${setHash}/${supplierHash}`;
  }
}
