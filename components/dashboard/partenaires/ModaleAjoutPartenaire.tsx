import React from 'react';
import { X } from 'lucide-react';

interface ModaleAjoutPartenaireProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  types: string[];
}

const ModaleAjoutPartenaire: React.FC<ModaleAjoutPartenaireProps> = ({
  isOpen,
  onClose,
  onSubmit,
  types
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Ajouter un nouveau partenaire</h3>
          <button 
            onClick={onClose}
            className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom du partenaire</label>
              <input
                type="text"
                id="nom"
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Nom du partenaire"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Type</label>
                <select
                  id="type"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                >
                  <option value="">Sélectionner un type</option>
                  {types.filter(type => type !== 'tous').map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="secteur" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Secteur</label>
                <input
                  type="text"
                  id="secteur"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  placeholder="Secteur d'activité"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Description</label>
              <textarea
                id="description"
                required
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Description du partenaire"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="adresse" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Adresse</label>
              <input
                type="text"
                id="adresse"
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Adresse complète"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  placeholder="Email de contact"
                />
              </div>
              
              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
                <input
                  type="tel"
                  id="telephone"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  placeholder="Numéro de téléphone"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="siteWeb" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Site Web</label>
              <input
                type="text"
                id="siteWeb"
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="www.exemple.com"
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="actif"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="relative w-10 h-5 bg-[var(--zalama-bg-lighter)] rounded-full transition peer-checked:bg-[var(--zalama-success)]/20">
                  <div className="dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition peer-checked:left-5 peer-checked:bg-[var(--zalama-success)]"></div>
                </div>
                <span className="ml-3 text-sm font-medium text-[var(--zalama-text)]">Actif</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModaleAjoutPartenaire;
