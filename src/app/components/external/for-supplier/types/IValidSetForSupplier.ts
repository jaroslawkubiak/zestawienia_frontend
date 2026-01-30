import { IPositionForSupplier } from './IPositionForSupplier';

export interface IValidSetForSupplier {
  valid: boolean;
  setId: number;
  setName: string;
  supplier: {
    id: number;
    company: string;
    firstName: string;
    lastName: string;
  };
  client: {
    id: number;
    company?: string;
    firstName: string;
    lastName: string;
  };
  positions: IPositionForSupplier[];
}
