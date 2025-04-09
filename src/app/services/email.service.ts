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

  sendEmail(setId: number): Observable<any> {
    return this.editSetService.getSet(setId).pipe(
      switchMap((set) => {
        const linkToSet = `${environment.API_URL}/${set.id}/${set.hash}`;
        const content = contentBody1 + linkToSet + contentBody2;

        const newEmail: IEmailDetails = {
          to: set.clientId.email,
          subject: `Zestawienie ${set.name} utworzone w dniu ${set.createdAt}`,
          content,
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

const contentBody1 = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zestawienie</title>
  </head>
  <body
    style="
      background-color: rgb(0, 0, 0);
      color: white;
      font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS',
        sans-serif;
      font-size: 30px;
      padding: 40px;
    "
  >
    <table align="center" style="width: 800px; margin: 0 auto">
      <tr style="margin: 30px 0; width: 800px">
        <td style="width: 400px">
          <img
            src="https://zestawienia.zurawickidesign.pl/assets/images/logo.png"
            alt="logo"
          />
        </td>
        <td style="width: 400px; text-align: right">
          <h2>Żurawicki Design</h2>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px 0; text-align: center" colspan="2">
          <h1 style="margin: 0">Zestawienie</h1>
        </td>
      </tr>

      <tr>
        <td style="padding: 20px" colspan="2">
          <p>Dzień dobry.</p>

          <p>Przesyłamy link do zestawienia</p>
          <p>
            <a
              href="
`;

const contentBody2 = `
"
              style="color: rgb(59, 191, 161); text-decoration: none"
            >
              zestawienie
            </a>
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding: 0px 20px" colspan="2">
          <p>
            Pozdrawiamy. <br />Zespół Żurawicki Design<br />Jakub Żuwaricki,
            Joanna Kubiak
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 60px 0; text-align: center" colspan="2">
          <p style="margin: 0; font-size: 18px">&copy; 2025 Żurawicki Design</p>
        </td>
      </tr>
    </table>
  </body>
</html>

`;
