"use client";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, RefreshCw, XCircle } from 'lucide-react';

interface Remboursement {
  id: string;
  montant_total_remboursement: number;
  statut: 'EN_ATTENTE' | 'PAYE' | 'EN_RETARD' | 'ANNULE';
  methode_remboursement: string;
  date_creation: string;
  date_remboursement?: string;
  employe?: { nom: string; prenom: string };
  partenaire?: { 
    id: string;
    nom: string; 
    email?: string;
    email_rh?: string;
    telephone?: string;
    secteur?: string;
    type?: string;
  };
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
  const remboursementsEffectues = remboursements.filter(r => r.statut === 'PAYE').length;
  const remboursementsEnAttente = remboursements.filter(r => r.statut === 'EN_ATTENTE').length;
  const remboursementsEnRetard = remboursements.filter(r => r.statut === 'EN_RETARD').length;
  const remboursementsAnnules = remboursements.filter(r => r.statut === 'ANNULE').length;
  
  const montantTotal = remboursements
    .filter(r => r.statut === 'PAYE')
    .reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0);

  const montantEnAttente = remboursements
    .filter(r => r.statut === 'EN_ATTENTE')
    .reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0);

  const montantEnRetard = remboursements
    .filter(r => r.statut === 'EN_RETARD')
    .reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0);

  const montantCeMois = remboursements
    .filter(r => {
      const remboursementDate = new Date(r.date_remboursement || r.date_creation);
      const now = new Date();
      return r.statut === 'PAYE' && 
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

  // Statistiques par partenaire
  const statistiquesPartenaires = remboursements.reduce((acc, remboursement) => {
    const partenaireId = remboursement.partenaire?.id || 'inconnu';
    const partenaireNom = remboursement.partenaire?.nom || 'Partenaire inconnu';
    const secteur = remboursement.partenaire?.secteur || 'N/A';
    const type = remboursement.partenaire?.type || 'N/A';
    
    if (!acc[partenaireId]) {
      acc[partenaireId] = {
        id: partenaireId,
        nom: partenaireNom,
        secteur,
        type,
        email: remboursement.partenaire?.email,
        email_rh: remboursement.partenaire?.email_rh,
        telephone: remboursement.partenaire?.telephone,
        totalRemboursements: 0,
        montantTotal: 0,
        remboursementsEffectues: 0,
        remboursementsEnAttente: 0,
        remboursementsEnRetard: 0,
        remboursementsAnnules: 0,
        montantEffectue: 0,
        montantEnAttente: 0,
        montantEnRetard: 0
      };
    }
    
    acc[partenaireId].totalRemboursements++;
    acc[partenaireId].montantTotal += remboursement.montant_total_remboursement || 0;
    
    if (remboursement.statut === 'PAYE') {
      acc[partenaireId].remboursementsEffectues++;
      acc[partenaireId].montantEffectue += remboursement.montant_total_remboursement || 0;
    } else if (remboursement.statut === 'EN_ATTENTE') {
      acc[partenaireId].remboursementsEnAttente++;
      acc[partenaireId].montantEnAttente += remboursement.montant_total_remboursement || 0;
    } else if (remboursement.statut === 'EN_RETARD') {
      acc[partenaireId].remboursementsEnRetard++;
      acc[partenaireId].montantEnRetard += remboursement.montant_total_remboursement || 0;
    } else if (remboursement.statut === 'ANNULE') {
      acc[partenaireId].remboursementsAnnules++;
    }
    
    return acc;
  }, {} as Record<string, {
    id: string;
    nom: string;
    secteur: string;
    type: string;
    email?: string;
    email_rh?: string;
    telephone?: string;
    totalRemboursements: number;
    montantTotal: number;
    remboursementsEffectues: number;
    remboursementsEnAttente: number;
    remboursementsEnRetard: number;
    remboursementsAnnules: number;
    montantEffectue: number;
    montantEnAttente: number;
    montantEnRetard: number;
  }>);

  // Top 5 partenaires par montant
  const topPartenaires = Object.values(statistiquesPartenaires)
    .sort((a, b) => b.montantTotal - a.montantTotal)
    .slice(0, 5);

  // Remboursements récents (5 derniers)
  const remboursementsRecents = remboursements
    .filter(r => r.statut === 'PAYE')
    .sort((a, b) => new Date(b.date_remboursement || b.date_creation).getTime() - new Date(a.date_remboursement || a.date_creation).getTime())
    .slice(0, 5);

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'PAYE':
        return <CheckCircle className="w-4 h-4 text-[var(--zalama-success)]" />;
      case 'EN_ATTENTE':
        return <Clock className="w-4 h-4 text-[var(--zalama-warning)]" />;
      case 'EN_RETARD':
        return <AlertCircle className="w-4 h-4 text-[var(--zalama-danger)]" />;
      case 'ANNULE':
        return <XCircle className="w-4 h-4 text-[var(--zalama-danger)]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[var(--zalama-text-secondary)]" />;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'PAYE':
        return 'text-[var(--zalama-success)]';
      case 'EN_ATTENTE':
        return 'text-[var(--zalama-warning)]';
      case 'EN_RETARD':
        return 'text-[var(--zalama-danger)]';
      case 'ANNULE':
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-[var(--zalama-bg-lighter)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--zalama-text)]">{totalRemboursements}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Total</div>
          </div>
          <div className="text-center p-3 bg-[var(--zalama-success)]/20 rounded-lg">
            <div className="text-2xl font-bold text-[var(--zalama-success)]">{remboursementsEffectues}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Payés</div>
          </div>
          <div className="text-center p-3 bg-[var(--zalama-warning)]/20 rounded-lg">
            <div className="text-2xl font-bold text-[var(--zalama-warning)]">{remboursementsEnAttente}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">En attente</div>
          </div>
          <div className="text-center p-3 bg-[var(--zalama-danger)]/20 rounded-lg">
            <div className="text-2xl font-bold text-[var(--zalama-danger)]">{remboursementsEnRetard}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">En retard</div>
          </div>
          <div className="text-center p-3 bg-[var(--zalama-danger)]/20 rounded-lg">
            <div className="text-2xl font-bold text-[var(--zalama-danger)]">{remboursementsAnnules}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Annulés</div>
          </div>
        </div>

        {/* Montants */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[var(--zalama-success)]/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[var(--zalama-text)] font-medium">Total payé</span>
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
          <div className="p-4 bg-[var(--zalama-danger)]/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[var(--zalama-text)] font-medium">En retard</span>
              <div className="text-xl font-bold text-[var(--zalama-danger)]">
                {montantEnRetard.toLocaleString('fr-FR')} GNF
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

        {/* Statistiques par partenaire */}
        <div>
          <h4 className="text-sm font-medium text-[var(--zalama-text)] mb-3">Statistiques par partenaire</h4>
          <div className="space-y-2">
            {Object.values(statistiquesPartenaires).map((partenaire) => (
              <div key={partenaire.id} className="flex items-center justify-between">
                <span className="text-sm text-[var(--zalama-text-secondary)]">{partenaire.nom}</span>
                <Badge variant="outline" className="border-[var(--zalama-border)] text-[var(--zalama-text)]">
                  {partenaire.totalRemboursements}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Détails des partenaires avec métriques */}
        <div>
          <h4 className="text-sm font-medium text-[var(--zalama-text)] mb-3">Détails des partenaires</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.values(statistiquesPartenaires).map((partenaire) => {
              const tauxReussite = partenaire.totalRemboursements > 0 
                ? ((partenaire.remboursementsEffectues / partenaire.totalRemboursements) * 100).toFixed(1)
                : '0';
              
              return (
                <div key={partenaire.id} className="p-3 bg-[var(--zalama-bg-lighter)] rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[var(--zalama-text)]">{partenaire.nom}</div>
                      <div className="text-xs text-[var(--zalama-text-secondary)] flex items-center gap-2">
                        <span>{partenaire.secteur}</span>
                        {partenaire.type && (
                          <>
                            <span>•</span>
                            <span>{partenaire.type}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[var(--zalama-blue)]">
                        {partenaire.montantTotal.toLocaleString('fr-FR')} GNF
                      </div>
                      <div className="text-xs text-[var(--zalama-text-secondary)]">
                        Taux: {tauxReussite}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center p-1 bg-[var(--zalama-success)]/20 rounded">
                      <div className="font-bold text-[var(--zalama-success)]">{partenaire.remboursementsEffectues}</div>
                      <div className="text-[var(--zalama-text-secondary)]">Payés</div>
                    </div>
                    <div className="text-center p-1 bg-[var(--zalama-warning)]/20 rounded">
                      <div className="font-bold text-[var(--zalama-warning)]">{partenaire.remboursementsEnAttente}</div>
                      <div className="text-[var(--zalama-text-secondary)]">En attente</div>
                    </div>
                    <div className="text-center p-1 bg-[var(--zalama-danger)]/20 rounded">
                      <div className="font-bold text-[var(--zalama-danger)]">{partenaire.remboursementsEnRetard}</div>
                      <div className="text-[var(--zalama-text-secondary)]">En retard</div>
                    </div>
                    <div className="text-center p-1 bg-[var(--zalama-danger)]/20 rounded">
                      <div className="font-bold text-[var(--zalama-danger)]">{partenaire.remboursementsAnnules}</div>
                      <div className="text-[var(--zalama-text-secondary)]">Annulés</div>
                    </div>
                  </div>
                  
                  {(partenaire.email_rh || partenaire.telephone) && (
                    <div className="flex gap-2 text-xs text-[var(--zalama-text-secondary)]">
                      {partenaire.email_rh && (
                        <span className="truncate">📧 {partenaire.email_rh}</span>
                      )}
                      {partenaire.telephone && (
                        <span>📞 {partenaire.telephone}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 partenaires par montant */}
        <div>
          <h4 className="text-sm font-medium text-[var(--zalama-text)] mb-3">Top 5 partenaires par montant</h4>
          <div className="space-y-3">
            {topPartenaires.map((partenaire, index) => {
              const tauxReussite = partenaire.totalRemboursements > 0 
                ? ((partenaire.remboursementsEffectues / partenaire.totalRemboursements) * 100).toFixed(1)
                : '0';
              
              return (
                <div key={partenaire.id} className="flex items-center justify-between p-2 bg-[var(--zalama-bg-lighter)] rounded">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-[var(--zalama-blue)] text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--zalama-text)]">{partenaire.nom}</div>
                      <div className="text-xs text-[var(--zalama-text-secondary)] flex items-center gap-2">
                        <span>{partenaire.totalRemboursements} remboursements</span>
                        <span>•</span>
                        <span>Taux: {tauxReussite}%</span>
                        {partenaire.secteur && (
                          <>
                            <span>•</span>
                            <span>{partenaire.secteur}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[var(--zalama-success)]">
                      {partenaire.montantTotal.toLocaleString('fr-FR')} GNF
                    </div>
                    <div className="text-xs text-[var(--zalama-text-secondary)]">
                      {partenaire.remboursementsEffectues}✅ {partenaire.remboursementsEnAttente}⏳ {partenaire.remboursementsEnRetard}🔴 {partenaire.remboursementsAnnules}❌
                    </div>
                  </div>
                </div>
              );
            })}
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
                      {remboursement.partenaire?.secteur && (
                        <div className="text-xs text-[var(--zalama-text-secondary)] flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-[var(--zalama-blue)] rounded-full"></span>
                          {remboursement.partenaire.secteur} 
                          {remboursement.partenaire.type && ` • ${remboursement.partenaire.type}`}
                        </div>
                      )}
                      {remboursement.partenaire?.email_rh && (
                        <div className="text-xs text-[var(--zalama-text-secondary)] truncate max-w-40">
                          📧 {remboursement.partenaire.email_rh}
                        </div>
                      )}
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