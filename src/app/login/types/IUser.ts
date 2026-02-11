import { Role } from './role.type';

export interface IUser {
  id: number;
  username: string;
  name: string;
  role: Role;
}
