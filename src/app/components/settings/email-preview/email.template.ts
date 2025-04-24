import { IHTMLTemplateOptions } from './types/IHTMLTemplateOptions';

export const HTMLClient = {
  title: 'Zestawienie',
  message: 'Przesyłamy link do zestawienia',
};

export const HTMLSupplier = {
  title: 'Zamówienie',
  message: 'Zamawiamy to co tam w tym linku',
};

export function createHTML(options: IHTMLTemplateOptions): string {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zestawienie</title>
  </head>
  <body
    style="
      background-color: rgb(240, 240, 240);
      color: rgb(10, 10, 10);;
      font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS',
        sans-serif;
      font-size: 30px;
      padding: 40px;
    "
  >
    <table align="center" style="width: 800px; margin: 0 auto">
      <tr style="margin: 30px 0; width: 800px">
        <td style="width: 300px">
          <img
            src="https://zestawienia.zurawickidesign.pl/assets/images/logo.png"
            alt="logo"
          />
        </td>
        <td style="width: 400px; text-align: right">
          <h3>Żurawicki Design</h3>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px 0; text-align: center" colspan="2">
          <h2 style="margin: 0">${options.title}</h2>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px" colspan="2">
          <p>Dzień dobry.</p>
          <p>${options.message}</p>
          <p>
            <a
              href="${options.link}"
              style="color: rgb(59, 191, 161); text-decoration: none"
              >${options.title}</a
            >
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 0px 20px" colspan="2">
          <p>
            Pozdrawiamy. <br />
            Zespół Żurawicki Design<br />
            Jakub Żurawicki, Joanna Kubiak
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 40px 0; text-align: center" colspan="2">
          <p style="margin: 0; font-size: 18px">&copy; 2025 Żurawicki Design</p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
