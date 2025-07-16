'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import reimbursementService from '@/services/reimbursementService';
import { HistoriqueRemboursement, Remboursement } from '@/types/reimbursement';
import {
    AlertTriangle,
    ArrowLeft,
    Building,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    FileText,
    History,
    User
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function RemboursementDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const remboursementId = params.id as string;
  
  const [remboursement, setRemboursement] = useState<Remboursement | null>(null);
  const [historique, setHistorique] = useState<HistoriqueRemboursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLengoModal, setShowLengoModal] = useState(false);

  useEffect(() => {
    if (remboursementId) {
      loadRemboursementDetails();
    }
  }, [remboursementId]);

  const loadRemboursementDetails = async () => {
    try {
      setLoading(true);
      const [remboursementData, historiqueData] = await Promise.all([
        reimbursementService.getById(remboursementId),
        reimbursementService.getHistorique(remboursementId)
      ]);

      setRemboursement(remboursementData);
      setHistorique(historiqueData);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      toast.error('Erreur lors du chargement des détails');
      router.push('/dashboard/remboursements');
    } finally {
      setLoading(false);
    }
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'EN_ATTENTE': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      'PAYE': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      'EN_RETARD': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
      'ANNULE': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['EN_ATTENTE'];
    const Icon = config.icon;

    return (
      <Badge className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="h-4 w-4" />
        {status}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const methodConfig = {
      'VIREMENT_BANCAIRE': 'bg-blue-100 text-blue-800 border-blue-200',
      'MOBILE_MONEY': 'bg-orange-100 text-orange-800 border-orange-200',
      'ESPECES': 'bg-green-100 text-green-800 border-green-200',
      'CHEQUE': 'bg-purple-100 text-purple-800 border-purple-200',
      'PRELEVEMENT_SALAIRE': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'COMPENSATION_AVANCE': 'bg-pink-100 text-pink-800 border-pink-200'
    };

    return (
      <Badge className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${methodConfig[method as keyof typeof methodConfig] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {method.replace('_', ' ')}
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const actionConfig = {
      'CREATION': { color: 'bg-blue-100 text-blue-800', icon: FileText },
      'PAIEMENT': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'MODIFICATION': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'ANNULEMENT': { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    };

    const config = actionConfig[action as keyof typeof actionConfig] || actionConfig['MODIFICATION'];
    const Icon = config.icon;

    return (
      <Badge className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {action}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!remboursement) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Remboursement non trouvé</p>
        <Button onClick={() => router.push('/dashboard/remboursements')} className="mt-4">
          Retour aux remboursements
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/remboursements')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Détails du Remboursement</h1>
            <p className="text-muted-foreground">
              ID: {remboursement.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {remboursement.statut === 'EN_ATTENTE' && (
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Effectuer le Paiement
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statut et montants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Informations Financières
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Statut</span>
                {getStatusBadge(remboursement.statut)}
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Montant Transaction</p>
                  <p className="text-lg font-semibold">
                    {formatMontant(remboursement.montant_transaction)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Frais de Service</p>
                  <p className="text-lg font-semibold">
                    {formatMontant(remboursement.frais_service)}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground">Montant Total à Rembourser</p>
                <p className="text-2xl font-bold text-primary">
                  {formatMontant(remboursement.montant_total_remboursement)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informations sur l'employé et le partenaire */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Employé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium">
                    {remboursement.employe?.nom} {remboursement.employe?.prenom}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{remboursement.employe?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{remboursement.employe?.telephone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Poste</p>
                  <p className="font-medium">{remboursement.employe?.poste}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Partenaire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nom de l'entreprise</p>
                  <p className="font-medium">{remboursement.partenaire?.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{remboursement.partenaire?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{remboursement.partenaire?.telephone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">{remboursement.partenaire?.adresse}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informations sur la transaction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Transaction Originale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID Transaction</p>
                  <p className="font-medium">{remboursement.transaction_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Méthode de Paiement</p>
                  <div className="mt-1">
                    {getMethodBadge(remboursement.methode_remboursement)}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date de Transaction</p>
                <p className="font-medium">{formatDate(remboursement.date_transaction)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar avec dates et historique */}
        <div className="space-y-6">
          {/* Dates importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dates Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Date de Création</p>
                <p className="font-medium">{formatDate(remboursement.date_creation)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date Limite</p>
                <p className="font-medium">{formatDate(remboursement.date_limite_remboursement)}</p>
                {remboursement.jours_retard && remboursement.jours_retard > 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    {remboursement.jours_retard} jours de retard
                  </p>
                )}
              </div>
              {remboursement.date_paiement && (
                <div>
                  <p className="text-sm text-muted-foreground">Date de Paiement</p>
                  <p className="font-medium">{formatDate(remboursement.date_paiement)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historique */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historique.map((entry, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getActionBadge(entry.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.date_action)}
                      </p>
                      {entry.utilisateur && (
                        <p className="text-xs text-muted-foreground">
                          par {entry.utilisateur}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 