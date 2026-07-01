import {
  Home, Calendar, CalendarCheck, Bell,
} from 'lucide-react';

// Items shown in the desktop sidebar of Dashboard/Calendar/Profile.
export const SIDEBAR_NAV_ITEMS = [
  { path: '/dashboard',  categoria: null, label: 'Home',       Icon: Home },
  { path: '/calendario', categoria: null, label: 'Calendario', Icon: Calendar },
];

// Items shown in the mobile bottom navigation bar across all main pages.
// `showUnreadBadge` marks the item whose icon should display the unread
// notifications count.
export const BOTTOM_NAV_ITEMS = [
  { path: '/calendario', categoria: null, label: 'Mis Eventos',   Icon: CalendarCheck },
  { path: '/dashboard', categoria: null, label: 'Home',          Icon: Home },
  { path: '/notificaciones', categoria: null, label: 'Notificaciones', Icon: Bell, showUnreadBadge: true },
];
