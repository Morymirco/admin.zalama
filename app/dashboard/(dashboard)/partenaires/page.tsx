"use client";

import React, { useState, useEffect } from 'react';
import { Building, Users, Globe, Search, Plus, Filter } from 'lucide-react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

// Importation des composants
import {
  StatistiquesPartenaires,
  ResumePartenaires,
  ListePartenaires,
  ModaleAjoutPartenaire,
  ModaleEditionPartenaire,
  ModaleSuppressionPartenaire
} from '@/components/dashboard/partenaires';

// Types
interface Partenaire {
  id: string;
  nom: string;
  type: string;
  secteur: string;
  description: string;
  adresse: string;
  email: string;
  telephone: string;
  siteWeb: string;
  logo: string;
  datePartenariat: string;
  actif: boolean;
  dateCreation?: any;
}

interface StatistiquePartenaire {
  type: string;
  nombre: number;
  nouveauxCeMois: number;
  actifs: number;
  inactifs: number;
  tendance: 'hausse' | 'stable' | 'baisse';
  icon: React.ReactNode;
}

export default function PartenairesPage() {
  // États
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [filteredPartenaires, setFilteredPartenaires] = useState<Partenaire[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPartenaire, setCurrentPartenaire] = useState<Partenaire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('tous');
  const [statsLoading, setStatsLoading] = useState(true);
  const [statistiques, setStatistiques] = useState<StatistiquePartenaire[]>([]);

  // Liste des types de partenaires
  const types = ['tous', 'Entreprise', 'Institution financière', 'ONG', 'Gouvernement', 'Université'];

  // Récupération des partenaires depuis Firestore
  useEffect(() => {
    const fetchPartenaires = async () => {
      setIsLoading(true);
      try {
        const partenairesRef = collection(db, 'partenaires');
        const snapshot = await getDocs(partenairesRef);
        
        const partenairesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Partenaire[];
        
        setPartenaires(partenairesList);
        setFilteredPartenaires(partenairesList);
        
        // Calculer les statistiques
        calculateStatistics(partenairesList);
      } catch (error) {
        console.error("Erreur lors de la récupération des partenaires:", error);
        toast.error("Impossible de charger les partenaires");
      } finally {
        setIsLoading(false);
        setStatsLoading(false);
      }
    };
    
    fetchPartenaires();
  }, []);

  // Calcul des statistiques
  const calculateStatistics = (data: Partenaire[]) => {
    // Grouper par type
    const typeGroups: Record<string, Partenaire[]> = {};
    data.forEach(partenaire => {
      if (!typeGroups[partenaire.type]) {
        typeGroups[partenaire.type] = [];
      }
      typeGroups[partenaire.type].push(partenaire);
    });
    
    // Créer les statistiques
    const stats: StatistiquePartenaire[] = [
      {
        type: 'Entreprises',
        nombre: typeGroups['Entreprise']?.length || 0,
        nouveauxCeMois: countNewThisMonth(typeGroups['Entreprise'] || []),
        actifs: countActive(typeGroups['Entreprise'] || []),
        inactifs: (typeGroups['Entreprise']?.length || 0) - countActive(typeGroups['Entreprise'] || []),
        tendance: 'hausse',
        icon: <Building className="h-6 w-6 text-[var(--zalama-blue)]" />
      },
      {
        type: 'Institutions financières',
        nombre: typeGroups['Institution financière']?.length || 0,
        nouveauxCeMois: countNewThisMonth(typeGroups['Institution financière'] || []),
        actifs: countActive(typeGroups['Institution financière'] || []),
        inactifs: (typeGroups['Institution financière']?.length || 0) - countActive(typeGroups['Institution financière'] || []),
        tendance: 'stable',
        icon: <Users className="h-6 w-6 text-[var(--zalama-success)]" />
      },
      {
        type: 'Autres partenaires',
        nombre: data.length - (typeGroups['Entreprise']?.length || 0) - (typeGroups['Institution financière']?.length || 0),
        nouveauxCeMois: countNewThisMonth(data.filter(p => p.type !== 'Entreprise' && p.type !== 'Institution financière')),
        actifs: countActive(data.filter(p => p.type !== 'Entreprise' && p.type !== 'Institution financière')),
        inactifs: data.filter(p => p.type !== 'Entreprise' && p.type !== 'Institution financière').length - countActive(data.filter(p => p.type !== 'Entreprise' && p.type !== 'Institution financière')),
        tendance: 'hausse',
        icon: <Globe className="h-6 w-6 text-[var(--zalama-warning)]" />
      }
    ];
    
    setStatistiques(stats);
  };
  
  // Compter les partenaires créés ce mois-ci
  const countNewThisMonth = (partenaires: Partenaire[]) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return partenaires.filter(p => {
      if (!p.dateCreation) return false;
      const creationDate = p.dateCreation.toDate ? p.dateCreation.toDate() : new Date(p.dateCreation);
      return creationDate >= firstDayOfMonth;
    }).length;
  };
  
  // Compter les partenaires actifs
  const countActive = (partenaires: Partenaire[]) => {
    return partenaires.filter(p => p.actif).length;
  };

  // Filtrage des partenaires
  useEffect(() => {
    let filtered = [...partenaires];
    
    // Filtre par type
    if (typeFilter !== 'tous') {
      filtered = filtered.filter(partenaire => partenaire.type === typeFilter);
    }
    
    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(partenaire => 
        partenaire.nom.toLowerCase().includes(term) ||
        partenaire.secteur.toLowerCase().includes(term) ||
        partenaire.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredPartenaires(filtered);
    setCurrentPage(1); // Réinitialiser la pagination
  }, [searchTerm, typeFilter, partenaires]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPartenaires.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPartenaires.length / itemsPerPage);

  // Handlers pour les filtres
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handlers pour les opérations CRUD
  const handleAddPartenaire = () => {
    setShowAddModal(true);
  };

  const handleEditPartenaire = (partenaire: Partenaire) => {
    setCurrentPartenaire(partenaire);
    setShowEditModal(true);
  };

  const handleDeletePartenaire = (partenaire: Partenaire) => {
    setCurrentPartenaire(partenaire);
    setShowDeleteModal(true);
  };

  const handleSubmitAddPartenaire = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Récupération des données du formulaire depuis window.formData
      const formData = (window as any).formData;
      
      if (!formData) {
        console.error('Aucune donnée de formulaire trouvée');
        toast.error('Une erreur est survenue lors de la soumission du formulaire');
        return;
      }
      
      // Afficher un toast de chargement
      const loadingToast = toast.loading('Ajout du partenaire en cours...');
      
      // Création du nouvel objet partenaire avec les données du formulaire
      const newPartenaireData = {
        nom: formData.nom,
        type: formData.type,
        secteur: formData.domaine,
        description: formData.description,
        adresse: formData.adresse,
        email: formData.email,
        telephone: formData.telephone,
        siteWeb: formData.siteWeb || '',
        logo: formData.logo || '/images/partners/default.png', // Utiliser le logo uploadé
        datePartenariat: formData.dateAdhesion || new Date().toISOString().split('T')[0],
        actif: formData.actif,
        dateCreation: serverTimestamp(),
        // Informations supplémentaires
        representant: {
          nom: formData.nomRepresentant || '',
          email: formData.emailRepresentant || '',
          telephone: formData.telephoneRepresentant || ''
        },
        rh: {
          nom: formData.nomRH || '',
          email: formData.emailRH || '',
          telephone: formData.telephoneRH || ''
        },
        infoLegales: {
          rccm: formData.rccm || '',
          nif: formData.nif || ''
        }
      };
      
      // Ajout du document à Firestore
      const partenairesRef = collection(db, 'partenaires');
      const docRef = await addDoc(partenairesRef, newPartenaireData);
      
      // Ajout du nouveau partenaire à l'état local avec l'ID généré
      const newPartenaire: Partenaire = {
        id: docRef.id,
        ...newPartenaireData
      } as Partenaire;
      
      const updatedPartenaires = [...partenaires, newPartenaire];
      setPartenaires(updatedPartenaires);
      setFilteredPartenaires(updatedPartenaires);
      
      // Recalculer les statistiques
      calculateStatistics(updatedPartenaires);
      
      // Fermer la modale
      setShowAddModal(false);
      
      // Notification de succès
      toast.dismiss(loadingToast);
      toast.success('Partenaire ajouté avec succès!');
      
      // Nettoyage des données temporaires
      delete (window as any).formData;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du partenaire:', error);
      toast.error('Une erreur est survenue lors de l\'ajout du partenaire');
    }
  };

  const handleSubmitEditPartenaire = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentPartenaire) return;
    
    const form = e.currentTarget;
    
    const updatedPartenaire: Partenaire = {
      ...currentPartenaire,
      nom: (form.querySelector('#edit-nom') as HTMLInputElement).value,
      type: (form.querySelector('#edit-type') as HTMLSelectElement).value,
      secteur: (form.querySelector('#edit-secteur') as HTMLInputElement).value,
      description: (form.querySelector('#edit-description') as HTMLTextAreaElement).value,
      adresse: (form.querySelector('#edit-adresse') as HTMLInputElement).value,
      email: (form.querySelector('#edit-email') as HTMLInputElement).value,
      telephone: (form.querySelector('#edit-telephone') as HTMLInputElement).value,
      siteWeb: (form.querySelector('#edit-siteWeb') as HTMLInputElement).value,
      actif: (form.querySelector('#edit-actif') as HTMLInputElement).checked,
    };
    
    const updatedPartenaires = partenaires.map(p => p.id === currentPartenaire.id ? updatedPartenaire : p);
    setPartenaires(updatedPartenaires);
    setFilteredPartenaires(updatedPartenaires);
    setShowEditModal(false);
    setCurrentPartenaire(null);
    
    // Notification de succès (à implémenter)
    console.log('Partenaire mis à jour avec succès:', updatedPartenaire);
  };

  const handleConfirmDelete = () => {
    if (!currentPartenaire) return;
    
    const updatedPartenaires = partenaires.filter(p => p.id !== currentPartenaire.id);
    setPartenaires(updatedPartenaires);
    setFilteredPartenaires(updatedPartenaires);
    setShowDeleteModal(false);
    setCurrentPartenaire(null);
    
    // Notification de succès (à implémenter)
    console.log('Partenaire supprimé avec succès:', currentPartenaire);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-[var(--zalama-text)]">Partenaires</h1>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Barre de recherche */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un partenaire..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
            />
          </div>
          
          {/* Filtre par type */}
          <div className="relative w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type === 'tous' ? 'Tous les types' : type}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
            </div>
          </div>
          
          {/* Bouton d'ajout */}
          <button
            onClick={handleAddPartenaire}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] text-white rounded-lg hover:bg-[var(--zalama-blue-accent)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Section des statistiques */}
      <StatistiquesPartenaires 
        statistiques={statistiques} 
        isLoading={statsLoading} 
      />
      
      {/* Résumé des partenaires */}
      <ResumePartenaires 
        totalPartenaires={filteredPartenaires.length}
        partenairesActifs={filteredPartenaires.filter(p => p.actif).length}
        partenairesInactifs={filteredPartenaires.filter(p => !p.actif).length}
        isLoading={isLoading}
      />
      
      {/* Liste des partenaires */}
      <ListePartenaires 
        partenaires={currentItems}
        onEdit={handleEditPartenaire}
        onDelete={handleDeletePartenaire}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
      
      {/* Modales */}
      <ModaleAjoutPartenaire 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitAddPartenaire}
        types={types.filter(t => t !== 'tous')}
      />
      
      {showEditModal && currentPartenaire && (
        <ModaleEditionPartenaire 
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setCurrentPartenaire(null);
          }}
          onSubmit={handleSubmitEditPartenaire}
          partenaire={currentPartenaire}
          types={types.filter(t => t !== 'tous')}
        />
      )}
      
      {showDeleteModal && currentPartenaire && (
        <ModaleSuppressionPartenaire 
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCurrentPartenaire(null);
          }}
          onConfirm={handleConfirmDelete}
          partenaire={currentPartenaire}
        />
      )}
    </div>
  );
}
