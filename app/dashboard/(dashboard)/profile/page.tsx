"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
    Bell,
    Calendar,
    Camera,
    Crown,
    Edit,
    Key,
    Lock,
    Mail,
    MapPin,
    Phone,
    Save,
    Shield,
    User2,
    X
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface UserProfile {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  adresse?: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
  isAdmin: boolean;
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
}

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    adresse: ''
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email })
      });

      const result = await response.json();

      if (result.data) {
        setProfile(result.data);
        setFormData({
          nom: result.data.nom || '',
          prenom: result.data.prenom || '',
          telephone: result.data.telephone || '',
          adresse: result.data.adresse || ''
        });
      } else {
        toast.error('Erreur lors du chargement du profil');
      }

    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      if (profile?.isAdmin) {
        // Mettre à jour admin_users
        const { error } = await supabase
          .from('admin_users')
          .update({
            display_name: `${formData.prenom} ${formData.nom}`.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('email', user?.email);

        if (error) throw error;
      } else {
        // Mettre à jour employees
        const { error } = await supabase
          .from('employees')
          .update({
            nom: formData.nom,
            prenom: formData.prenom,
            telephone: formData.telephone,
            adresse: formData.adresse,
            updated_at: new Date().toISOString()
          })
          .eq('email', user?.email);

        if (error) throw error;
      }

      // Mettre à jour l'état local
      setProfile(prev => prev ? {
        ...prev,
        ...formData
      } : null);

      setEditing(false);
      toast.success('Profil mis à jour avec succès');

    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      nom: profile?.nom || '',
      prenom: profile?.prenom || '',
      telephone: profile?.telephone || '',
      adresse: profile?.adresse || ''
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="p-6 bg-[var(--zalama-bg-dark)] min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[var(--zalama-bg-lighter)] rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="h-96 bg-[var(--zalama-bg-lighter)] rounded border border-[var(--zalama-border)]"></div>
            </div>
            <div className="lg:col-span-2">
              <div className="h-96 bg-[var(--zalama-bg-lighter)] rounded border border-[var(--zalama-border)]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 bg-[var(--zalama-bg-dark)] min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--zalama-text)] mb-4">Profil non trouvé</h1>
          <p className="text-[var(--zalama-text-secondary)]">Impossible de charger les informations du profil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto bg-[var(--zalama-bg-dark)] min-h-screen">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--zalama-text)]">Profil Utilisateur</h1>
          <p className="text-[var(--zalama-text-secondary)]">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <Button 
              onClick={() => setEditing(true)}
              className="bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleCancelEdit}
                variant="outline"
                className="border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)]"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button 
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte de profil */}
        <div className="lg:col-span-1">
          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)] shadow-lg">
            <CardHeader className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--zalama-blue)] to-[var(--zalama-blue-accent)] flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User2 className="w-16 h-16" />
                  )}
                </div>
                {editing && (
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-[var(--zalama-blue)] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[var(--zalama-blue-accent)] transition-colors">
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>
              <CardTitle className="text-[var(--zalama-text)] text-xl">
                {profile.prenom} {profile.nom}
              </CardTitle>
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-[var(--zalama-success)] text-white">
                  {profile.role}
                </Badge>
                {profile.isAdmin && (
                  <Badge className="bg-[var(--zalama-blue)] text-white flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Admin
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-[var(--zalama-text-secondary)]">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{profile.email}</span>
              </div>
              {profile.telephone && (
                <div className="flex items-center gap-3 text-[var(--zalama-text-secondary)]">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{profile.telephone}</span>
                </div>
              )}
              {profile.adresse && (
                <div className="flex items-center gap-3 text-[var(--zalama-text-secondary)]">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.adresse}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-[var(--zalama-text-secondary)]">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations détaillées */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)] shadow-lg">
            <CardHeader>
              <CardTitle className="text-[var(--zalama-text)] flex items-center gap-2">
                <User2 className="w-5 h-5" />
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                    Prénom
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                      className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-md bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
                    />
                  ) : (
                    <p className="text-[var(--zalama-text-secondary)]">{profile.prenom || 'Non renseigné'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                    Nom
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-md bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
                    />
                  ) : (
                    <p className="text-[var(--zalama-text-secondary)]">{profile.nom || 'Non renseigné'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                    Téléphone
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-md bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
                    />
                  ) : (
                    <p className="text-[var(--zalama-text-secondary)]">{profile.telephone || 'Non renseigné'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                    Type de compte
                  </label>
                  <p className="text-[var(--zalama-text-secondary)]">
                    {profile.isAdmin ? 'Administrateur' : 'Employé'}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                  Adresse
                </label>
                {editing ? (
                  <textarea
                    value={formData.adresse}
                    onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-md bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
                  />
                ) : (
                  <p className="text-[var(--zalama-text-secondary)]">{profile.adresse || 'Non renseigné'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sécurité et préférences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)] shadow-lg">
              <CardHeader>
                <CardTitle className="text-[var(--zalama-text)] flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)]"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Changer le mot de passe
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)]"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Authentification à deux facteurs
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)] shadow-lg">
              <CardHeader>
                <CardTitle className="text-[var(--zalama-text)] flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Préférences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--zalama-text)] text-sm">Notifications</span>
                  <div className="w-12 h-6 bg-[var(--zalama-bg-lighter)] rounded-full relative">
                    <div className="w-5 h-5 bg-[var(--zalama-blue)] rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--zalama-text)] text-sm">Mode sombre</span>
                  <div className="w-12 h-6 bg-[var(--zalama-blue)] rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--zalama-text)] text-sm">Langue</span>
                  <span className="text-[var(--zalama-text-secondary)] text-sm">Français</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 