import { IPosition } from "../positions-table/types/IPosition";

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
  positions: IPosition[];
}
