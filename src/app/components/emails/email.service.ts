import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../login/auth.service';
import { ISet } from '../sets/types/ISet';
import {
  createHTML,
  HTMLClient,
  HTMLSupplier,
} from '../settings/email-preview/email.template';
import { ISupplier } from '../suppliers/types/ISupplier';
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

  sendEmail(set: ISet): Observable<any> {
    const link = `${environment.API_URL}/${set.id}/${set.hash}`;
    const content = createHTML({
      title: HTMLClient.title,
      message: HTMLClient.message,
      link,
    });

    const newEmail: IEmailDetails = {
      to: set.clientId.email,
      subject: `Zestawienie ${set.name} utworzone w dniu ${set.createdAt}`,
      content,
      setId: set.id,
      userId: this.userId(),
      clientId: set.clientId.id,
      link,
    };

    return this.http.post(`${environment.API_URL}/email/send`, newEmail, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  sendEmailToSupplier(set: ISet, supplierId: ISupplier): Observable<any> {
    const link = `${environment.API_URL}/${set.id}/${set.hash}/${supplierId.hash}`;
    const content = createHTML({
      title: HTMLSupplier.title,
      message: HTMLSupplier.message,
      link,
    });

    const newEmail: IEmailDetails = {
      to: supplierId.email,
      subject: `Zamówienie do zestawienia ${set.name}`,
      content,
      setId: set.id,
      userId: this.userId(),
      supplierId: supplierId.id,
      link,
    };

    return this.http.post(`${environment.API_URL}/email/send`, newEmail, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
