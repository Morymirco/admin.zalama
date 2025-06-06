import { Service } from '@/types/service';
import { createFirebaseService } from './firebaseService';
import { where, orderBy, limit, Timestamp } from 'firebase/firestore';

const serviceService = createFirebaseService<Service>('services');

// Fonctions spécifiques pour les services
export const getServicesByCategory = async (category: string) => {
  return serviceService.query([where('categorie', '==', category)]);
};

export const getAvailableServices = async () => {
  return serviceService.query([where('disponible', '==', true)]);
};

export const getRecentServices = async (count: number = 5) => {
  return serviceService.query([
    orderBy('dateCreation', 'desc'),
    limit(count)
  ]);
};

export const getServiceCount = async () => {
  return serviceService.count();
};

export const getAvailableServiceCount = async () => {
  return serviceService.count([where('disponible', '==', true)]);
};

export const getCategoriesWithCount = async () => {
  const services = await serviceService.getAll();
  const categoriesMap: Record<string, number> = {};
  
  services.forEach(service => {
    if (service.categorie) {
      categoriesMap[service.categorie] = (categoriesMap[service.categorie] || 0) + 1;
    }
  });
  
  return Object.entries(categoriesMap).map(([categorie, count]) => ({
    categorie,
    count
  }));
};

export default serviceService;
