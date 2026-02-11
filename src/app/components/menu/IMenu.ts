import { Role } from '../../login/types/role.type';

export interface IMenu {
  label: string;
  routerLink: string;
  icon: string;
  requiredRole?: Role;
}
