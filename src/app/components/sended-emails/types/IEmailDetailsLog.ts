export interface IEmailDetailsLog {
  to: string;
  secondEmail?: string;
  subject: string;
  content: string;
  setId?: number;
  userId?: number;
  clientId?: number;
  supplierId?: number;
  link: string;
}
