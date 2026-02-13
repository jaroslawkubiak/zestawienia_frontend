import { EmailContextMap } from './IEmailContextMap';
import { TEmailAudience } from './EmailAudience.type';

export interface EmailDetails<TAudience extends TEmailAudience> {
  audience: TAudience;
  name: string;
  subject: string;
  message: (context: EmailContextMap[TAudience]) => string;
}
