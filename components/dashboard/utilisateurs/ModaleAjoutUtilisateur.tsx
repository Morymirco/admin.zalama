import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ModaleAjoutUtilisateurProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

const ModaleAjoutUtilisateur: React.FC<ModaleAjoutUtilisateurProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [typeUtilisateur, setTypeUtilisateur] = useState<string>('Étudiant');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Ajouter un nouvel utilisateur</h3>
          <button 
            onClick={onClose}
            className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-5">
          <div className="space-y-4">
            {/* Type d'utilisateur */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Type d&apos;utilisateur</label>
              <select
                id="type"
                name="type"
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                value={typeUtilisateur}
                onChange={(e) => setTypeUtilisateur(e.target.value)}
              >
                <option value="Étudiant">Étudiant</option>
                <option value="Salarié">Salarié</option>
                <option value="Entreprise">Entreprise</option>
              </select>
            </div>
            
            {/* Informations personnelles */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Prénom</label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  placeholder="Prénom"
                />
              </div>
              
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  placeholder="Nom"
                />
              </div>
            </div>
            
            {/* Coordonnées */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="email@exemple.com"
              />
            </div>
            
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="+224 XXX XXX XXX"
              />
            </div>
            
            <div>
              <label htmlFor="adresse" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Adresse</label>
              <input
                type="text"
                id="adresse"
                name="adresse"
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Adresse complète"
              />
            </div>
            
            {/* Champs spécifiques au type d'utilisateur */}
            {typeUtilisateur === 'Étudiant' && (
              <>
                <div>
                  <label htmlFor="etablissement" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Établissement</label>
                  <input
                    type="text"
                    id="etablissement"
                    name="etablissement"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="Nom de l'établissement"
                  />
                </div>
                
                <div>
                  <label htmlFor="niveauEtudes" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Niveau d&apos;études</label>
                  <select
                    id="niveauEtudes"
                    name="niveauEtudes"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  >
                    <option value="">Sélectionner un niveau</option>
                    <option value="Licence 1">Licence 1</option>
                    <option value="Licence 2">Licence 2</option>
                    <option value="Licence 3">Licence 3</option>
                    <option value="Master 1">Master 1</option>
                    <option value="Master 2">Master 2</option>
                    <option value="Doctorat">Doctorat</option>
                  </select>
                </div>
              </>
            )}
            
            {typeUtilisateur === 'Salarié' && (
              <>
                <div>
                  <label htmlFor="organisation" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Organisation</label>
                  <input
                    type="text"
                    id="organisation"
                    name="organisation"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="Nom de l'organisation"
                  />
                </div>
                
                <div>
                  <label htmlFor="poste" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Poste</label>
                  <input
                    type="text"
                    id="poste"
                    name="poste"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="Intitulé du poste"
                  />
                </div>
              </>
            )}
            
            {typeUtilisateur === 'Entreprise' && (
              <>
                <div>
                  <label htmlFor="organisation" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom de l&apos;entreprise</label>
                  <input
                    type="text"
                    id="organisation"
                    name="organisation"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="Nom de l'entreprise"
                  />
                </div>
                
                <div>
                  <label htmlFor="secteur" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Secteur d&apos;activité</label>
                  <input
                    type="text"
                    id="secteur"
                    name="secteur"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="Secteur d'activité"
                  />
                </div>
              </>
            )}
            
            {/* Statut */}
            <div>
              <label htmlFor="statut" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Statut</label>
              <select
                id="statut"
                name="statut"
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="En attente">En attente</option>
              </select>
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

export default ModaleAjoutUtilisateur;
