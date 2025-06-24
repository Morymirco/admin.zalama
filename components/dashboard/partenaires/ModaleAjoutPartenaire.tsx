"use client";
import React, { useState } from 'react';
import { usePartners } from '@/hooks/useDatabase';
import { Partner } from '@/lib/supabase';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { X, Save, Building, User, Mail, Phone, Globe, MapPin, AlertCircle, Image, Calendar, Users, DollarSign, Check } from 'lucide-react';
import Notification, { NotificationType } from '@/components/ui/Notification';

interface ModaleAjoutPartenaireProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ModaleAjoutPartenaire({ isOpen, onClose, onSuccess }: ModaleAjoutPartenaireProps) {
  const { createPartner } = usePartners();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: NotificationType;
    title: string;
    message?: string;
  }>({
    show: false,
    type: 'info',
    title: ''
  });

  // État du formulaire avec le champ logo de type File
  const [formData, setFormData] = useState({
    nom: '',
    type: '',
    secteur: '',
    description: '',
    nom_representant: '',
    email_representant: '',
    telephone_representant: '',
    nom_rh: '',
    email_rh: '',
    telephone_rh: '',
    rccm: '',
    nif: '',
    email: '',
    telephone: '',
    adresse: '',
    site_web: '',
    logo: null as File | null,
    date_adhesion: '',
    actif: true,
    nombre_employes: '',
    salaire_net_total: '',
  });

  // Types de partenaires disponibles
  const typesPartenaires = [
    'Université',
    'Entreprise',
    'Organisation',
    'Institution',
    'Centre de formation',
    'Agence',
    'Association'
  ];

  // Secteurs d'activité
  const secteurs = [
    'Technologie',
    'Éducation',
    'Santé',
    'Finance',
    'Commerce',
    'Industrie',
    'Services',
    'Marketing',
    'Consultation',
    'Formation',
    'Recherche',
    'Autre'
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      logo: file,
    }));
  };

  const showNotification = (type: NotificationType, title: string, message?: string) => {
    setNotification({
      show: true,
      type,
      title,
      message
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation des champs obligatoires
      if (!formData.nom || !formData.type || !formData.secteur || !formData.email) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Adresse email invalide');
      }

      // Validation du fichier logo
      let logoUrl: string | undefined;
      if (formData.logo) {
        const fileExt = formData.logo.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('logos')
          .upload(`public/${fileName}`, formData.logo);
        
        if (error) {
          throw new Error('Erreur lors du téléchargement du logo');
        }

        const { data: publicUrlData } = supabase.storage
          .from('logos')
          .getPublicUrl(`public/${fileName}`);
        
        logoUrl = publicUrlData.publicUrl;
      }

      // Préparation des données
      const partnerData: Partial<Partner> = {
        nom: formData.nom,
        type: formData.type,
        secteur: formData.secteur,
        description: formData.description || undefined,
        nom_representant: formData.nom_representant || undefined,
        email_representant: formData.email_representant || undefined,
        telephone_representant: formData.telephone_representant || undefined,
        nom_rh: formData.nom_rh || undefined,
        email_rh: formData.email_rh || undefined,
        telephone_rh: formData.telephone_rh || undefined,
        rccm: formData.rccm || undefined,
        nif: formData.nif || undefined,
        email: formData.email,
        telephone: formData.telephone || undefined,
        adresse: formData.adresse || undefined,
        site_web: formData.site_web || undefined,
        logo_url: logoUrl || undefined,
        date_adhesion: formData.date_adhesion ? new Date(formData.date_adhesion).toISOString() : undefined,
        actif: formData.actif,
        nombre_employes: formData.nombre_employes ? parseInt(formData.nombre_employes) : undefined,
        salaire_net_total: formData.salaire_net_total ? parseFloat(formData.salaire_net_total) : undefined,
      };

      await createPartner(partnerData);

      showNotification('success', 'Partenaire créé avec succès', 'Le nouveau partenaire a été ajouté à la base de données.');

      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        type: '',
        secteur: '',
        description: '',
        nom_representant: '',
        email_representant: '',
        telephone_representant: '',
        nom_rh: '',
        email_rh: '',
        telephone_rh: '',
        rccm: '',
        nif: '',
        email: '',
        telephone: '',
        adresse: '',
        site_web: '',
        logo: null,
        date_adhesion: '',
        actif: true,
        nombre_employes: '',
        salaire_net_total: '',
      });

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du partenaire';
      showNotification('error', 'Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--zalama-bg)] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--zalama-border)] bg-[var(--zalama-bg-dark)]">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-[var(--zalama-blue)] to-[var(--zalama-blue-dark)] rounded-xl shadow-lg">
                <Building className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--zalama-text)]">Ajouter un partenaire</h2>
                <p className="text-sm text-[var(--zalama-text-secondary)] mt-1">
                  Remplissez les informations du nouveau partenaire
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-[var(--zalama-text-secondary)]" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-[var(--zalama-bg-dark)]">
            {/* Informations générales */}
            <div className="space-y-6 p-6 rounded-lg">
              <div className="flex items-center space-x-3 pb-2 border-b border-[var(--zalama-border)]">
                <Building className="h-5 w-5 text-[var(--zalama-blue)]" />
                <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Informations générales</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-2">
                    Nom du partenaire <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                    placeholder="Nom de l'organisation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    {typesPartenaires.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-2">
                    Secteur d'activité <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="secteur"
                    value={formData.secteur}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                    required
                  >
                    <option value="">Sélectionner un secteur</option>
                    {secteurs.map(secteur => (
                      <option key={secteur} value={secteur}>{secteur}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-2">
                    Email principal <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--zalama-text-secondary)]" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                      placeholder="contact@entreprise.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-2">
                    Logo
                  </label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--zalama-text-secondary)]" />
                    <input
                      type="file"
                      name="logo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full pl-12 pr-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-2">
                    Date d'adhésion
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--zalama-text-secondary)]" />
                    <input
                      type="date"
                      name="date_adhesion"
                      value={formData.date_adhesion}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-3">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                  placeholder="Description de l'organisation..."
                />
              </div>
            </div>

            {/* Informations de contact */}
            <div className="space-y-6 bg-[var(--zalama-bg-dark)] p-6 rounded-lg">
              <div className="flex items-center space-x-3 pb-2 border-b border-[var(--zalama-border)]">
                <Phone className="h-5 w-5 text-[var(--zalama-blue)]" />
                <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Informations de contact</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-3">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--zalama-text-secondary)]" />
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                      placeholder="+224 123 456 789"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-2">
                    Site web
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--zalama-text-secondary)]" />
                    <input
                      type="url"
                      name="site_web"
                      value={formData.site_web}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                      placeholder="https://www.entreprise.com"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-2">
                    Adresse
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--zalama-text-secondary)]" />
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                      placeholder="Adresse complète..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Représentant */}
            <div className="space-y-6 bg-[var(--zalama-bg-dark)] p-6 rounded-lg">
              <div className="flex items-center space-x-3 pb-2 border-b border-[var(--zalama-border)]">
                <User className="h-5 w-5 text-[var(--zalama-blue)]" />
                <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Représentant principal</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-3">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="nom_representant"
                    value={formData.nom_representant}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                    placeholder="Nom du représentant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-3">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email_representant"
                    value={formData.email_representant}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                    placeholder="email@entreprise.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-3">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone_representant"
                    value={formData.telephone_representant}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                    placeholder="+224 123 456 789"
                  />
                </div>
              </div>
            </div>

            {/* Responsable RH */}
            <div className="space-y-6 bg-[var(--zalama-bg-dark)] p-6 rounded-lg">
              <div className="flex items-center space-x-3 pb-2 border-b border-[var(--zalama-border)]">
                <User className="h-5 w-5 text-[var(--zalama-blue)]" />
                <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Responsable RH</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-3">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="nom_rh"
                    value={formData.nom_rh}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                    placeholder="Nom du responsable RH"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-3">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email_rh"
                    value={formData.email_rh}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                    placeholder="rh@entreprise.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-3">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone_rh"
                    value={formData.telephone_rh}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                    placeholder="+224 123 456 789"
                  />
                </div>
              </div>
            </div>

            {/* Informations légales */}
            <div className="space-y-6 bg-[var(--zalama-bg-dark)] p-6 rounded-lg">
              <div className="flex items-center space-x-3 pb-2 border-b border-[var(--zalama-border)]">
                <Building className="h-5 w-5 text-[var(--zalama-blue)]" />
                <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Informations légales</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-2">
                    RCCM
                  </label>
                  <input
                    type="text"
                    name="rccm"
                    value={formData.rccm}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                    placeholder="Numéro RCCM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-2">
                    NIF
                  </label>
                  <input
                    type="text"
                    name="nif"
                    value={formData.nif}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                    placeholder="Numéro NIF"
                  />
                </div>
              </div>
            </div>

            {/* Autres informations */}
            <div className="space-y-6 bg-[var(--zalama-bg-dark)] p-6 rounded-lg">
              <div className="flex items-center space-x-3 pb-2 border-b border-[var(--zalama-border)]">
                <Users className="h-5 w-5 text-[var(--zalama-blue)]" />
                <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Autres informations</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-2">
                    Nombre d'employés
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--zalama-text-secondary)]" />
                    <input
                      type="number"
                      name="nombre_employes"
                      value={formData.nombre_employes}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full pl-12 pr-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--zalama-text)] mb-2">
                    Salaire net total
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--zalama-text-secondary)]" />
                    <input
                      type="number"
                      name="salaire_net_total"
                      value={formData.salaire_net_total}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-12 pr-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="actif"
                    checked={formData.actif}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-[var(--zalama-blue)] border-[var(--zalama-border)] rounded focus:ring-[var(--zalama-blue)]"
                  />
                  <label className="text-sm font-semibold text-[var(--zalama-text)]">
                    Partenaire actif
                  </label>
                </div>
              </div>
            </div>

            {/* Note sur les champs obligatoires */}
            <div className="flex items-start space-x-3 p-4 bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)]">
              <AlertCircle className="h-5 w-5 text-[var(--zalama-blue)] mt-0.5" />
              <div className="text-sm text-[var(--zalama-text-secondary)]">
                <p className="font-medium text-[var(--zalama-text)]">Champs obligatoires</p>
                <p>Les champs marqués d'un astérisque (*) sont obligatoires pour créer un partenaire.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-[var(--zalama-border)]">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)] transition-all font-medium"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-[var(--zalama-blue)] to-[var(--zalama-blue-dark)] text-white bg-blue-600 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50 font-medium"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Création en cours...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Créer le partenaire</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notification */}
      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
    </>
  );
}