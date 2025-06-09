import { Utilisateur } from '@/types/utilisateur';
import { createFirebaseService } from './firebaseService';
import { where, orderBy, limit, Timestamp } from 'firebase/firestore';

const userService = createFirebaseService<Utilisateur>('users');

// Fonctions spécifiques pour les utilisateurs
export const getUsersByType = async (type: string) => {
  return userService.query([where('type', '==', type)]);
};

export const getActiveUsers = async () => {
  return userService.query([where('active', '==', true)]);
};

export const getNewUsers = async (days: number = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return userService.query([
    where('createdAt', '>=', Timestamp.fromDate(date)),
    orderBy('createdAt', 'desc')
  ]);
};

export const getUsersCount = async () => {
  return userService.count();
};

export const getActiveUsersCount = async () => {
  return userService.count([where('active', '==', true)]);
};

export const getNewUsersThisMonthCount = async () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return userService.count([
    where('createdAt', '>=', Timestamp.fromDate(firstDayOfMonth))
  ]);
};

export default userService;
