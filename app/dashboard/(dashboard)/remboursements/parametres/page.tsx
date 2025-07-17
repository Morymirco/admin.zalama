'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertTriangle,
    Bell,
    CheckCircle,
    Clock,
    DollarSign,
    Save,
    Settings
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ParametresRemboursement {
  delai_remboursement_jours: number;
  frais_service_pourcentage: number;
  montant_minimum_remboursement: number;
  montant_maximum_remboursement: number;
  notifications_actives: boolean;
  notification_avant_echeance_jours: number;
  notification_retard_jours: number;
  methodes_remboursement_autorisees: string[];
  auto_creation_remboursement: boolean;
  validation_manuelle_requise: boolean;
  message_defaut_remboursement: string;
}

export default function ParametresRemboursementsPage() {
  const [parametres, setParametres] = useState<ParametresRemboursement>({
    delai_remboursement_jours: 30,
    frais_service_pourcentage: 5,
    montant_minimum_remboursement: 50000,
    montant_maximum_remboursement: 5000000,
    notifications_actives: true,
    notification_avant_echeance_jours: 7,
    notification_retard_jours: 1,
    methodes_remboursement_autorisees: [
      'VIREMENT_BANCAIRE',
      'MOBILE_MONEY',
      'ESPECES',
      'CHEQUE'
    ],
    auto_creation_remboursement: true,
    validation_manuelle_requise: false,
    message_defaut_remboursement: 'Remboursement de l\'avance de salaire'
  });

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadParametres();
  }, []);

  const loadParametres = async () => {
    try {
      // TODO: Implémenter l'appel API pour charger les paramètres
      // const data = await reimbursementService.getParametres();
      // setParametres(data);
      toast.success('Paramètres chargés');
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    }
  };

  const handleSaveParametres = async () => {
    try {
      setLoading(true);
      // TODO: Implémenter l'appel API pour sauvegarder les paramètres
      // await reimbursementService.updateParametres(parametres);
      
      toast.success('Paramètres sauvegardés avec succès');
      setHasChanges(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleParametreChange = (key: keyof ParametresRemboursement, value: any) => {
    setParametres(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleMethodeToggle = (methode: string) => {
    const nouvellesMethodes = parametres.methodes_remboursement_autorisees.includes(methode)
      ? parametres.methodes_remboursement_autorisees.filter(m => m !== methode)
      : [...parametres.methodes_remboursement_autorisees, methode];
    
    handleParametreChange('methodes_remboursement_autorisees', nouvellesMethodes);
  };

  const methodesDisponibles = [
    { value: 'VIREMENT_BANCAIRE', label: 'Virement Bancaire' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money' },
    { value: 'ESPECES', label: 'Espèces' },
    { value: 'CHEQUE', label: 'Chèque' },
    { value: 'PRELEVEMENT_SALAIRE', label: 'Prélèvement sur Salaire' },
    { value: 'COMPENSATION_AVANCE', label: 'Compensation Avance' }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres de Remboursements</h1>
          <p className="text-muted-foreground">
            Configuration des règles et paramètres de remboursements
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={() => window.location.reload()}>
              Annuler
            </Button>
          )}
          <Button 
            onClick={handleSaveParametres} 
            disabled={!hasChanges || loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Paramètres généraux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres Généraux
            </CardTitle>
            <CardDescription>
              Configuration des délais et montants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="delai">Délai de remboursement (jours)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="delai"
                  type="number"
                  value={parametres.delai_remboursement_jours}
                  onChange={(e) => handleParametreChange('delai_remboursement_jours', parseInt(e.target.value))}
                  min="1"
                  max="365"
                />
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nombre de jours accordés pour effectuer le remboursement
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="frais">Frais de service (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="frais"
                  type="number"
                  value={parametres.frais_service_pourcentage}
                  onChange={(e) => handleParametreChange('frais_service_pourcentage', parseFloat(e.target.value))}
                  min="0"
                  max="20"
                  step="0.1"
                />
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Pourcentage de frais appliqué sur chaque remboursement
              </p>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="min">Montant minimum (GNF)</Label>
                <Input
                  id="min"
                  type="number"
                  value={parametres.montant_minimum_remboursement}
                  onChange={(e) => handleParametreChange('montant_minimum_remboursement', parseInt(e.target.value))}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Montant maximum (GNF)</Label>
                <Input
                  id="max"
                  type="number"
                  value={parametres.montant_maximum_remboursement}
                  onChange={(e) => handleParametreChange('montant_maximum_remboursement', parseInt(e.target.value))}
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configuration des alertes et notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Activer les notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Envoyer des notifications automatiques
                </p>
              </div>
              <Switch
                checked={parametres.notifications_actives}
                onCheckedChange={(checked) => handleParametreChange('notifications_actives', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="notif-avant">Notification avant échéance (jours)</Label>
              <Input
                id="notif-avant"
                type="number"
                value={parametres.notification_avant_echeance_jours}
                onChange={(e) => handleParametreChange('notification_avant_echeance_jours', parseInt(e.target.value))}
                min="1"
                max="30"
                disabled={!parametres.notifications_actives}
              />
              <p className="text-sm text-muted-foreground">
                Nombre de jours avant l'échéance pour envoyer un rappel
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notif-retard">Notification de retard (jours)</Label>
              <Input
                id="notif-retard"
                type="number"
                value={parametres.notification_retard_jours}
                onChange={(e) => handleParametreChange('notification_retard_jours', parseInt(e.target.value))}
                min="1"
                max="7"
                disabled={!parametres.notifications_actives}
              />
              <p className="text-sm text-muted-foreground">
                Nombre de jours de retard avant d'envoyer une alerte
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Méthodes de remboursement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Méthodes de Remboursement
            </CardTitle>
            <CardDescription>
              Méthodes autorisées pour les remboursements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {methodesDisponibles.map((methode) => (
              <div key={methode.value} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{methode.label}</Label>
                </div>
                <Switch
                  checked={parametres.methodes_remboursement_autorisees.includes(methode.value)}
                  onCheckedChange={() => handleMethodeToggle(methode.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Automatisation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Automatisation
            </CardTitle>
            <CardDescription>
              Configuration des processus automatiques
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Création automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Créer automatiquement un remboursement lors d'une transaction réussie
                </p>
              </div>
              <Switch
                checked={parametres.auto_creation_remboursement}
                onCheckedChange={(checked) => handleParametreChange('auto_creation_remboursement', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Validation manuelle requise</Label>
                <p className="text-sm text-muted-foreground">
                  Nécessiter une validation manuelle pour les remboursements
                </p>
              </div>
              <Switch
                checked={parametres.validation_manuelle_requise}
                onCheckedChange={(checked) => handleParametreChange('validation_manuelle_requise', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message par défaut */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Message par Défaut
          </CardTitle>
          <CardDescription>
            Message automatique ajouté aux remboursements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="message">Message de remboursement</Label>
            <Textarea
              id="message"
              value={parametres.message_defaut_remboursement}
              onChange={(e) => handleParametreChange('message_defaut_remboursement', e.target.value)}
              placeholder="Message par défaut pour les remboursements..."
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Ce message sera automatiquement ajouté à tous les remboursements créés
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Résumé des paramètres */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé des Paramètres</CardTitle>
          <CardDescription>
            Aperçu de la configuration actuelle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Délai de remboursement</h4>
              <p className="text-2xl font-bold">{parametres.delai_remboursement_jours} jours</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Frais de service</h4>
              <p className="text-2xl font-bold">{parametres.frais_service_pourcentage}%</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Méthodes autorisées</h4>
              <p className="text-2xl font-bold">{parametres.methodes_remboursement_autorisees.length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Montant minimum</h4>
              <p className="text-2xl font-bold">{parametres.montant_minimum_remboursement.toLocaleString()} GNF</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Montant maximum</h4>
              <p className="text-2xl font-bold">{parametres.montant_maximum_remboursement.toLocaleString()} GNF</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Notifications</h4>
              <p className="text-2xl font-bold">{parametres.notifications_actives ? 'Activées' : 'Désactivées'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 