export interface IEmailsList {
  id: number;
  link: string;
  sendAt: string;
  sendAtTimestamp: number;
  clientId?: {
    id: number;
    firma: string;
    email: string;
  };
  supplierId?: {
    id: number;
    firma: string;
    email: string;
  };
  sendBy: {
    id: number;
    name: string;
  };
}
