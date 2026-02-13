import { TEmailAudience } from './EmailAudience.type';

export interface IExternalLink {
  type: TEmailAudience;
  hash: string;
}
