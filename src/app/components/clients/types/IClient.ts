export interface IClient {
  id: number;
  company: string;
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  secondEmail?: string;
  hash?: string;
  telephone?: string;
  setCount?: number;
}
