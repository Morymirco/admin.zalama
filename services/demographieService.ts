import { Utilisateur } from '@/types/utilisateur';
import { createFirebaseService } from './firebaseService';
import { where, orderBy, limit, Timestamp } from 'firebase/firestore';
import userService from './userService';

const demographieService = createFirebaseService<Utilisateur>('users');

// Fonction pour obtenir la répartition des utilisateurs par tranche d'âge
export const getUtilisateursParAge = async () => {
  const utilisateurs = await userService.getAll();
  
  // Initialiser les compteurs pour chaque tranche d'âge
  const tranches = {
    '18-25': 0,
    '26-40': 0,
    '41-60': 0,
    '60+': 0
  };
  
  // Compter les utilisateurs par tranche d'âge
  utilisateurs.forEach(utilisateur => {
    if (!utilisateur.dateNaissance) return;
    
    const dateNaissance = utilisateur.dateNaissance instanceof Timestamp 
      ? utilisateur.dateNaissance.toDate() 
      : new Date(utilisateur.dateNaissance);
    
    const age = new Date().getFullYear() - dateNaissance.getFullYear();
    
    if (age >= 18 && age <= 25) {
      tranches['18-25']++;
    } else if (age > 25 && age <= 40) {
      tranches['26-40']++;
    } else if (age > 40 && age <= 60) {
      tranches['41-60']++;
    } else if (age > 60) {
      tranches['60+']++;
    }
  });
  
  // Calculer les pourcentages
  const total = Object.values(tranches).reduce((sum, count) => sum + count, 0);
  
  return {
    tranches,
    pourcentages: {
      '18-25': total > 0 ? (tranches['18-25'] / total) * 100 : 0,
      '26-40': total > 0 ? (tranches['26-40'] / total) * 100 : 0,
      '41-60': total > 0 ? (tranches['41-60'] / total) * 100 : 0,
      '60+': total > 0 ? (tranches['60+'] / total) * 100 : 0
    }
  };
};

// Fonction pour obtenir la répartition des utilisateurs par sexe
export const getUtilisateursParSexe = async () => {
  const utilisateurs = await userService.getAll();
  
  const sexes = {
    homme: 0,
    femme: 0,
    autre: 0
  };
  
  utilisateurs.forEach(utilisateur => {
    if (utilisateur.sexe === 'homme') {
      sexes.homme++;
    } else if (utilisateur.sexe === 'femme') {
      sexes.femme++;
    } else {
      sexes.autre++;
    }
  });
  
  const total = Object.values(sexes).reduce((sum, count) => sum + count, 0);
  
  return {
    sexes,
    pourcentages: {
      homme: total > 0 ? (sexes.homme / total) * 100 : 0,
      femme: total > 0 ? (sexes.femme / total) * 100 : 0,
      autre: total > 0 ? (sexes.autre / total) * 100 : 0
    }
  };
};

// Fonction pour obtenir la répartition des utilisateurs par région
export const getUtilisateursParRegion = async () => {
  const utilisateurs = await userService.getAll();
  
  const regions: Record<string, number> = {};
  
  utilisateurs.forEach(utilisateur => {
    if (utilisateur.region) {
      regions[utilisateur.region] = (regions[utilisateur.region] || 0) + 1;
    }
  });
  
  const total = Object.values(regions).reduce((sum, count) => sum + count, 0);
  
  // Calculer les pourcentages pour chaque région
  const pourcentages: Record<string, number> = {};
  
  Object.keys(regions).forEach(region => {
    pourcentages[region] = total > 0 ? (regions[region] / total) * 100 : 0;
  });
  
  return {
    regions,
    pourcentages
  };
};

// Fonction pour obtenir la répartition des utilisateurs par type
export const getUtilisateursParType = async () => {
  const utilisateurs = await userService.getAll();
  
  const types: Record<string, number> = {};
  
  utilisateurs.forEach(utilisateur => {
    if (utilisateur.type) {
      types[utilisateur.type] = (types[utilisateur.type] || 0) + 1;
    }
  });
  
  const total = Object.values(types).reduce((sum, count) => sum + count, 0);
  
  // Calculer les pourcentages pour chaque type
  const pourcentages: Record<string, number> = {};
  
  Object.keys(types).forEach(type => {
    pourcentages[type] = total > 0 ? (types[type] / total) * 100 : 0;
  });
  
  return {
    types,
    pourcentages
  };
};

// Fonction pour obtenir la note moyenne des utilisateurs
export const getNoteMoyenne = async () => {
  const utilisateurs = await userService.getAll();
  
  let sommeNotes = 0;
  let nombreNotesValides = 0;
  
  utilisateurs.forEach(utilisateur => {
    if (utilisateur.note && utilisateur.note > 0) {
      sommeNotes += utilisateur.note;
      nombreNotesValides++;
    }
  });
  
  return nombreNotesValides > 0 ? sommeNotes / nombreNotesValides : 0;
};

export default demographieService;
