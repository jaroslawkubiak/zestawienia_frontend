import { IHTMLTemplateOptions } from './types/IHTMLTemplateOptions';

export const HTMLClient = {
  title: 'Inwestycja',
  message: 'Przesyłamy link do inwestycji',
};

export const HTMLSupplier = {
  title: 'Zamówienie',
  message: 'Zamawiamy to co tam w tym linku',
};

export function createHTMLHeader(options: IHTMLTemplateOptions): string {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
  </head>

  <body style="margin:0; padding:20px; background:#fafafa; font-family:Arial, sans-serif; font-size:16px; color:#0a0a0a;">

    <table align="center" width="700" cellspacing="0" cellpadding="0" border="0" style="margin:20px auto; max-width:700px;">

      <!-- LOGO -->
      <tr style="margin: 30px 0; width: 700px; text-align: right">
        <td style="width: 300px">
          <img
            src="https://zestawienia.zurawickidesign.pl/assets/images/logo-black.png"
            alt="logo"
            style="width: 300px"
          />
        </td>
      </tr>

      <!-- TITLE -->
      <tr>
        <td style="padding:10px 0; text-align:center;">
          <h2 style="margin:0; font-size:24px; font-weight:bold;">${options.title}</h2>
        </td>
      </tr>

      <!-- MESSAGE -->
      <tr>
        <td style="padding:20px; line-height:1.6;">
          <p>Dzień dobry.</p>
          <p>${options.message}</p>
          <p style="margin-top:20px;">
            <a href="${options.link}" target="_blank" style="color:#3bbfa1; text-decoration:none; font-weight:bold;">
              ${options.title}
            </a>
          </p>
        </td>
      </tr>
      <!-- FOOTER MESSAGE + SOCIALS -->
      <tr>
        <td style="padding:20px;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <!-- LEFT SIDE -->
              <td valign="top" style="width:50%; padding-right:10px;">
                <p style="margin:0 0 8px 0;">Pozdrawiamy,</p>
                <p style="margin:0 0 8px 0;">Zespół Żurawicki Design</p>
                <p style="margin:0 0 8px 0;">Jakub Żurawicki & Joanna Kubiak</p>
              </td>
              <!-- RIGHT SIDE (SOCIAL ICONS) -->
              <td valign="bottom" style="width:50%; text-align:right;">

                <table cellspacing="0" cellpadding="0" border="0" style="display:inline-block;">
                  <tr>

                    <!-- IG -->
                    <td style="padding-left:20px;">
                      <a href="https://www.instagram.com/zurawicki.design/" target="_blank">
                        <img 
                        alt="Instagram" 
                        title="Instagram" 
                        src="https://zestawienia.zurawickidesign.pl/assets/images/social-accent/ig.png"
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
                        src="https://zestawienia.zurawickidesign.pl/assets/images/social-accent/fb.png"
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
                        src="https://zestawienia.zurawickidesign.pl/assets/images/social-accent/www.png"
                        width="32"
                        height="32"
                      />
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- COPYRIGHT -->
      <tr>
        <td style="padding:30px 0; text-align:center;">
          <p style="margin:0; font-size:14px;">&copy; 2025 Żurawicki Design</p>
        </td>
      </tr>

    </table>

  </body>
</html>
  `;
}
