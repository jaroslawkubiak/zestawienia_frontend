import { IHTMLTemplateOptions } from './types/IHTMLTemplateOptions';

const ASSETS_URL = 'https://zestawienia.zurawickidesign.pl/assets';

export function createHTMLEmail(options: IHTMLTemplateOptions): string {
  const { GDPRClause, message, link, title } = { ...options };

  return `
    ${HTMLheader()}
    <!-- TITLE -->
    <tr>
      <td style="padding:30px 0; text-align:center;">
        <h2 style="margin:0; font-size:24px; font-weight:bold;">${title}</h2>
      </td>
    </tr>

      <!-- MESSAGE -->
      <tr>
        <td style="line-height:1.6;">
          <p>Dzień dobry.</p>
          <p>${message}</p>
          <p style="margin-top:20px;">
            <a href="${link}" target="_blank" style="color:#3bbfa1; text-decoration:none; font-weight:bold;">
              Zestawienie
            </a>
          </p>
        </td>
      </tr>

      <!-- FOOTER MESSAGE + SOCIALS -->
      ${HTMLfooter(GDPRClause)}

      </table>
    </body>
  </html>
  `;
}

function HTMLheader() {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
  </head>

  <body style="margin:0; padding:20px; font-family:Arial, background:#fafafa; sans-serif; font-size:16px; color:#0a0a0a;">

  <table align="center" width="600px" cellspacing="0" cellpadding="0" border="0" style="margin:20px auto; max-width:600px;">

    <!-- LOGO -->
    <tr style="margin: 30px 0; width: 800px; text-align: left">
      <td style="width: 300px">
        <img
          src="${ASSETS_URL}/logo-black.png"
          alt="logo"
          style="width: 300px"
        />
      </td>
    </tr>
  `;
}

function HTMLfooter(GDPRClause: string) {
  const socialColor = 'accent'; // black or accent
  const currentYear = new Date().getFullYear();

  return `
  <!-- FOOTER MESSAGE + SOCIALS -->
  <tr>
    <td>
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:10px 0;">
        <tr>
          <td valign="top">
            <p style="margin:0 0 10px 0;">Pozdrawiamy,</p>
            <p style="margin:0 0 10px 0;">Zespół Żurawicki Design</p>
            <p style="margin:0 0 20px 0;">Jakub Żurawicki, Joanna Kubiak</p>
            <p style="margin:0 0 10px 0;">ul. Czerkaska 10/7, 85-641 Bydgoszcz</p>
            <p style="margin:0 0 20px 0;">E-mail: kontakt@zurawickidesign.pl</p>
          </td>
        </tr>
      </table>
      <table cellspacing="0" cellpadding="0" border="0" style="display:inline-block;">
        <tr>
          <!-- IG -->
          <td>
            <a href="https://www.instagram.com/zurawicki.design/" target="_blank">
              <img 
              alt="Instagram" 
              title="Instagram" 
              src="${ASSETS_URL}/social-${socialColor}/ig.png"
              width="32"
              height="32"
              >
            </a>
          </td>
          <!-- FB -->
          <td style="padding-left:20px;">
            <a href="https://www.facebook.com/zurawicki.design/?locale=pl_PL" target="_blank">
              <img 
              alt="Facebook" 
              title="Facebook" 
              src="${ASSETS_URL}/social-${socialColor}/fb.png"
              width="32"
              height="32">
            </a>
          </td>
          <!-- WWW -->
          <td style="padding-left:20px;">
            <a href="https://zurawickidesign.pl/" target="_blank">
            <img
              alt="Website"
              title="Website"
              src="${ASSETS_URL}/social-${socialColor}/www.png"
              width="32"
              height="32"
            />
            </a>
          </td>
        </tr>
      </table>          
    </td>
  </tr>
  <!-- COPYRIGHT -->
  <tr>
    <td style="padding:15px 0; text-align:center;">
      <p style="font-size:14px;">&copy; ${currentYear} Żurawicki Design</p>
    </td>
  </tr>
  </tr>
  <!-- GDPRClause -->
  <tr>
    <td style="padding:10px 0; text-align:justify;">
      <p style="font-size:10px;">${GDPRClause}</p>
    </td>
  </tr>
`;
}
