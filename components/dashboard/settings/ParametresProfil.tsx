"use client";

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react';
import Image from 'next/image';

interface ParametresProfilProps {
  isLoading: boolean;
}

const ParametresProfil: React.FC<ParametresProfilProps> = ({ isLoading }) => {
  const [profileData, setProfileData] = useState({
    nom: 'Mamadou Diallo',
    email: 'mamadou.diallo@zalama.gn',
    telephone: '+224 621 12 34 56',
    adresse: 'Conakry, Guinée',
    bio: 'Responsable marketing chez ZaLaMa, spécialisé dans le développement de stratégies digitales pour les entreprises guinéennes.',
    photo: '/images/avatars/avatar-1.svg'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileData(formData);
    setIsEditing(false);
    // Ici, vous pourriez envoyer les données à une API
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="dark:bg-[var(--zalama-card-dark)] rounded-lg shadow p-6 mb-6 animate-pulse">
        <div className="h-8 bg-gray-700 dark:bg-gray-700 rounded mb-4 w-1/4"></div>
        <div className="h-32 bg-gray-700 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-10 bg-gray-700 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--zalama-card)] dark:bg-[var(--zalama-card-dark)] rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">Paramètres du profil</h2>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 mb-4 md:mb-0">
              <Image
                src={formData.photo} 
                alt="Photo de profil" 
                className="w-full h-full object-cover"
                width={96}
                height={96}
              />
              <button 
                type="button" 
                className="absolute bottom-0 right-0 bg-[var(--zalama-primary)] text-white p-1 rounded-full"
                onClick={() => alert('Fonctionnalité de changement de photo à implémenter')}
              >
                <Camera size={16} />
              </button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-[var(--zalama-text)]">
                  Nom complet
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-200" />
                  </div>
                  <input
                    type="text"
                    name="nom"
                    id="nom"
                    className="focus:ring-[var(--zalama-primary)] focus:border-[var(--zalama-primary)] block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-[var(--zalama-text)]"
                    placeholder="Votre nom complet"
                    value={formData.nom}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--zalama-text)]">
                  Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-200" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="focus:ring-[var(--zalama-primary)] focus:border-[var(--zalama-primary)] block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-[var(--zalama-text)]"
                    placeholder="votre.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-[var(--zalama-text)]">
                  Téléphone
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-200" />
                  </div>
                  <input
                    type="tel"
                    name="telephone"
                    id="telephone"
                    className="focus:ring-[var(--zalama-primary)] focus:border-[var(--zalama-primary)] block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-[var(--zalama-text)]"
                    placeholder="+224 XXX XX XX XX"
                    value={formData.telephone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-[var(--zalama-text)]">
                  Adresse
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-200" />
                  </div>
                  <input
                    type="text"
                    name="adresse"
                    id="adresse"
                    className="focus:ring-[var(--zalama-primary)] focus:border-[var(--zalama-primary)] block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-[var(--zalama-text)]"
                    placeholder="Votre adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-[var(--zalama-text)]">
              Biographie
            </label>
            <div className="mt-1">
              <textarea
                id="bio"
                name="bio"
                rows={3}
                className="shadow-sm focus:ring-[var(--zalama-primary)] focus:border-[var(--zalama-primary)] block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-[var(--zalama-text)]"
                placeholder="Parlez-nous de vous"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--zalama-primary)]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--zalama-primary)] hover:bg-[var(--zalama-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--zalama-primary)]"
            >
              Enregistrer
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 mb-4 md:mb-0">
              <Image 
                src={profileData.photo} 
                alt="Photo de profil" 
                className="w-full h-full object-cover"
                width={96}
                height={96}
              />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-medium text-[var(--zalama-text)]">{profileData.nom}</h3>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" /> {profileData.email}
                </p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" /> {profileData.telephone}
                </p>
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" /> {profileData.adresse}
                </p>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                {profileData.bio}
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--zalama-blue)] hover:bg-[var(--zalama-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--zalama-primary)]"
            >
              Modifier le profil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParametresProfil;
