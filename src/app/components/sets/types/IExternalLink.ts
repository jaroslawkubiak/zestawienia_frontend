import { EmailAudience } from '../../emails/types/EmailAudience.type';

export interface IExternalLink {
  type: EmailAudience;
  hash: string;
}
