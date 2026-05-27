import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, UserPlus, Users } from 'lucide-react';

export const APP_TITLE = 'Cumpleaños y Aniversarios Emaús Parejas';
export const LOGO_SRC = '/emaus-parejas-logo.png';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export const navigation: NavItem[] = [
  { id: 'join', label: 'Registro', path: '/registro', icon: UserPlus },
];

export const adminNavigation: NavItem[] = [
  { id: 'dashboard', label: 'Tablero', path: '/tablero', icon: LayoutDashboard },
  { id: 'list', label: 'Lista', path: '/lista', icon: Users },
];

export const ADMIN_TOKEN_KEY = 'emaus-admin-token';
export const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
