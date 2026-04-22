import { IClient } from '../../clients/types/IClient';
import { TEmailAudience } from '../../sended-emails/types/EmailAudience.type';
import { ISupplier } from '../../suppliers/types/ISupplier';
import { EmailTemplateName } from './EmailTemplateName.type';

export interface IEmailPreviewDetails {
  type: EmailTemplateName;
  setId: number;
  client: IClient;
  supplier?: ISupplier;
  audienceType: TEmailAudience;
}
