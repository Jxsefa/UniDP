/**
 * @file useAuth.js
 * @description Hook para consumir el AuthContext.
 * Lanza un error si se usa fuera de AuthProvider.
 *
 * @usage
 * const { user, loading, login, register, logout } = useAuth();
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}