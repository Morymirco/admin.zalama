import React, { useState } from 'react';
import { X, UserPlus, Calendar, DollarSign, MapPin, Phone, Mail, User, CheckCircle, AlertCircle, Key, MessageSquare, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Employe } from '@/types/partenaire';
import EmployeePhotoUpload from './EmployeePhotoUpload';

interface ModaleAjoutEmployeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employe: Omit<Employe, 'id' | 'created_at' | 'updated_at'>) => Promise<{
    employe: Employe;
    account?: {
      success: boolean;
      password?: string;
      error?: string;
    };
    sms?: {
      success: boolean;
      error?: string;
    };
  }>;
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
    actif: true,
    photo_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    employe: Employe;
    account?: {
      success: boolean;
      password?: string;
      error?: string;
    };
    sms?: {
      success: boolean;
      error?: string;
    };
  } | null>(null);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (photoUrl: string) => {
    handleInputChange('photo_url', photoUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.prenom || !formData.poste) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier que l'email est fourni pour la création du compte
    if (!formData.email) {
      toast.error('L\'email est requis pour créer un compte de connexion');
      return;
    }

    try {
      setLoading(true);
      
      const employeData: Omit<Employe, 'id' | 'created_at' | 'updated_at'> = {
        partner_id: partnerId,
        nom: formData.nom,
        prenom: formData.prenom,
        genre: formData.genre,
        email: formData.email,
        telephone: formData.telephone || undefined,
        adresse: formData.adresse || undefined,
        poste: formData.poste,
        role: formData.role || undefined,
        type_contrat: formData.type_contrat,
        salaire_net: formData.salaire_net || undefined,
        date_embauche: formData.date_embauche || undefined,
        actif: formData.actif,
        photo_url: formData.photo_url || undefined
      };

      const result = await onSubmit(employeData);
      
      // Afficher le résumé des actions effectuées
      setSummaryData(result);
      setShowSummary(true);
      
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
        actif: true,
        photo_url: ''
      });
      
      toast.success('Employé ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'employé:', error);
      
      // Gérer les erreurs spécifiques
      let errorMessage = 'Erreur lors de l\'ajout de l\'employé';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Gérer les erreurs spécifiques
        if (error.message.includes('existe déjà')) {
          errorMessage = 'Un employé avec cet email existe déjà. Veuillez utiliser un email différent.';
        } else if (error.message.includes('réseau') || error.message.includes('network')) {
          errorMessage = 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Délai d\'attente dépassé. Veuillez réessayer.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowSummary(false);
    setSummaryData(null);
    onClose();
  };

  if (!isOpen) return null;

  // Affichage du résumé des actions effectuées
  if (showSummary && summaryData) {
    // Déterminer le statut global
    const isSuccess = summaryData.account?.success;
    const hasErrors = summaryData.account?.error || summaryData.sms?.error || summaryData.email?.error;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
            <div className="flex items-center gap-3">
              {isSuccess ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-[var(--zalama-text)]">
                  {isSuccess ? 'Employé ajouté avec succès' : 'Employé ajouté avec des avertissements'}
                </h3>
                <p className="text-sm text-[var(--zalama-text-secondary)]">{partnerName}</p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-5 space-y-4">
            {/* Informations de l'employé */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Employé créé
              </h4>
              <p className="text-green-700 dark:text-green-300">
                {summaryData.employee.prenom} {summaryData.employee.nom} - {summaryData.employee.poste}
              </p>
            </div>

            {/* Informations du compte */}
            {summaryData.account && (
              <div className={`border rounded-lg p-4 ${
                summaryData.account.success 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
                  summaryData.account.success 
                    ? 'text-blue-800 dark:text-blue-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  <Key className="h-4 w-4" />
                  {summaryData.account.success ? 'Compte de connexion créé' : 'Erreur création du compte'}
                </h4>
                
                {summaryData.account.success ? (
                  <div className="space-y-2">
                    <p className="text-blue-700 dark:text-blue-300">
                      Email: <span className="font-mono">{summaryData.employee.email}</span>
                    </p>
                    {summaryData.account.password && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium mb-1">
                          Mot de passe généré (à communiquer à l'employé) :
                        </p>
                        <p className="font-mono text-lg font-bold text-yellow-900 dark:text-yellow-100">
                          {summaryData.account.password}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-red-700 dark:text-red-300">
                    Erreur: {summaryData.account.error}
                  </p>
                )}
              </div>
            )}

            {/* Informations SMS */}
            {summaryData.sms && (
              <div className={`border rounded-lg p-4 ${
                summaryData.sms.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
              }`}>
                <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
                  summaryData.sms.success 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-orange-800 dark:text-orange-200'
                }`}>
                  <MessageSquare className="h-4 w-4" />
                  {summaryData.sms.success ? 'SMS envoyé' : 'SMS non envoyé'}
                </h4>
                
                {summaryData.sms.success ? (
                  <p className="text-green-700 dark:text-green-300">
                    Les identifiants ont été envoyés par SMS au numéro {summaryData.employee.telephone}
                  </p>
                ) : (
                  <p className="text-orange-700 dark:text-orange-300">
                    {summaryData.sms.error || 'Impossible d\'envoyer le SMS'}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--zalama-border)]">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              
              {/* Photo de l'employé */}
              <div>
                <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Photo de l'employé
                </label>
                <EmployeePhotoUpload
                  onPhotoChange={handlePhotoUpload}
                  currentPhotoUrl={formData.photo_url}
                />
              </div>
              
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
