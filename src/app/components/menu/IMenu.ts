import { Role } from '../../login/types/role';

export interface IMenu {
  label: string;
  routerLink: string;
  icon: string;
  requiredRole?: Role;
}
