export interface IEmailsList {
  id: number;
  to: string;
  link: string;
  sendAt: string;
  sendAtTimestamp: string;
  clientId?: {
    firma: string;
  };
  supplierId?: {
    firma: string;
  };
  sendBy: {
    name: string;
  };
  setId: {
    name: string;
  };
}
