import React, { useState } from 'react';
import { X, UserPlus, Calendar, DollarSign, MapPin, Phone, Mail, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Employe } from '@/types/partenaire';

interface ModaleAjoutEmployeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employe: Omit<Employe, 'id' | 'created_at' | 'updated_at'>) => void;
  partnerId: string;
  partnerName: string;
}

const ModaleAjoutEmploye: React.FC<ModaleAjoutEmployeProps> = ({
  isOpen,
  onClose,
  onSubmit,
  partnerId,
  partnerName
}) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    genre: 'Homme' as 'Homme' | 'Femme' | 'Autre',
    email: '',
    telephone: '',
    adresse: '',
    poste: '',
    role: '',
    type_contrat: 'CDI' as 'CDI' | 'CDD' | 'Consultant' | 'Stage' | 'Autre',
    salaire_net: 0,
    date_embauche: new Date().toISOString().split('T')[0],
    actif: true
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.prenom || !formData.poste) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      
      const employeData: Omit<Employe, 'id' | 'created_at' | 'updated_at'> = {
        partner_id: partnerId,
        nom: formData.nom,
        prenom: formData.prenom,
        genre: formData.genre,
        email: formData.email || undefined,
        telephone: formData.telephone || undefined,
        adresse: formData.adresse || undefined,
        poste: formData.poste,
        role: formData.role || undefined,
        type_contrat: formData.type_contrat,
        salaire_net: formData.salaire_net || undefined,
        date_embauche: formData.date_embauche || undefined,
        actif: formData.actif
      };

      await onSubmit(employeData);
      
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        prenom: '',
        genre: 'Homme',
        email: '',
        telephone: '',
        adresse: '',
        poste: '',
        role: '',
        type_contrat: 'CDI',
        salaire_net: 0,
        date_embauche: new Date().toISOString().split('T')[0],
        actif: true
      });
      
      toast.success('Employé ajouté avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'employé:', error);
      toast.error('Erreur lors de l\'ajout de l\'employé');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <div className="flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-[var(--zalama-blue)]" />
            <div>
              <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Ajouter un employé</h3>
              <p className="text-sm text-[var(--zalama-text-secondary)]">{partnerName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-[var(--zalama-text)] flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations personnelles
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                    placeholder="Nom de famille"
                  />
                </div>
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                    placeholder="Prénom"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">
                  Genre
                </label>
                <select
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                >
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">
                  Adresse
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--zalama-text-secondary)]" />
                  <input
                    type="text"
                    id="adresse"
                    value={formData.adresse}
                    onChange={(e) => handleInputChange('adresse', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                    placeholder="Adresse complète"
                  />
                </div>
              </div>
            </div>

            {/* Informations professionnelles */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-[var(--zalama-text)] flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Informations professionnelles
              </h4>
              
              <div>
                <label htmlFor="poste" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">
                  Poste *
                </label>
                <input
                  type="text"
                  id="poste"
                  value={formData.poste}
                  onChange={(e) => handleInputChange('poste', e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                  placeholder="Ex: Développeur, Manager, etc."
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">
                  Rôle
                </label>
                <input
                  type="text"
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                  placeholder="Rôle spécifique dans l'équipe"
                />
              </div>

              <div>
                <label htmlFor="type_contrat" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">
                  Type de contrat
                </label>
                <select
                  id="type_contrat"
                  value={formData.type_contrat}
                  onChange={(e) => handleInputChange('type_contrat', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Stage">Stage</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="date_embauche" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">
                  Date d'embauche
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--zalama-text-secondary)]" />
                  <input
                    type="date"
                    id="date_embauche"
                    value={formData.date_embauche}
                    onChange={(e) => handleInputChange('date_embauche', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="salaire_net" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">
                  Salaire net (GNF)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--zalama-text-secondary)]" />
                  <input
                    type="number"
                    id="salaire_net"
                    value={formData.salaire_net}
                    onChange={(e) => handleInputChange('salaire_net', parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-6 space-y-4">
            <h4 className="text-md font-semibold text-[var(--zalama-text)] flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Informations de contact
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--zalama-text-secondary)]" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--zalama-text-secondary)]" />
                  <input
                    type="tel"
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                    placeholder="+224 623 456 789"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Statut */}
          <div className="mt-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.actif}
                onChange={(e) => handleInputChange('actif', e.target.checked)}
                className="rounded border-[var(--zalama-border)] text-[var(--zalama-blue)] focus:ring-[var(--zalama-blue)]"
              />
              <span className="text-sm text-[var(--zalama-text)]">Employé actif</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--zalama-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Ajout en cours...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Ajouter l'employé
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModaleAjoutEmploye;
