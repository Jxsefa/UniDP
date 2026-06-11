import {
  Home, Calendar, GraduationCap, Users, Users2, Trophy,
} from 'lucide-react';

// Items shown in the desktop sidebar of Dashboard/Calendar/Profile.
export const SIDEBAR_NAV_ITEMS = [
  { path: '/dashboard',  categoria: null, label: 'Home',       Icon: Home },
  { path: '/calendario', categoria: null, label: 'Calendario', Icon: Calendar },
];

// Items shown in the mobile bottom navigation bar across all main pages.
export const BOTTOM_NAV_ITEMS = [
  { path: '/dashboard',  categoria: null,       label: 'Home',      Icon: Home },
  { path: '/calendario', categoria: null,       label: 'Eventos',   Icon: Calendar },
  { path: '/dashboard',  categoria: 'Academia', label: 'Académico', Icon: GraduationCap },
  { path: '/dashboard',  categoria: 'Social',   label: 'Social',    Icon: Users },
  { path: '/dashboard',  categoria: 'Deporte',  label: 'Deportes',  Icon: Trophy },
  { path: '/dashboard',  categoria: 'Clubes',   label: 'Clubes',    Icon: Users2 },
];
