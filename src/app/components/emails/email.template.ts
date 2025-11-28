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
                    <td style="padding-left:10px;">
                      <a href="https://www.instagram.com/zurawicki.design/" target="_blank">
                        <img alt="Instagram" fetchpriority="high" src="https://static.wixstatic.com/media/01c3aff52f2a4dffa526d7a9843d46ea.png/v1/fill/w_36,h_36,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/01c3aff52f2a4dffa526d7a9843d46ea.png">
                      </a>
                    </td>

                    <!-- FB -->
                    <td style="padding-left:10px;">
                      <a href="https://www.facebook.com/zurawicki.design/?locale=pl_PL" target="_blank">
                        <img alt="Facebook" fetchpriority="high" src="https://static.wixstatic.com/media/0fdef751204647a3bbd7eaa2827ed4f9.png/v1/fill/w_36,h_36,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/0fdef751204647a3bbd7eaa2827ed4f9.png">
                      </a>
                    </td>

                    <!-- WWW -->
                    <td style="padding-left:10px;">
                      <a href="https://zurawickidesign.pl/" target="_blank">
                      <img
                        alt="Website"
                        src="https://img.icons8.com/?size=100&id=3685&format=png&color=000000"
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
