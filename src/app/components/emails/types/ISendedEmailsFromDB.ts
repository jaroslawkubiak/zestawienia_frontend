export interface ISendedEmailsFromDB {
  id: number;
  link: string;
  sendAt: string;
  sendAtTimestamp: number;
  content: string;
  client?: {
    id: number;
    company: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  supplier?: {
    id: number;
    company: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  set: {
    id: number;
    name: string;
  };
  sendBy: {
    id: number;
    name: string;
  };
}
