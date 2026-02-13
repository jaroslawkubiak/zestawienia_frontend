import { EmailDetailsList } from '../EmailDetailsList';

export type ClientEmailTemplateName = 'clientWelcome' | 'clientInfo';

export type SupplierEmailTemplateName = 'supplierOffer' | 'supplierOrder';

export type ClientTemplate =
  (typeof EmailDetailsList.client)[keyof typeof EmailDetailsList.client];

export type SupplierTemplate =
  (typeof EmailDetailsList.supplier)[keyof typeof EmailDetailsList.supplier];
