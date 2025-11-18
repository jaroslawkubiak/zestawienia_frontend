import { Role } from "./role";

export interface ILoggedUser {
  accessToken: string;
  name: string;
  id: number;
  role: Role
}
