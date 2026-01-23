import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { EmailAudience } from './types/EmailAudience.type';
import { IEmailDetailsToDB } from './types/IEmailDetailsToDB';
import { ISendedEmailsFromDB } from './types/ISendedEmailsFromDB';

@Injectable({
  providedIn: 'root',
})
export class EmailsService {
  userId = () => this.authService.getUserId();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  getEmails(): Observable<ISendedEmailsFromDB[]> {
    return this.http.get<ISendedEmailsFromDB[]>(
      `${environment.API_URL}/email/getEmails`,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  getEmailBySetId(setId: number): Observable<ISendedEmailsFromDB[]> {
    return this.http.get<ISendedEmailsFromDB[]>(
      `${environment.API_URL}/email/${setId}/getEmailListForSet`,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  sendEmail(emailDetails: IEmailDetailsToDB): Observable<any> {
    const newEmail: IEmailDetailsToDB = {
      ...emailDetails,
      userId: this.userId(),
    };

    return this.http.post(`${environment.API_URL}/email/send`, newEmail, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  createExternalLink(
    type: EmailAudience,
    setHash: string,
    hash: string,
  ): string {
    return `${environment.FRONT_URL}/open-for-${type}/${setHash}/${hash}`;
  }
}
