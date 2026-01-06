import { IEmailClientDetails } from './IEmailClientDetails';

export interface EmailContextMap {
  client: {};
  supplierOffer: {};
  supplierOrder: {
    client: IEmailClientDetails;
  };
}
