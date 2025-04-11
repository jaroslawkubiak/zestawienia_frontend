import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ISet } from '../components/sets/types/ISet';
import { ISupplier } from '../components/suppliers/types/ISupplier';
import { AuthService } from '../login/auth.service';
import { IEmailDetails } from './types/IEmailDetails';
import { IEmailsList } from './types/IEmailsList';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  userId = () => this.authService.getUserId();

  constructor(private http: HttpClient, private authService: AuthService) {}

  getEmailBySetId(setId: number): Observable<IEmailsList[]> {
    return this.http.get<IEmailsList[]>(
      `${environment.API_URL}/email/${setId}`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  sendEmail(set: ISet): Observable<any> {
    const linkToSet = `${environment.API_URL}/${set.id}/${set.hash}`;
    const content = contentBodyClient1 + linkToSet + contentBodyClient2;

    const newEmail: IEmailDetails = {
      to: set.clientId.email,
      subject: `Zestawienie ${set.name} utworzone w dniu ${set.createdAt}`,
      content,
      setId: set.id,
      userId: this.userId(),
      clientId: set.clientId.id,
      link: linkToSet,
    };

    return this.http.post(`${environment.API_URL}/email/send`, newEmail, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  sendEmailToSupplier(set: ISet, supplierId: ISupplier): Observable<any> {
    const linkToSet = `${environment.API_URL}/${set.id}/${set.hash}/${supplierId.hash}`;
    const content = contentBodySupplier1 + linkToSet + contentBodySupplier2;

    const newEmail: IEmailDetails = {
      to: supplierId.email,
      subject: `Zamówienie do zestawienia ${set.name}`,
      content,
      setId: set.id,
      userId: this.userId(),
      supplierId: supplierId.id,
      link: linkToSet,
    };

    return this.http.post(`${environment.API_URL}/email/send`, newEmail, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

const contentBodyClient1 = `
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

const contentBodyClient2 = `
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

const contentBodySupplier1 = `
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
          <h1 style="margin: 0">Zamówienie</h1>
        </td>
      </tr>

      <tr>
        <td style="padding: 20px" colspan="2">
          <p>Dzień dobry.</p>

          <p>Zamawiamy to co tam na liście :)</p>
          <p>
            <a
              href="
`;

const contentBodySupplier2 = `
"
              style="color: rgb(59, 191, 161); text-decoration: none"
            >
              
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
