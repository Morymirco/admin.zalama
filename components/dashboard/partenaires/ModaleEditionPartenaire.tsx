import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

import { Partenaire } from '@/types/partenaire';

interface ModaleEditionPartenaireProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  partenaire: Partenaire | null;
  types: string[];
}

const ModaleEditionPartenaire: React.FC<ModaleEditionPartenaireProps> = ({
  isOpen,
  onClose,
  onSubmit,
  partenaire,
  types
}) => {
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !partenaire) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setIsSaving(true);
      await onSubmit(e);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Modifier le partenaire</h3>
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-6">
            {/* Informations générales */}
            <div>
              <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3 border-b border-[var(--zalama-border)] pb-2">
                Informations générales
              </h4>
              <div className="space-y-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom du partenaire</label>
              <input
                type="text"
                id="nom"
                required
                defaultValue={partenaire.nom}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Type</label>
                <select
                  id="type"
                  required
                  defaultValue={partenaire.type}
                      disabled={isSaving}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {types.filter(type => type !== 'tous').map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="domaine" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Secteur</label>
                <input
                  type="text"
                  id="domaine"
                  required
                  defaultValue={partenaire.secteur}
                      disabled={isSaving}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Description</label>
              <textarea
                id="description"
                rows={3}
                defaultValue={partenaire.description}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
              ></textarea>
                </div>
              </div>
            </div>

            {/* Informations légales */}
            <div>
              <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3 border-b border-[var(--zalama-border)] pb-2">
                Informations légales
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rccm" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">RCCM</label>
                  <input
                    type="text"
                    id="rccm"
                    defaultValue={partenaire.rccm}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label htmlFor="nif" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">NIF</label>
                  <input
                    type="text"
                    id="nif"
                    defaultValue={partenaire.nif}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            
            {/* Informations de contact */}
            <div>
              <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3 border-b border-[var(--zalama-border)] pb-2">
                Informations de contact
              </h4>
              <div className="space-y-4">
            <div>
              <label htmlFor="adresse" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Adresse</label>
              <input
                type="text"
                id="adresse"
                defaultValue={partenaire.adresse}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  defaultValue={partenaire.email}
                      disabled={isSaving}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
                <input
                  type="tel"
                  id="telephone"
                  defaultValue={partenaire.telephone}
                      disabled={isSaving}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            
                          <div>
                <label htmlFor="siteWeb" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Site Web</label>
                <input
                  type="text"
                  id="siteWeb"
                  defaultValue={partenaire.site_web}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Informations du représentant */}
            <div>
              <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3 border-b border-[var(--zalama-border)] pb-2">
                Représentant
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="nom_representant" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom</label>
                  <input
                    type="text"
                    id="nom_representant"
                    defaultValue={partenaire.nom_representant}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label htmlFor="email_representant" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email</label>
                  <input
                    type="email"
                    id="email_representant"
                    defaultValue={partenaire.email_representant}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label htmlFor="telephone_representant" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
                  <input
                    type="tel"
                    id="telephone_representant"
                    defaultValue={partenaire.telephone_representant}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Informations RH */}
            <div>
              <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3 border-b border-[var(--zalama-border)] pb-2">
                Responsable RH
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="nom_rh" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom</label>
                  <input
                    type="text"
                    id="nom_rh"
                    defaultValue={partenaire.nom_rh}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label htmlFor="email_rh" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email</label>
                  <input
                    type="email"
                    id="email_rh"
                    defaultValue={partenaire.email_rh}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label htmlFor="telephone_rh" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
                  <input
                    type="tel"
                    id="telephone_rh"
                    defaultValue={partenaire.telephone_rh}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Informations financières */}
            <div>
              <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3 border-b border-[var(--zalama-border)] pb-2">
                Informations financières
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre_employes" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nombre d'employés</label>
                  <input
                    type="number"
                    id="nombre_employes"
                    min="0"
                    defaultValue={partenaire.nombre_employes}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label htmlFor="salaire_net_total" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Salaire net total (FCFA)</label>
                  <input
                    type="number"
                    id="salaire_net_total"
                    min="0"
                    step="1000"
                    defaultValue={partenaire.salaire_net_total}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              </div>
            
            {/* Statut */}
            <div>
            <div className="flex items-center">
                <input
                  type="checkbox"
                  id="actif"
                  defaultChecked={partenaire.actif}
                  disabled={isSaving}
                  className="w-4 h-4 text-[var(--zalama-blue)] bg-[var(--zalama-bg-lighter)] border-[var(--zalama-border)] rounded focus:ring-[var(--zalama-blue)] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor="actif" className="ml-3 text-sm font-medium text-[var(--zalama-text)] cursor-pointer">
                  Partenaire actif
                </label>
                </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModaleEditionPartenaire;
