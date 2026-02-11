import { Role } from './role.type';

export interface ILoggedUser {
  accessToken: string;
  name: string;
  id: number;
  role: Role;
}
