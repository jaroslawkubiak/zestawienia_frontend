import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { IEmailPreview } from '../send-email/types/IEmailPreview';
import { IEmailPreviewDetails } from '../send-email/types/IEmailPreviewDetails';
import { IEmailTemplateList } from '../send-email/types/IEmailTemplateList';
import { TEmailAudience } from './types/EmailAudience.type';
import { IEmailDetailsLog } from './types/IEmailDetailsLog';
import { ISendedEmails } from './types/ISendedEmails';

@Injectable({
  providedIn: 'root',
})
export class EmailsService {
  userId = () => this.authService.getUserId();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  getTemplates(): Observable<IEmailTemplateList[]> {
    return this.http.get<IEmailTemplateList[]>(
      `${environment.API_URL}/email/getEmailTemplatesList`,
    );
  }

  getEmailPreview(body: IEmailPreviewDetails): Observable<IEmailPreview> {
    return this.http.post<IEmailPreview>(
      `${environment.API_URL}/email/getEmailPreview`,
      body,
    );
  }

  getEmails(): Observable<ISendedEmails[]> {
    return this.http.get<ISendedEmails[]>(
      `${environment.API_URL}/email/getEmails`,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  getEmailBySetId(setId: number): Observable<ISendedEmails[]> {
    return this.http.get<ISendedEmails[]>(
      `${environment.API_URL}/email/${setId}/getEmailListForSet`,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  sendEmail(emailDetails: IEmailDetailsLog): Observable<any> {
    const newEmail: IEmailDetailsLog = {
      ...emailDetails,
      userId: this.userId(),
    };

    return this.http.post(`${environment.API_URL}/email/send`, newEmail, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  createExternalLink(
    type: TEmailAudience,
    setHash: string,
    hash: string,
  ): string {
    return `${environment.FRONT_URL}/open-for-${type}/${setHash}/${hash}`;
  }
}
