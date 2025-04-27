export interface ISupplier {
  id: number;
  company: string;
  address?: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone?: string;
  hash?: string;
  positionCount: number;
}
