export interface IEmailsList {
  id: number;
  to: string;
  link: string;
  sendAt: string;
  sendAtTimestamp: string;
  clientId?: {
    company: string;
    firstName: string;
    lastName: string;
  };
  supplierId?: {
    company: string;
  };
  sendBy: {
    name: string;
  };
  setId: {
    name: string;
  };
}
