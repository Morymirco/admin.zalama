"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    RefreshCw,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Remboursement {
  id: string;
  montant_total_remboursement: number;
  statut: 'EN_ATTENTE' | 'PAYE' | 'EN_RETARD' | 'ANNULE';
  methode_remboursement: string;
  date_creation: string;
  date_remboursement_effectue?: string;
  date_limite_remboursement: string;
  employe?: {
    nom: string;
    prenom: string;
    email: string;
  };
  transaction?: {
    numero_transaction: string;
    montant: number;
    date_transaction: string;
    methode_paiement: string;
  };
  demande_avance?: {
    motif: string;
    montant_demande: number;
  };
}

interface RemboursementsPartenaireProps {
  partnerId: string;
  partnerName: string;
}

export default function RemboursementsPartenaire({ partnerId, partnerName }: RemboursementsPartenaireProps) {
  const [remboursements, setRemboursements] = useState<Remboursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState<string>('all');

  // Charger les remboursements du partenaire
  const loadRemboursements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/remboursements?partenaire_id=${partnerId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des remboursements');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setRemboursements(result.data || []);
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des remboursements:', error);
      toast.error('Erreur lors du chargement des remboursements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (partnerId) {
      loadRemboursements();
    }
  }, [partnerId]);

  // Statistiques
  const totalRemboursements = remboursements.length;
  const montantTotal = remboursements.reduce((sum, r) => sum + r.montant_total_remboursement, 0);
  const remboursementsPayes = remboursements.filter(r => r.statut === 'PAYE');
  const remboursementsEnAttente = remboursements.filter(r => r.statut === 'EN_ATTENTE');
  const remboursementsEnRetard = remboursements.filter(r => r.statut === 'EN_RETARD');
  
  const montantPaye = remboursementsPayes.reduce((sum, r) => sum + r.montant_total_remboursement, 0);
  const montantEnAttente = remboursementsEnAttente.reduce((sum, r) => sum + r.montant_total_remboursement, 0);
  const montantEnRetard = remboursementsEnRetard.reduce((sum, r) => sum + r.montant_total_remboursement, 0);

  // Filtrer les remboursements
  const remboursementsFiltres = remboursements.filter(r => {
    if (filtreStatut === 'all') return true;
    return r.statut === filtreStatut;
  });

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'PAYE':
        return <CheckCircle className="w-4 h-4 text-[var(--zalama-success)]" />;
      case 'EN_ATTENTE':
        return <Clock className="w-4 h-4 text-[var(--zalama-warning)]" />;
      case 'EN_RETARD':
        return <AlertTriangle className="w-4 h-4 text-[var(--zalama-danger)]" />;
      case 'ANNULE':
        return <XCircle className="w-4 h-4 text-[var(--zalama-danger)]" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-[var(--zalama-text-secondary)]" />;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'PAYE':
        return 'text-[var(--zalama-success)] border-[var(--zalama-success)]';
      case 'EN_ATTENTE':
        return 'text-[var(--zalama-warning)] border-[var(--zalama-warning)]';
      case 'EN_RETARD':
        return 'text-[var(--zalama-danger)] border-[var(--zalama-danger)]';
      case 'ANNULE':
        return 'text-[var(--zalama-danger)] border-[var(--zalama-danger)]';
      default:
        return 'text-[var(--zalama-text-secondary)] border-[var(--zalama-border)]';
    }
  };

  const formatMontant = (montant: number | undefined | null) => {
    if (montant === undefined || montant === null || isNaN(montant)) {
      return '0 GNF';
    }
    return montant.toLocaleString('fr-FR') + ' GNF';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-[var(--zalama-bg-lighter)] rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-[var(--zalama-bg-lighter)] rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[var(--zalama-text)]">
            Remboursements - {partnerName}
          </h2>
          <p className="text-[var(--zalama-text-secondary)]">
            Ce que {partnerName} doit rembourser à ZaLaMa
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadRemboursements}
            className="border-[var(--zalama-border)] text-[var(--zalama-text)]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-[var(--zalama-border)] text-[var(--zalama-text)]"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--zalama-blue)]/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-[var(--zalama-blue)]" />
              </div>
              <div>
                <div className="text-lg font-bold text-[var(--zalama-text)]">
                  {formatMontant(montantTotal)}
                </div>
                <div className="text-sm text-[var(--zalama-text-secondary)]">
                  Total à rembourser
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--zalama-success)]/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-[var(--zalama-success)]" />
              </div>
              <div>
                <div className="text-lg font-bold text-[var(--zalama-success)]">
                  {formatMontant(montantPaye)}
                </div>
                <div className="text-sm text-[var(--zalama-text-secondary)]">
                  Déjà remboursé ({remboursementsPayes.length})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--zalama-warning)]/20 rounded-lg">
                <Clock className="w-5 h-5 text-[var(--zalama-warning)]" />
              </div>
              <div>
                <div className="text-lg font-bold text-[var(--zalama-warning)]">
                  {formatMontant(montantEnAttente)}
                </div>
                <div className="text-sm text-[var(--zalama-text-secondary)]">
                  En attente ({remboursementsEnAttente.length})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--zalama-danger)]/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-[var(--zalama-danger)]" />
              </div>
              <div>
                <div className="text-lg font-bold text-[var(--zalama-danger)]">
                  {formatMontant(montantEnRetard)}
                </div>
                <div className="text-sm text-[var(--zalama-text-secondary)]">
                  En retard ({remboursementsEnRetard.length})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        <Button
          variant={filtreStatut === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltreStatut('all')}
          className={filtreStatut === 'all' ? 'bg-[var(--zalama-blue)]' : 'border-[var(--zalama-border)]'}
        >
          Tous ({totalRemboursements})
        </Button>
        <Button
          variant={filtreStatut === 'EN_ATTENTE' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltreStatut('EN_ATTENTE')}
          className={filtreStatut === 'EN_ATTENTE' ? 'bg-[var(--zalama-warning)]' : 'border-[var(--zalama-border)]'}
        >
          En attente ({remboursementsEnAttente.length})
        </Button>
        <Button
          variant={filtreStatut === 'EN_RETARD' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltreStatut('EN_RETARD')}
          className={filtreStatut === 'EN_RETARD' ? 'bg-[var(--zalama-danger)]' : 'border-[var(--zalama-border)]'}
        >
          En retard ({remboursementsEnRetard.length})
        </Button>
        <Button
          variant={filtreStatut === 'PAYE' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltreStatut('PAYE')}
          className={filtreStatut === 'PAYE' ? 'bg-[var(--zalama-success)]' : 'border-[var(--zalama-border)]'}
        >
          Payés ({remboursementsPayes.length})
        </Button>
      </div>

      {/* Liste des remboursements */}
      <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--zalama-text)]">
            Liste des remboursements ({remboursementsFiltres.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {remboursementsFiltres.length > 0 ? (
            <div className="space-y-3">
              {remboursementsFiltres.map((remboursement) => (
                <div
                  key={remboursement.id}
                  className="flex items-center justify-between p-4 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] hover:bg-[var(--zalama-bg-light)] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(remboursement.statut)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--zalama-text)]">
                          {remboursement.employe?.prenom} {remboursement.employe?.nom}
                        </span>
                        <Badge variant="outline" className={getStatusColor(remboursement.statut)}>
                          {remboursement.statut}
                        </Badge>
                      </div>
                      <div className="text-sm text-[var(--zalama-text-secondary)] space-y-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3 h-3" />
                          <span>{remboursement.transaction?.numero_transaction}</span>
                          <span>•</span>
                          <span>{remboursement.methode_remboursement}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>Créé le {formatDate(remboursement.date_creation)}</span>
                          <span>•</span>
                          <span>Limite: {formatDate(remboursement.date_limite_remboursement)}</span>
                        </div>
                        {remboursement.demande_avance?.motif && (
                          <div className="text-xs text-[var(--zalama-text-secondary)]">
                            Motif: {remboursement.demande_avance.motif}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[var(--zalama-text)]">
                      {formatMontant(remboursement.montant_total_remboursement)}
                    </div>
                    {remboursement.transaction && (
                      <div className="text-sm text-[var(--zalama-text-secondary)]">
                        Base: {formatMontant(remboursement.transaction.montant)}
                      </div>
                    )}
                    {remboursement.date_remboursement_effectue && (
                      <div className="text-xs text-[var(--zalama-success)]">
                        Payé le {formatDate(remboursement.date_remboursement_effectue)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-[var(--zalama-text-secondary)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--zalama-text)] mb-2">
                Aucun remboursement
              </h3>
              <p className="text-[var(--zalama-text-secondary)]">
                {filtreStatut === 'all' 
                  ? "Ce partenaire n'a aucun remboursement en cours."
                  : `Aucun remboursement avec le statut "${filtreStatut}".`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 