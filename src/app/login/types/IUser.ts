import { Role } from './role';

export interface IUser {
  id: number;
  username: string;
  name: string;
  role: Role;
}
