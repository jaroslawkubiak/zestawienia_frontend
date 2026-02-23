import { TEmailAudience } from '../../sended-emails/types/EmailAudience.type';

export interface IEmailTemplateList {
  templateName: string;
  audience: TEmailAudience;
  HTMLHeader: string;
}
