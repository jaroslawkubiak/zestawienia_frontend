export interface IClient {
  id: number;
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  hash?: string;
  telephone?: string;
  setCount: number;
}
