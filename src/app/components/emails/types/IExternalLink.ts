import { EmailAudience } from './EmailAudience.type';

export interface IExternalLink {
  type: EmailAudience;
  hash: string;
}
