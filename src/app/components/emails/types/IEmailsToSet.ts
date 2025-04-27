export interface IEmailsToSet {
  id: number;
  link: string;
  sendAt: string;
  sendAtTimestamp: number;
  clientId?: {
    id: number;
    company: string;
    email: string;
  };
  supplierId?: {
    id: number;
    company: string;
    email: string;
  };
  sendBy: {
    id: number;
    name: string;
  };
}
