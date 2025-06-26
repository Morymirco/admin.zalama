"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Building, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  UserPlus,
  Briefcase,
  FileText,
  Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

// Importation des hooks et services
import { useSupabasePartnerDetail, useSupabaseEmployees } from '@/hooks/useSupabasePartners';
import ListeEmployes from '@/components/dashboard/partenaires/ListeEmployes';
import ModaleAjoutEmploye from '@/components/dashboard/partenaires/ModaleAjoutEmploye';
import DemandesAvanceSalaire from '@/components/dashboard/partenaires/DemandesAvanceSalaire';

export default function PartenaireDetailPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.id as string;

  // États locaux
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'demandes'>('overview');
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);

  // Hooks pour récupérer les données
  const { partenaire, loading: partnerLoading, error: partnerError } = useSupabasePartnerDetail(partnerId);
  const { 
    employes, 
    loading: employeesLoading, 
    createEmploye, 
    updateEmploye, 
    deleteEmploye 
  } = useSupabaseEmployees(partnerId);

  // Gestion des erreurs
  if (partnerError) {
    toast.error('Erreur lors du chargement du partenaire');
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatSalaire = (salaire: number) => {
    return new Intl.NumberFormat('fr-FR').format(salaire) + ' GNF';
  };

  const handleAddEmployee = async (employeeData: any) => {
    try {
      await createEmploye(employeeData);
      toast.success('Employé ajouté avec succès');
      setShowAddEmployeeModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'employé:', error);
      toast.error('Erreur lors de l\'ajout de l\'employé');
    }
  };

  const handleUpdateEmployee = async (id: string, employeeData: any) => {
    try {
      await updateEmploye(id, employeeData);
      toast.success('Employé mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'employé:', error);
      toast.error('Erreur lors de la mise à jour de l\'employé');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteEmploye(id);
      toast.success('Employé supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
      toast.error('Erreur lors de la suppression de l\'employé');
    }
  };

  if (partnerLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="animate-pulse">
            <div className="h-6 bg-[var(--zalama-bg-lighter)] rounded w-48 mb-2"></div>
            <div className="h-4 bg-[var(--zalama-bg-lighter)] rounded w-32"></div>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-[var(--zalama-bg-lighter)] rounded-xl"></div>
          <div className="h-32 bg-[var(--zalama-bg-lighter)] rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!partenaire) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-[var(--zalama-text-secondary)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-2">Partenaire non trouvé</h2>
          <p className="text-[var(--zalama-text-secondary)]">Le partenaire que vous recherchez n'existe pas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--zalama-text)]">{partenaire.nom}</h1>
          <p className="text-[var(--zalama-text-secondary)]">Détails du partenaire</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 bg-[var(--zalama-bg-lighter)] rounded-lg p-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'overview'
              ? 'bg-[var(--zalama-card)] text-[var(--zalama-text)] shadow-sm'
              : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
          }`}
        >
          <Building className="h-4 w-4" />
          Aperçu
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'employees'
              ? 'bg-[var(--zalama-card)] text-[var(--zalama-text)] shadow-sm'
              : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
          }`}
        >
          <Users className="h-4 w-4" />
          Employés ({partenaire.employees?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('demandes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'demandes'
              ? 'bg-[var(--zalama-card)] text-[var(--zalama-text)] shadow-sm'
              : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
          }`}
        >
          <FileText className="h-4 w-4" />
          Demandes & Transactions
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Informations principales */}
          <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
            <div className="flex items-start gap-6">
              {/* Logo */}
              <div className="w-24 h-24 bg-[var(--zalama-bg-lighter)] rounded-xl flex items-center justify-center">
                {partenaire.logo_url ? (
                  <Image
                    src={partenaire.logo_url}
                    alt={`Logo ${partenaire.nom}`}
                    width={96}
                    height={96}
                    className="rounded-xl object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/partners/default.svg';
                    }}
                  />
                ) : (
                  <Building className="h-12 w-12 text-[var(--zalama-text-secondary)]" />
                )}
              </div>

              {/* Informations de base */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-[var(--zalama-text)]">{partenaire.nom}</h2>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    partenaire.actif 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {partenaire.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[var(--zalama-text-secondary)]">Type:</span>
                    <span className="ml-2 text-[var(--zalama-text)]">{partenaire.type}</span>
                  </div>
                  <div>
                    <span className="text-[var(--zalama-text-secondary)]">Secteur:</span>
                    <span className="ml-2 text-[var(--zalama-text)]">{partenaire.secteur}</span>
                  </div>
                  <div>
                    <span className="text-[var(--zalama-text-secondary)]">Date d'adhésion:</span>
                    <span className="ml-2 text-[var(--zalama-text)]">{formatDate(partenaire.date_adhesion)}</span>
                  </div>
                  <div>
                    <span className="text-[var(--zalama-text-secondary)]">Employés:</span>
                    <span className="ml-2 text-[var(--zalama-text)]">{partenaire.nombre_employes}</span>
                  </div>
                </div>

                {partenaire.description && (
                  <p className="mt-4 text-[var(--zalama-text-secondary)]">{partenaire.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)] text-center">
              <Users className="h-8 w-8 text-[var(--zalama-blue)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[var(--zalama-text)]">{partenaire.nombre_employes}</div>
              <div className="text-sm text-[var(--zalama-text-secondary)]">Employés</div>
            </div>
            <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)] text-center">
              <DollarSign className="h-8 w-8 text-[var(--zalama-success)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[var(--zalama-text)]">
                {formatSalaire(partenaire.salaire_net_total)}
              </div>
              <div className="text-sm text-[var(--zalama-text-secondary)]">Salaire total</div>
            </div>
            <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)] text-center">
              <Calendar className="h-8 w-8 text-[var(--zalama-warning)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[var(--zalama-text)]">
                {formatDate(partenaire.date_adhesion)}
              </div>
              <div className="text-sm text-[var(--zalama-text-secondary)]">Date d'adhésion</div>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact principal */}
            <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
              <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact principal
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                  <span className="text-[var(--zalama-text)]">{partenaire.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                  <span className="text-[var(--zalama-text)]">{partenaire.telephone}</span>
                </div>
                {partenaire.adresse && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <span className="text-[var(--zalama-text-secondary)]">{partenaire.adresse}</span>
                  </div>
                )}
                {partenaire.site_web && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <a 
                      href={partenaire.site_web} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[var(--zalama-blue)] hover:underline"
                    >
                      {partenaire.site_web}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Représentant et RH */}
            <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
              <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Contacts clés
              </h3>
              <div className="space-y-4">
                {/* Représentant */}
                {partenaire.nom_representant && (
                  <div>
                    <h4 className="font-medium text-[var(--zalama-text)] mb-2">Représentant</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--zalama-text-secondary)]">Nom:</span>
                        <span className="text-[var(--zalama-text)]">{partenaire.nom_representant}</span>
                      </div>
                      {partenaire.email_representant && (
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--zalama-text-secondary)]">Email:</span>
                          <span className="text-[var(--zalama-text)]">{partenaire.email_representant}</span>
                        </div>
                      )}
                      {partenaire.telephone_representant && (
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--zalama-text-secondary)]">Téléphone:</span>
                          <span className="text-[var(--zalama-text)]">{partenaire.telephone_representant}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Responsable RH */}
                {partenaire.nom_rh && (
                  <div>
                    <h4 className="font-medium text-[var(--zalama-text)] mb-2">Responsable RH</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--zalama-text-secondary)]">Nom:</span>
                        <span className="text-[var(--zalama-text)]">{partenaire.nom_rh}</span>
                      </div>
                      {partenaire.email_rh && (
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--zalama-text-secondary)]">Email:</span>
                          <span className="text-[var(--zalama-text)]">{partenaire.email_rh}</span>
                        </div>
                      )}
                      {partenaire.telephone_rh && (
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--zalama-text-secondary)]">Téléphone:</span>
                          <span className="text-[var(--zalama-text)]">{partenaire.telephone_rh}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations légales */}
          {(partenaire.rccm || partenaire.nif) && (
            <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
              <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Informations légales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partenaire.rccm && (
                  <div>
                    <span className="text-[var(--zalama-text-secondary)]">RCCM:</span>
                    <span className="ml-2 text-[var(--zalama-text)]">{partenaire.rccm}</span>
                  </div>
                )}
                {partenaire.nif && (
                  <div>
                    <span className="text-[var(--zalama-text-secondary)]">NIF:</span>
                    <span className="ml-2 text-[var(--zalama-text)]">{partenaire.nif}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'employees' ? (
        <div>
          <ListeEmployes
            employes={partenaire.employees || []}
            partnerId={partnerId}
            partnerName={partenaire.nom}
            loading={employeesLoading}
            onAddEmploye={handleAddEmployee}
            onUpdateEmploye={handleUpdateEmployee}
            onDeleteEmploye={handleDeleteEmployee}
          />
        </div>
      ) : (
        <div>
          {/* Liste des demandes d'avance sur salaire */}
          <DemandesAvanceSalaire partnerId={partnerId} />
        </div>
      )}

      {/* Modal d'ajout d'employé */}
      <ModaleAjoutEmploye
        isOpen={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        onSubmit={handleAddEmployee}
        partnerId={partnerId}
        partnerName={partenaire.nom}
      />
    </div>
  );
}