"use client";

import React, { useState, useEffect } from 'react';
import { X, Plus, DollarSign, User, Building } from 'lucide-react';
import { SalaryAdvanceRequestFormData } from '@/types/salaryAdvanceRequest';

interface ModaleAjoutDemandeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  employees: Array<{ 
    id: string; 
    nom: string; 
    prenom: string; 
    email?: string;
    salaire_net?: number;
    partner_id?: string;
  }>;
  partners: Array<{ id: string; nom: string; email?: string }>;
  isLoading: boolean;
}

const ModaleAjoutDemande: React.FC<ModaleAjoutDemandeProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  partners,
  isLoading
}) => {
  // Debug: Afficher les données reçues dans la modale
  console.log('🔍 Debug - ModaleAjoutDemande:');
  console.log('  - employees:', employees?.length || 0, employees);
  console.log('  - partners:', partners?.length || 0, partners);
  console.log('  - isLoading:', isLoading);
  const [formData, setFormData] = useState<SalaryAdvanceRequestFormData>({
    employe_id: '',
    partenaire_id: '',
    montant_demande: 0,
    type_motif: '',
    motif: '',
    frais_service: 0,
    montant_total: 0,
    salaire_disponible: 0,
    avance_disponible: 0,
  });

  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        employe_id: '',
        partenaire_id: '',
        montant_demande: 0,
        type_motif: '',
        motif: '',
        frais_service: 0,
        montant_total: 0,
        salaire_disponible: 0,
        avance_disponible: 0,
      });
      setSelectedEmployee(null);
      setSelectedPartner(null);
    }
  }, [isOpen]);

  const handleEmployeeChange = (employeeId: string) => {
    const employee = (employees || []).find(emp => emp.id === employeeId);
    setSelectedEmployee(employee);
    
    // Debug: Afficher les informations de l'employé sélectionné
    console.log('🔍 Debug - Employé sélectionné:', employee);
    console.log('  - ID:', employee?.id);
    console.log('  - Nom:', employee?.nom);
    console.log('  - Prénom:', employee?.prenom);
    console.log('  - Salaire net:', employee?.salaire_net);
    console.log('  - Partner ID:', employee?.partner_id);
    
    if (employee) {
      // Récupérer automatiquement le partenaire de l'employé
      const partner = (partners || []).find(part => part.id === employee.partner_id);
      setSelectedPartner(partner);
      
      // Debug: Afficher les informations du partenaire
      console.log('🔍 Debug - Partenaire trouvé:', partner);
      
      // Calculer l'avance disponible (par exemple 50% du salaire)
      const salaireNet = employee.salaire_net || 0;
      const avanceDisponible = Math.floor(salaireNet * 0.5);
      
      console.log('🔍 Debug - Calculs:');
      console.log('  - Salaire net:', salaireNet);
      console.log('  - Avance disponible (50%):', avanceDisponible);
      
      setFormData(prev => ({
        ...prev,
        employe_id: employeeId,
        partenaire_id: employee.partner_id || '',
        salaire_disponible: salaireNet,
        avance_disponible: avanceDisponible,
      }));
    } else {
      // Réinitialiser si aucun employé sélectionné
      setSelectedPartner(null);
      setFormData(prev => ({
        ...prev,
        employe_id: '',
        partenaire_id: '',
        salaire_disponible: 0,
        avance_disponible: 0,
      }));
    }
  };

  const calculateTotal = () => {
    const montant = formData.montant_demande || 0;
    const frais = formData.frais_service || 0;
    return montant + frais;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-[var(--zalama-card)] border border-[var(--zalama-border)] rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--zalama-text)] flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nouvelle demande d'avance sur salaire
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Employé et Partenaire */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-employe-id" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Employé *
                </label>
                <select
                  id="add-employe-id"
                  required
                  value={formData.employe_id}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
                  disabled={isLoading}
                >
                  <option value="">
                    {isLoading ? 'Chargement des employés...' : 'Sélectionner un employé'}
                  </option>
                  {(employees || []).map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.prenom} {employee.nom} {employee.email ? `(${employee.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                  <Building className="w-4 h-4 inline mr-2" />
                  Partenaire
                </label>
                <div className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text-secondary)] min-h-[42px] flex items-center">
                  {selectedPartner ? (
                    <span className="text-[var(--zalama-text)]">
                      {selectedPartner.nom} {selectedPartner.email ? `(${selectedPartner.email})` : ''}
                    </span>
                  ) : (
                    <span className="text-[var(--zalama-text-secondary)]">
                      Sélectionnez d'abord un employé
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Montant et type de motif */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-montant" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Montant de l'avance sur salaire demandé (GNF) *
                  <span className="text-xs text-[var(--zalama-text-secondary)] ml-2">
                    (Max: {formatCurrency(formData.avance_disponible)})
                  </span>
                </label>
                <input
                  type="number"
                  id="add-montant"
                  required
                  min="0"
                  max={formData.avance_disponible}
                  step="1000"
                  value={formData.montant_demande}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    montant_demande: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
                  placeholder="0"
                />
                {formData.montant_demande > formData.avance_disponible && (
                  <p className="text-xs text-[var(--zalama-danger)] mt-1">
                    Le montant demandé ne peut pas dépasser l'avance sur salaire disponible
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="add-type-motif" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                  Type de motif *
                </label>
                <input
                  type="text"
                  id="add-type-motif"
                  required
                  value={formData.type_motif}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    type_motif: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
                  placeholder="Ex: Urgence médicale, Éducation..."
                />
              </div>
            </div>

            {/* Motif détaillé */}
            <div>
              <label htmlFor="add-motif" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Motif détaillé *
              </label>
              <textarea
                id="add-motif"
                required
                rows={3}
                value={formData.motif}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  motif: e.target.value
                }))}
                className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
                placeholder="Décrivez le motif de la demande d'avance sur salaire..."
              />
            </div>

            {/* Frais de service et montant total */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="add-frais" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                  Frais de service (GNF)
                </label>
                <input
                  type="number"
                  id="add-frais"
                  min="0"
                  step="100"
                  value={formData.frais_service}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    frais_service: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="add-montant-total" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                  Montant total (GNF) *
                </label>
                <input
                  type="number"
                  id="add-montant-total"
                  required
                  min="0"
                  step="1000"
                  value={calculateTotal()}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    montant_total: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
                  placeholder="0"
                />
                <p className="text-xs text-[var(--zalama-text-secondary)] mt-1">
                  Calculé automatiquement: {formatCurrency(calculateTotal())}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                  Salaire disponible (GNF)
                </label>
                <div className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] min-h-[42px] flex items-center">
                  {formatCurrency(formData.salaire_disponible)}
                </div>
                {selectedEmployee && !selectedEmployee.salaire_net && (
                  <p className="text-xs text-[var(--zalama-warning)] mt-1">
                    ⚠️ Aucun salaire défini pour cet employé
                  </p>
                )}
              </div>
            </div>

            {/* Avance disponible */}
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Avance disponible (GNF)
              </label>
              <div className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] min-h-[42px] flex items-center">
                {formatCurrency(formData.avance_disponible)}
                <span className="text-xs text-[var(--zalama-text-secondary)] ml-2">
                  (50% du salaire net)
                </span>
              </div>
              {selectedEmployee && !selectedEmployee.salaire_net && (
                <p className="text-xs text-[var(--zalama-warning)] mt-1">
                  ⚠️ Impossible de calculer l'avance sans salaire défini
                </p>
              )}
            </div>

            {/* Champs cachés pour les valeurs calculées */}
            <input type="hidden" id="add-salaire-disponible" value={formData.salaire_disponible} />
            <input type="hidden" id="add-avance-disponible" value={formData.avance_disponible} />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--zalama-border)]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg)] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-[var(--zalama-blue)] text-white rounded-lg hover:bg-[var(--zalama-blue-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Créer la demande
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModaleAjoutDemande; 