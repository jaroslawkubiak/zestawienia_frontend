import { EmailContextMap } from "./IEmailContextMap";
import { EmailAudience } from "./EmailAudience.type";

export interface EmailDetails<TAudience extends EmailAudience> {
  audience: TAudience;
  name: string;
  subject: string;
  message: (context: EmailContextMap[TAudience]) => string;
}
