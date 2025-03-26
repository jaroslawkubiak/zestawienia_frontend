export interface IEmailDetails {
  to: string;
  subject: string;
  content: string;
  setId?: number;
  clientId?: number;
  userId?: number;
  link: string;
}
