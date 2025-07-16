"use client";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, RefreshCw, XCircle } from 'lucide-react';

interface Remboursement {
  id: string;
  montant_total_remboursement: number;
  statut: 'EN_ATTENTE' | 'EFFECTUEE' | 'ANNULEE';
  methode_remboursement: string;
  date_creation: string;
  date_remboursement?: string;
  employe?: { nom: string; prenom: string };
  partenaire?: { nom: string };
}

interface RemboursementsSummaryProps {
  remboursements: Remboursement[];
  loading?: boolean;
}

export function RemboursementsSummary({ remboursements, loading = false }: RemboursementsSummaryProps) {
  if (loading) {
    return (
      <Card className="border-[var(--zalama-border)] bg-[var(--zalama-card)] shadow-lg">
        <CardHeader>
          <CardTitle className="text-[var(--zalama-text)]">Résumé des Remboursements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[var(--zalama-bg-lighter)] rounded w-3/4"></div>
            <div className="h-4 bg-[var(--zalama-bg-lighter)] rounded w-1/2"></div>
            <div className="h-4 bg-[var(--zalama-bg-lighter)] rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRemboursements = remboursements.length;
  const remboursementsEffectues = remboursements.filter(r => r.statut === 'EFFECTUEE').length;
  const remboursementsEnAttente = remboursements.filter(r => r.statut === 'EN_ATTENTE').length;
  const remboursementsAnnules = remboursements.filter(r => r.statut === 'ANNULEE').length;
  
  const montantTotal = remboursements
    .filter(r => r.statut === 'EFFECTUEE')
    .reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0);

  const montantEnAttente = remboursements
    .filter(r => r.statut === 'EN_ATTENTE')
    .reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0);

  const montantCeMois = remboursements
    .filter(r => {
      const remboursementDate = new Date(r.date_remboursement || r.date_creation);
      const now = new Date();
      return r.statut === 'EFFECTUEE' && 
             remboursementDate.getMonth() === now.getMonth() &&
             remboursementDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0);

  // Répartition par méthode de remboursement
  const repartitionMethode = remboursements.reduce((acc, remboursement) => {
    const methode = remboursement.methode_remboursement || 'Inconnue';
    acc[methode] = (acc[methode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Remboursements récents (5 derniers)
  const remboursementsRecents = remboursements
    .filter(r => r.statut === 'EFFECTUEE')
    .sort((a, b) => new Date(b.date_remboursement || b.date_creation).getTime() - new Date(a.date_remboursement || a.date_creation).getTime())
    .slice(0, 5);

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'EFFECTUEE':
        return <CheckCircle className="w-4 h-4 text-[var(--zalama-success)]" />;
      case 'EN_ATTENTE':
        return <Clock className="w-4 h-4 text-[var(--zalama-warning)]" />;
      case 'ANNULEE':
        return <XCircle className="w-4 h-4 text-[var(--zalama-danger)]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[var(--zalama-text-secondary)]" />;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'EFFECTUEE':
        return 'text-[var(--zalama-success)]';
      case 'EN_ATTENTE':
        return 'text-[var(--zalama-warning)]';
      case 'ANNULEE':
        return 'text-[var(--zalama-danger)]';
      default:
        return 'text-[var(--zalama-text-secondary)]';
    }
  };

  return (
    <Card className="border-[var(--zalama-border)] bg-[var(--zalama-card)] shadow-lg">
      <CardHeader>
        <CardTitle className="text-[var(--zalama-text)] flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Résumé des Remboursements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistiques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-[var(--zalama-bg-lighter)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--zalama-text)]">{totalRemboursements}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Total</div>
          </div>
          <div className="text-center p-3 bg-[var(--zalama-success)]/20 rounded-lg">
            <div className="text-2xl font-bold text-[var(--zalama-success)]">{remboursementsEffectues}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Effectués</div>
          </div>
          <div className="text-center p-3 bg-[var(--zalama-warning)]/20 rounded-lg">
            <div className="text-2xl font-bold text-[var(--zalama-warning)]">{remboursementsEnAttente}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">En attente</div>
          </div>
          <div className="text-center p-3 bg-[var(--zalama-danger)]/20 rounded-lg">
            <div className="text-2xl font-bold text-[var(--zalama-danger)]">{remboursementsAnnules}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Annulés</div>
          </div>
        </div>

        {/* Montants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--zalama-success)]/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[var(--zalama-text)] font-medium">Total effectué</span>
              <div className="text-xl font-bold text-[var(--zalama-success)]">
                {montantTotal.toLocaleString('fr-FR')} GNF
              </div>
            </div>
          </div>
          <div className="p-4 bg-[var(--zalama-warning)]/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[var(--zalama-text)] font-medium">En attente</span>
              <div className="text-xl font-bold text-[var(--zalama-warning)]">
                {montantEnAttente.toLocaleString('fr-FR')} GNF
              </div>
            </div>
          </div>
          <div className="p-4 bg-[var(--zalama-blue)]/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[var(--zalama-text)] font-medium">Ce mois</span>
              <div className="text-xl font-bold text-[var(--zalama-blue)]">
                {montantCeMois.toLocaleString('fr-FR')} GNF
              </div>
            </div>
          </div>
        </div>

        {/* Répartition par méthode de remboursement */}
        <div>
          <h4 className="text-sm font-medium text-[var(--zalama-text)] mb-3">Répartition par méthode</h4>
          <div className="space-y-2">
            {Object.entries(repartitionMethode).map(([methode, count]) => (
              <div key={methode} className="flex items-center justify-between">
                <span className="text-sm text-[var(--zalama-text-secondary)]">{methode}</span>
                <Badge variant="outline" className="border-[var(--zalama-border)] text-[var(--zalama-text)]">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Remboursements récents */}
        <div>
          <h4 className="text-sm font-medium text-[var(--zalama-text)] mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Remboursements récents
          </h4>
          <div className="space-y-2">
            {remboursementsRecents.length > 0 ? (
              remboursementsRecents.map((remboursement) => (
                <div key={remboursement.id} className="flex items-center justify-between p-2 bg-[var(--zalama-bg-lighter)] rounded">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(remboursement.statut)}
                    <div>
                      <div className="text-sm font-medium text-[var(--zalama-text)]">
                        {remboursement.employe?.prenom} {remboursement.employe?.nom}
                      </div>
                      <div className="text-xs text-[var(--zalama-text-secondary)]">
                        {remboursement.partenaire?.nom} - {remboursement.methode_remboursement}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[var(--zalama-success)]">
                      {remboursement.montant_total_remboursement.toLocaleString('fr-FR')} GNF
                    </div>
                    <div className="text-xs text-[var(--zalama-text-secondary)]">
                      {new Date(remboursement.date_remboursement || remboursement.date_creation).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-[var(--zalama-text-secondary)]">
                Aucun remboursement récent
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 