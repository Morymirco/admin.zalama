"use client";

import React, { useState } from 'react';
import { Lock, Key, Shield, AlertTriangle } from 'lucide-react';

interface ParametresSecuriteProps {
  isLoading: boolean;
}

const ParametresSecurite: React.FC<ParametresSecuriteProps> = ({ isLoading }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    // Simulation de changement de mot de passe réussi
    setSuccess('Mot de passe modifié avec succès');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowChangePassword(false);
    
    // Effacer le message de succès après 3 secondes
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const handleToggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    // Ici, vous pourriez implémenter la logique pour activer/désactiver l'authentification à deux facteurs
  };

  const handleSessionTimeoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSessionTimeout(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--zalama-card)] rounded-lg shadow p-6 mb-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--zalama-card)] rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">Paramètres de sécurité</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300 flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-300 flex items-start">
          <Shield className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{success}</p>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Changement de mot de passe */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-[var(--zalama-text)]">Mot de passe</h3>
            {!showChangePassword && (
              <button
                type="button"
                onClick={() => setShowChangePassword(true)}
                className="text-sm text-[var(--zalama-text)] hover:text-[var(--zalama-primary-dark)] focus:outline-none"
              >
                Changer le mot de passe
              </button>
            )}
          </div>
          
          {showChangePassword ? (
            <form onSubmit={handleSubmitPassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-[var(--zalama-text)]">
                  Mot de passe actuel
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    className="focus:ring-[var(--zalama-primary)] focus:border-[var(--zalama-primary)] block w-full pl-10 sm:text-sm border-[var(--zalama-border)] rounded-md bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]"
                    placeholder="Votre mot de passe actuel"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-[var(--zalama-text)]">
                  Nouveau mot de passe
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    className="focus:ring-[var(--zalama-primary)] focus:border-[var(--zalama-primary)] block w-full pl-10 sm:text-sm border-[var(--zalama-border)] rounded-md bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]"
                    placeholder="Nouveau mot de passe"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Le mot de passe doit contenir au moins 8 caractères, incluant une lettre majuscule, une lettre minuscule et un chiffre.
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--zalama-text)]">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className="focus:ring-[var(--zalama-primary)] focus:border-[var(--zalama-primary)] block w-full pl-10 sm:text-sm border-[var(--zalama-border)] rounded-md bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]"
                    placeholder="Confirmer le mot de passe"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setError('');
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-[var(--zalama-border)] shadow-sm text-sm font-medium rounded-md text-[var(--zalama-text)] bg-[var(--zalama-bg-light)] hover:bg-[var(--zalama-bg-lighter)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--zalama-primary)]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--zalama-primary)] hover:bg-[var(--zalama-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--zalama-primary)]"
                >
                  Mettre à jour le mot de passe
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Votre mot de passe a été mis à jour pour la dernière fois il y a 30 jours
            </p>
          )}
        </div>
        
        {/* Authentification à deux facteurs */}
        <div>
          <h3 className="text-lg font-medium text-[var(--zalama-text)] mb-3">Authentification à deux facteurs</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                L&apos;authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {twoFactorEnabled 
                  ? 'Activée - Un code de vérification sera envoyé à votre téléphone lors de la connexion.' 
                  : 'Désactivée - Votre compte est protégé uniquement par mot de passe.'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={twoFactorEnabled}
                onChange={handleToggleTwoFactor}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--zalama-primary-light)] dark:peer-focus:ring-[var(--zalama-primary-dark)] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--zalama-primary)]"></div>
            </label>
          </div>
        </div>
        
        {/* Expiration de session */}
        <div>
          <h3 className="text-lg font-medium text-[var(--zalama-text)] mb-3">Expiration de session</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Définir le délai d&apos;inactivité avant la déconnexion automatique
            </p>
            <select
              id="sessionTimeout"
              name="sessionTimeout"
              className="block w-32 py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-[var(--zalama-primary)] focus:border-[var(--zalama-primary)] sm:text-sm text-[var(--zalama-text)]"
              value={sessionTimeout}
              onChange={handleSessionTimeoutChange}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 heure</option>
              <option value="120">2 heures</option>
              <option value="240">4 heures</option>
            </select>
          </div>
        </div>
        
        {/* Activité récente */}
        <div>
          <h3 className="text-lg font-medium text-[var(--zalama-text)] mb-3">Activité récente</h3>
          <div className="bg-[var(--zalama-bg-light)] rounded-md p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--zalama-text)]">Connexion réussie</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Conakry, Guinée</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Aujourd&apos;hui, 09&apos;45</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--zalama-text)]">Changement de mot de passe</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Conakry, Guinée</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Il y a 30 jours</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--zalama-text)]">Connexion réussie</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Conakry, Guinée</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Il y a 31 jours</p>
              </div>
            </div>
          </div>
          <div className="mt-2 text-right">
            <button
              type="button"
              className="text-sm text-[var(--zalama-primary)] hover:text-[var(--zalama-primary-dark)] focus:outline-none"
            >
              Voir toute l&apos;activité
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParametresSecurite;
