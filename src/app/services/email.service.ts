import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { EditSetService } from '../components/sets/edit-set/edit-set.service';
import { AuthService } from '../login/auth.service';
import { catchError, Observable, switchMap } from 'rxjs';
import { IEmailDetails } from './types/IEmailDetails';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  userId = () => this.authService.getUserId();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private editSetService: EditSetService
  ) {}

  sendEmail(setId: string): Observable<any> {
    return this.editSetService.getSet(setId).pipe(
      switchMap((set) => {
        const linkToSet = `${environment.API_URL}/${set.id}/${set.hash}`;

        const newEmail: IEmailDetails = {
          to: set.clientId.email,
          subject: `Zestawienie ${set.name} utworzone w dniu ${set.createdAt}`,
          content: `Dzień dobry. <br/><br/> Jakiś kontent plus link : ${linkToSet}`,
          setId: +setId,
          userId: this.userId(),
          clientId: set.clientId.id,
          link: linkToSet,
        };

        return this.http.post(`${environment.API_URL}/email/send`, newEmail, {
          headers: { 'Content-Type': 'application/json' },
        });
      }),
      catchError((error) => {
        console.error('Error while getting set or sending email:', error);
        throw error;
      })
    );
  }
}
