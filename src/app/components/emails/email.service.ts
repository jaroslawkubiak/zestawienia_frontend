import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { IEmailDetailsToDB } from './types/IEmailDetailsToDB';
import { ISendedEmailList } from './types/ISendedEmailList';
import { IEmailsToSet } from './types/IEmailsToSet';

@Injectable({
  providedIn: 'root',
})
export class EmailsService {
  userId = () => this.authService.getUserId();

  constructor(private http: HttpClient, private authService: AuthService) {}

  getEmails(): Observable<ISendedEmailList[]> {
    return this.http.get<ISendedEmailList[]>(`${environment.API_URL}/email`, {
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
    type: 'client' | 'supplier',
    setHash: string,
    hash: string
  ): string {
    return `${environment.FRONT_URL}/open-${type}/${setHash}/${hash}`;
  }
}
