import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Employe } from '@/types/partenaire';
import { Partenaire } from '@/types/partenaire';

interface ModaleEditionUtilisateurProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  utilisateur: Employe;
  types?: string[];
  partners?: Partenaire[];
}

const ModaleEditionUtilisateur: React.FC<ModaleEditionUtilisateurProps> = ({
  isOpen,
  onClose,
  onSubmit,
  utilisateur,
  partners = []
}) => {
  const [selectedPartner, setSelectedPartner] = useState<string>(utilisateur.partner_id || '');

  useEffect(() => {
    setSelectedPartner(utilisateur.partner_id || '');
  }, [utilisateur]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Modifier l'employé</h3>
          <button 
            onClick={onClose}
            className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onSubmit(formData);
        }} className="p-5">
          <div className="space-y-4">
            {/* Sélection du partenaire */}
            <div>
              <label htmlFor="partner_id" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Partenaire *</label>
              <select
                id="partner_id"
                name="partner_id"
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)}
              >
                <option value="">Sélectionner un partenaire</option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.nom}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Informations personnelles */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Prénom *</label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  required
                  defaultValue={utilisateur.prenom}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  placeholder="Prénom"
                />
              </div>
              
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom *</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  required
                  defaultValue={utilisateur.nom}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  placeholder="Nom"
                />
              </div>
            </div>

            {/* Genre */}
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Genre</label>
              <select
                id="genre"
                name="genre"
                defaultValue={utilisateur.genre}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              >
                <option value="">Sélectionner un genre</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            {/* Coordonnées */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                defaultValue={utilisateur.email}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="email@exemple.com"
              />
            </div>
            
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone *</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                required
                defaultValue={utilisateur.telephone}
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
                defaultValue={utilisateur.adresse}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Adresse complète"
              />
            </div>
            
            {/* Informations professionnelles */}
            <div>
              <label htmlFor="poste" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Poste *</label>
              <input
                type="text"
                id="poste"
                name="poste"
                required
                defaultValue={utilisateur.poste}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Intitulé du poste"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Rôle</label>
              <input
                type="text"
                id="role"
                name="role"
                defaultValue={utilisateur.role}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Rôle dans l'entreprise"
              />
            </div>

            <div>
              <label htmlFor="type_contrat" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Type de contrat</label>
              <select
                id="type_contrat"
                name="type_contrat"
                defaultValue={utilisateur.type_contrat}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              >
                <option value="">Sélectionner un type</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Consultant">Consultant</option>
                <option value="Stage">Stage</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label htmlFor="salaire_net" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Salaire net (GNF)</label>
              <input
                type="number"
                id="salaire_net"
                name="salaire_net"
                min="0"
                step="1000"
                defaultValue={utilisateur.salaire_net}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="date_embauche" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Date d'embauche</label>
              <input
                type="date"
                id="date_embauche"
                name="date_embauche"
                defaultValue={utilisateur.date_embauche ? utilisateur.date_embauche.split('T')[0] : ''}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              />
            </div>
            
            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-[var(--zalama-border)] text-[var(--zalama-text)] rounded-lg hover:bg-[var(--zalama-bg-lighter)] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[var(--zalama-blue)] text-white rounded-lg hover:bg-[var(--zalama-blue-accent)] transition-colors"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModaleEditionUtilisateur;
