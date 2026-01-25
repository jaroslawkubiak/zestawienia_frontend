import { IPosition } from "./IPosition";

export interface IValidSetForSupplier {
  valid: boolean;
  setId: number;
  supplier: {
    id: number;
    company: string;
  };
  client: {
    id: number;
    company?: string;
    firstName: string;
    lastName: string;
  };
  positions: IPosition[];
}
