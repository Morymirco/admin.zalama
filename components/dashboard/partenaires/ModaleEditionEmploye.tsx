import React, { useState } from 'react';
import { X, Loader2, Send, Mail, MessageSquare } from 'lucide-react';
import { Employe } from '@/types/partenaire';
import employeeAccountService from '@/services/employeeAccountService';
import { toast } from 'react-hot-toast';

interface ModaleEditionEmployeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, employe: Partial<Omit<Employe, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  employe: Employe | null;
}

const ModaleEditionEmploye: React.FC<ModaleEditionEmployeProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employe
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingCredentials, setIsSendingCredentials] = useState(false);
  const [credentialsResult, setCredentialsResult] = useState<{
    password: { success: boolean; password?: string; error?: string };
    sms: { success: boolean; error?: string };
    email: { success: boolean; error?: string };
  } | null>(null);

  if (!isOpen || !employe) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setIsSaving(true);
      e.preventDefault();
      
      const form = e.currentTarget;
      const formData = {
        nom: (form.querySelector('#nom') as HTMLInputElement)?.value || '',
        prenom: (form.querySelector('#prenom') as HTMLInputElement)?.value || '',
        genre: (form.querySelector('#genre') as HTMLSelectElement)?.value || 'Homme',
        email: (form.querySelector('#email') as HTMLInputElement)?.value || '',
        telephone: (form.querySelector('#telephone') as HTMLInputElement)?.value || '',
        adresse: (form.querySelector('#adresse') as HTMLTextAreaElement)?.value || '',
        poste: (form.querySelector('#poste') as HTMLInputElement)?.value || '',
        role: (form.querySelector('#role') as HTMLInputElement)?.value || '',
        type_contrat: (form.querySelector('#type_contrat') as HTMLSelectElement)?.value || 'CDI',
        salaire_net: parseFloat((form.querySelector('#salaire_net') as HTMLInputElement)?.value || '0'),
        date_embauche: (form.querySelector('#date_embauche') as HTMLInputElement)?.value || '',
        actif: (form.querySelector('#actif') as HTMLInputElement)?.checked || false
      };

      await onSubmit(employe.id, formData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendCredentials = async () => {
    try {
      setIsSendingCredentials(true);
      setCredentialsResult(null);
      
      const result = await employeeAccountService.resendEmployeeCredentials(employe);
      setCredentialsResult(result);
      
      if (result.password.success) {
        // Vérifier si c'est un nouveau compte ou une réinitialisation
        const message = result.password.message?.includes('créé') 
          ? 'Compte utilisateur créé et identifiants envoyés avec succès'
          : 'Identifiants renvoyés avec succès';
        toast.success(message);
      } else {
        toast.error('Erreur lors du renvoi des identifiants');
      }
    } catch (error) {
      console.error('Erreur lors du renvoi des identifiants:', error);
      toast.error('Erreur lors du renvoi des identifiants');
    } finally {
      setIsSendingCredentials(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Modifier l'employé</h3>
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
            {/* Informations personnelles */}
            <div>
              <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3 border-b border-[var(--zalama-border)] pb-2">
                Informations personnelles
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom</label>
                  <input
                    type="text"
                    id="nom"
                    required
                    defaultValue={employe.nom}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Prénom</label>
                  <input
                    type="text"
                    id="prenom"
                    required
                    defaultValue={employe.prenom}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label htmlFor="genre" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Genre</label>
                <select
                  id="genre"
                  required
                  defaultValue={employe.genre}
                  disabled={isSaving}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            {/* Informations de contact */}
            <div>
              <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3 border-b border-[var(--zalama-border)] pb-2">
                Informations de contact
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      defaultValue={employe.email}
                      disabled={isSaving}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="telephone" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
                    <input
                      type="tel"
                      id="telephone"
                      defaultValue={employe.telephone}
                      disabled={isSaving}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="adresse" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Adresse</label>
                  <textarea
                    id="adresse"
                    rows={3}
                    defaultValue={employe.adresse}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Informations professionnelles */}
            <div>
              <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3 border-b border-[var(--zalama-border)] pb-2">
                Informations professionnelles
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="poste" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Poste</label>
                    <input
                      type="text"
                      id="poste"
                      required
                      defaultValue={employe.poste}
                      disabled={isSaving}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Rôle</label>
                    <input
                      type="text"
                      id="role"
                      defaultValue={employe.role}
                      disabled={isSaving}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type_contrat" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Type de contrat</label>
                    <select
                      id="type_contrat"
                      required
                      defaultValue={employe.type_contrat}
                      disabled={isSaving}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Stage">Stage</option>
                      <option value="Consultant">Consultant</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="date_embauche" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Date d'embauche</label>
                    <input
                      type="date"
                      id="date_embauche"
                      defaultValue={employe.date_embauche}
                      disabled={isSaving}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="salaire_net" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Salaire net (FCFA)</label>
                  <input
                    type="number"
                    id="salaire_net"
                    min="0"
                    step="1000"
                    defaultValue={employe.salaire_net}
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
                  defaultChecked={employe.actif}
                  disabled={isSaving}
                  className="w-4 h-4 text-[var(--zalama-blue)] bg-[var(--zalama-bg-lighter)] border-[var(--zalama-border)] rounded focus:ring-[var(--zalama-blue)] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor="actif" className="ml-3 text-sm font-medium text-[var(--zalama-text)] cursor-pointer">
                  Employé actif
                </label>
              </div>
            </div>

            {/* Renvoi d'identifiants */}
            <div>
              <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3 border-b border-[var(--zalama-border)] pb-2">
                Renvoi d'identifiants
              </h4>
              <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4">
                <p className="text-sm text-[var(--zalama-text-secondary)] mb-4">
                  Renvoyer un nouveau mot de passe à l'employé par SMS et email.
                </p>
                
                <button
                  type="button"
                  onClick={handleResendCredentials}
                  disabled={isSendingCredentials || !employe.email || !employe.telephone}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-green)] hover:bg-[var(--zalama-green-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingCredentials && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Send className="h-4 w-4" />
                  {isSendingCredentials ? 'Envoi en cours...' : 'Renvoyer les identifiants'}
                </button>
                
                {!employe.email && (
                  <p className="text-sm text-[var(--zalama-warning)] mt-2">
                    ⚠️ L'email est requis pour renvoyer les identifiants
                  </p>
                )}
                
                {!employe.telephone && (
                  <p className="text-sm text-[var(--zalama-warning)] mt-2">
                    ⚠️ Le téléphone est requis pour l'envoi SMS
                  </p>
                )}
                
                {/* Résultats des envois */}
                {credentialsResult && (
                  <div className="mt-4 space-y-2">
                    <h5 className="text-sm font-medium text-[var(--zalama-text)]">Résultats de l'envoi :</h5>
                    
                    {/* Mot de passe */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[var(--zalama-text-secondary)]">Compte :</span>
                      {credentialsResult.password.success ? (
                        <span className="text-[var(--zalama-success)] flex items-center gap-1">
                          {credentialsResult.password.message?.includes('créé') ? '✅ Créé' : '✅ Réinitialisé'}
                          {credentialsResult.password.password && (
                            <span className="text-xs bg-[var(--zalama-success)]/10 px-2 py-1 rounded">
                              {credentialsResult.password.password}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-[var(--zalama-danger)]">❌ Échec</span>
                      )}
                    </div>
                    
                    {/* SMS */}
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                      <span className="text-[var(--zalama-text-secondary)]">SMS :</span>
                      {credentialsResult.sms.success ? (
                        <span className="text-[var(--zalama-success)]">✅ Envoyé</span>
                      ) : (
                        <span className="text-[var(--zalama-danger)]">❌ Échec</span>
                      )}
                    </div>
                    
                    {/* Email */}
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                      <span className="text-[var(--zalama-text-secondary)]">Email :</span>
                      {credentialsResult.email.success ? (
                        <span className="text-[var(--zalama-success)]">✅ Envoyé</span>
                      ) : (
                        <span className="text-[var(--zalama-danger)]">❌ Échec</span>
                      )}
                    </div>
                  </div>
                )}
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

export default ModaleEditionEmploye; 