import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  Edit, 
  Trash2, 
  Plus, 
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { Employe } from '@/types/partenaire';
import ModaleAjoutEmploye from './ModaleAjoutEmploye';

interface ListeEmployesProps {
  employes: Employe[];
  partnerId: string;
  partnerName: string;
  loading: boolean;
  onAddEmploye: (employe: Omit<Employe, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateEmploye: (id: string, employe: Partial<Omit<Employe, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  onDeleteEmploye: (id: string) => Promise<void>;
}

const ListeEmployes: React.FC<ListeEmployesProps> = ({
  employes,
  partnerId,
  partnerName,
  loading,
  onAddEmploye,
  onUpdateEmploye,
  onDeleteEmploye
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('nom');

  // Filtrer et trier les employés
  const filteredEmployes = employes
    .filter(employe => {
      const matchesSearch = 
        employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employe.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employe.email && employe.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterType === 'all' || employe.type_contrat === filterType;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'nom':
          return `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`);
        case 'poste':
          return a.poste.localeCompare(b.poste);
        case 'date_embauche':
          return new Date(a.date_embauche || '').getTime() - new Date(b.date_embauche || '').getTime();
        case 'salaire_net':
          return (a.salaire_net || 0) - (b.salaire_net || 0);
        default:
          return 0;
      }
    });

  // Calculer les statistiques
  const stats = {
    total: employes.length,
    actifs: employes.filter(e => e.actif).length,
    inactifs: employes.filter(e => !e.actif).length,
    salaireTotal: employes.reduce((sum, e) => sum + (e.salaire_net || 0), 0),
    salaireMoyen: employes.length > 0 ? employes.reduce((sum, e) => sum + (e.salaire_net || 0), 0) / employes.length : 0
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifiée';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatSalaire = (salaire?: number) => {
    if (!salaire) return 'Non spécifié';
    return new Intl.NumberFormat('fr-FR').format(salaire) + ' GNF';
  };

  const getContratColor = (type: string) => {
    switch (type) {
      case 'CDI': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'CDD': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Stage': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Consultant': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--zalama-text)]">Employés de {partnerName}</h2>
            <p className="text-[var(--zalama-text-secondary)]">Gestion des employés du partenaire</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ajouter un employé
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--zalama-text)]">{stats.total}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--zalama-success)]">{stats.actifs}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Actifs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--zalama-warning)]">{stats.inactifs}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Inactifs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--zalama-blue)]">
              {new Intl.NumberFormat('fr-FR').format(stats.salaireTotal)} GNF
            </div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Salaire total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--zalama-green)]">
              {new Intl.NumberFormat('fr-FR').format(Math.round(stats.salaireMoyen))} GNF
            </div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Salaire moyen</div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-[var(--zalama-card)] rounded-xl p-4 border border-[var(--zalama-border)]">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--zalama-text-secondary)]" />
              <input
                type="text"
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
              />
            </div>
          </div>

          {/* Filtre par type de contrat */}
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
            >
              <option value="all">Tous les contrats</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Stage">Stage</option>
              <option value="Consultant">Consultant</option>
              <option value="Autre">Autre</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
            >
              <option value="nom">Trier par nom</option>
              <option value="poste">Trier par poste</option>
              <option value="date_embauche">Trier par date d'embauche</option>
              <option value="salaire_net">Trier par salaire</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des employés */}
      {loading ? (
        <div className="bg-[var(--zalama-card)] rounded-xl p-8 border border-[var(--zalama-border)] text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--zalama-blue)] mx-auto mb-4"></div>
          <p className="text-[var(--zalama-text-secondary)]">Chargement des employés...</p>
        </div>
      ) : filteredEmployes.length === 0 ? (
        <div className="bg-[var(--zalama-card)] rounded-xl p-8 border border-[var(--zalama-border)] text-center">
          <User className="h-12 w-12 text-[var(--zalama-text-secondary)] mx-auto mb-4" />
          <p className="text-[var(--zalama-text-secondary)] mb-2">Aucun employé trouvé</p>
          <p className="text-sm text-[var(--zalama-text-secondary)]">
            {searchTerm || filterType !== 'all' 
              ? 'Essayez de modifier vos critères de recherche' 
              : 'Commencez par ajouter un employé'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployes.map((employe) => (
            <div 
              key={employe.id} 
              className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)] hover:shadow-md transition-shadow"
            >
              {/* En-tête de la carte */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--zalama-blue)] to-[var(--zalama-blue-accent)] rounded-full flex items-center justify-center text-white font-semibold">
                    {employe.prenom.charAt(0)}{employe.nom.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--zalama-text)]">
                      {employe.prenom} {employe.nom}
                    </h3>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">{employe.poste}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-1 text-[var(--zalama-blue)] hover:bg-[var(--zalama-blue)]/10 rounded">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onDeleteEmploye(employe.id)}
                    className="p-1 text-[var(--zalama-danger)] hover:bg-[var(--zalama-danger)]/10 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Informations de contact */}
              <div className="space-y-2 mb-4">
                {employe.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <span className="text-[var(--zalama-text)] truncate">{employe.email}</span>
                  </div>
                )}
                {employe.telephone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <span className="text-[var(--zalama-text)]">{employe.telephone}</span>
                  </div>
                )}
                {employe.adresse && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <span className="text-[var(--zalama-text-secondary)] truncate">{employe.adresse}</span>
                  </div>
                )}
              </div>

              {/* Informations professionnelles */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                  <span className="text-[var(--zalama-text)]">{employe.type_contrat}</span>
                </div>
                {employe.date_embauche && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <span className="text-[var(--zalama-text-secondary)]">
                      Embauche: {formatDate(employe.date_embauche)}
                    </span>
                  </div>
                )}
                {employe.salaire_net && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <span className="text-[var(--zalama-text)] font-medium">
                      {formatSalaire(employe.salaire_net)}
                    </span>
                  </div>
                )}
              </div>

              {/* Statut et badges */}
              <div className="flex justify-between items-center pt-3 border-t border-[var(--zalama-border)]">
                <span className={`px-2 py-1 text-xs rounded-full ${getContratColor(employe.type_contrat)}`}>
                  {employe.type_contrat}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  employe.actif 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {employe.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'ajout d'employé */}
      <ModaleAjoutEmploye
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={onAddEmploye}
        partnerId={partnerId}
        partnerName={partnerName}
      />
    </div>
  );
};

export default ListeEmployes; 