import { Role } from '../../login/types/role';

export interface IMenu {
  name: string;
  route: string;
  icon: string;
  requiredRole?: Role;
}
