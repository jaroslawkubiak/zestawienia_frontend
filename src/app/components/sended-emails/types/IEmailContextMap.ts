import { IEmailClientDetails } from './IEmailClientDetails';

export interface EmailContextMap {
  client: {};
  supplier: {
    client?: IEmailClientDetails; 
  };
}
