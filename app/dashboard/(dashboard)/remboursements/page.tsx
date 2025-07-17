'use client';

import CreateReimbursementModal from '@/components/modals/CreateReimbursementModal';
import PaymentModal from '@/components/modals/PaymentModal';
import ReimbursementDetailsModal from '@/components/modals/ReimbursementDetailsModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import reimbursementService from '@/services/reimbursementService';
import {
  FiltresRemboursement,
  Remboursement,
  StatistiquesRemboursementGlobales,
  TransactionSansRemboursement
} from '@/types/reimbursement';
import {
  AlertTriangle,
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileText,
  Filter,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function RemboursementsPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  
  const [remboursements, setRemboursements] = useState<Remboursement[]>([]);
  const [transactionsSansRemboursement, setTransactionsSansRemboursement] = useState<TransactionSansRemboursement[]>([]);
  const [statistiques, setStatistiques] = useState<StatistiquesRemboursementGlobales | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('remboursements');
  
  // Filtres
  const [filtres, setFiltres] = useState<FiltresRemboursement>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [monthFilter, setMonthFilter] = useState<string>('tous');
  const [partnerFilter, setPartnerFilter] = useState<string>('tous');
  const [partners, setPartners] = useState<Array<{id: string, nom: string}>>([]);

  // États pour les modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRemboursement, setSelectedRemboursement] = useState<Remboursement | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionSansRemboursement | null>(null);

  useEffect(() => {
    // Vérifier si on vient d'un paiement réussi
    if (status === 'success') {
      setShowSuccessPage(true);
      toast.success('Paiement effectué avec succès !');
      
      // Recharger les données pour avoir les statuts à jour
      loadData();
    } else if (status === 'cancelled') {
      toast.error('Paiement annulé ou échoué');
      loadData();
    } else if (status === 'pending') {
      toast.info('Paiement en cours de traitement');
      loadData();
    } else if (status === 'error') {
      const error = searchParams.get('error');
      if (error === 'remboursement_not_found') {
        toast.error('Remboursement non trouvé');
      } else if (error === 'update_failed') {
        toast.error('Erreur lors de la mise à jour du remboursement');
      } else if (error === 'server_error') {
        toast.error('Erreur serveur');
      }
      loadData();
    }
  }, [status, searchParams]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [remboursementsData, statistiquesData, transactionsData] = await Promise.all([
        reimbursementService.getAll(),
        reimbursementService.getStatistiquesGlobales(),
        reimbursementService.getTransactionsSansRemboursement()
      ]);

      setRemboursements(remboursementsData);
      setStatistiques(statistiquesData);
      setTransactionsSansRemboursement(transactionsData.transactions);
      
      // Extraire la liste des partenaires uniques
      const partenairesUniques = Array.from(
        new Map(
          remboursementsData
            .filter(r => r.partenaire)
            .map(r => [r.partenaire!.id, r.partenaire!])
        ).values()
      ).map(p => ({ id: p.id, nom: p.nom }));
      
      setPartners(partenairesUniques);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const formatMontant = (montant: number) => {
    if (isNaN(montant) || montant === null || montant === undefined) {
      return '0 FCFA';
    }
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Non définie';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Date invalide';
    return dateObj.toLocaleDateString('fr-FR');
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
      <Badge className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getMethodBadge = (method: string | undefined) => {
    if (!method) {
      return (
        <Badge className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
          Non défini
        </Badge>
      );
    }

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

  const filteredRemboursements = remboursements.filter(remboursement => {
    const matchesSearch = searchTerm === '' || 
      remboursement.employe?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      remboursement.employe?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      remboursement.partenaire?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'tous' || remboursement.statut === statusFilter;
    
    const matchesPartner = partnerFilter === 'tous' || remboursement.partenaire_id === partnerFilter;
    
    const matchesMonth = monthFilter === 'tous' || (() => {
      if (!remboursement.date_creation) return false;
      const date = new Date(remboursement.date_creation);
      const remboursementMois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return remboursementMois === monthFilter;
    })();
    
    return matchesSearch && matchesStatus && matchesPartner && matchesMonth;
  });

  const handleEffectuerPaiement = (remboursement: Remboursement) => {
    setSelectedRemboursement(remboursement);
    setPaymentModalOpen(true);
  };

  const handleCreerRemboursement = (transaction: TransactionSansRemboursement) => {
    setSelectedTransaction(transaction);
    setCreateModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    loadData();
  };

  const handleCreateSuccess = () => {
    loadData();
  };

  const handleVoirDetails = (remboursement: Remboursement) => {
    setSelectedRemboursement(remboursement);
    setDetailsModalOpen(true);
  };

  // Fonction pour obtenir les 12 derniers mois
  const getMoisDisponibles = () => {
    const mois = [];
    const maintenant = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      mois.push({ value, label });
    }
    
    return mois;
  };

  // Fonction pour payer tous les remboursements d'un partenaire
  const handlePayerParPartenaire = async (partenaireId: string) => {
    const remboursementsPartenaire = remboursements.filter(
      r => r.partenaire_id === partenaireId && r.statut === 'EN_ATTENTE'
    );
    
    if (remboursementsPartenaire.length === 0) {
      toast.warning('Aucun remboursement en attente pour ce partenaire');
      return;
    }
    
    const montantTotal = remboursementsPartenaire.reduce(
      (sum, r) => sum + r.montant_total_remboursement, 0
    );
    
    const partenaire = partners.find(p => p.id === partenaireId);
    
    if (confirm(`Payer tous les remboursements en attente de ${partenaire?.nom} ?\n\nMontant total: ${formatMontant(montantTotal)}\nNombre de remboursements: ${remboursementsPartenaire.length}`)) {
      try {
        const result = await reimbursementService.effectuerPaiementParPartenaire(
          partenaireId,
          'VIREMENT_BANCAIRE',
          `BULK-${Date.now()}`,
          `Paiement en lot pour ${partenaire?.nom}`
        );
        
        if (result.success) {
          toast.success(result.message);
          // Recharger les données
          loadData();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error('Erreur lors du paiement en lot:', error);
        toast.error('Erreur lors du paiement en lot');
      }
    }
  };

  // Fonction pour payer tous les remboursements en attente
  const handlePayerTout = async () => {
    const remboursementsEnAttente = remboursements.filter(r => r.statut === 'EN_ATTENTE');
    
    if (remboursementsEnAttente.length === 0) {
      toast.warning('Aucun remboursement en attente');
      return;
    }
    
    const montantTotal = remboursementsEnAttente.reduce(
      (sum, r) => sum + r.montant_total_remboursement, 0
    );
    
    if (confirm(`Payer tous les remboursements en attente ?\n\nMontant total: ${formatMontant(montantTotal)}\nNombre de remboursements: ${remboursementsEnAttente.length}`)) {
      try {
        const remboursementIds = remboursementsEnAttente.map(r => r.id);
        const result = await reimbursementService.effectuerPaiementEnLot(
          remboursementIds,
          'VIREMENT_BANCAIRE',
          `BULK-ALL-${Date.now()}`,
          'Paiement en lot global'
        );
        
        if (result.success) {
          toast.success(result.message);
          // Recharger les données
          loadData();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error('Erreur lors du paiement en lot:', error);
        toast.error('Erreur lors du paiement en lot');
      }
    }
  };

  // Page de succès
  if (showSuccessPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Paiement Réussi !
            </h1>
            <p className="text-gray-600">
              Votre remboursement a été traité avec succès via Lengo Pay.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                Prochaines étapes
              </h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Vous recevrez une confirmation par SMS</li>
                <li>• Le statut sera mis à jour automatiquement</li>
                <li>• L'historique sera enregistré</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => {
                  setShowSuccessPage(false);
                  window.history.replaceState({}, '', '/dashboard/remboursements');
                }}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux Remboursements
              </Button>
              
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Retour au Tableau de Bord
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--zalama-blue)] mx-auto mb-4"></div>
          <p className="text-[var(--zalama-text)]">Chargement des remboursements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--zalama-text)]">Remboursements</h1>
          <p className="text-[var(--zalama-text-secondary)]">
            Gestion des remboursements des avances de salaire
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-[var(--zalama-success)] text-[var(--zalama-success)] hover:bg-[var(--zalama-success)] hover:text-white"
            onClick={handlePayerTout}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Payer tout ({remboursements.filter(r => r.statut === 'EN_ATTENTE').length})
          </Button>
          <Button size="sm" className="bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)]">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Remboursement
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {statistiques && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">Total</CardTitle>
              <DollarSign className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--zalama-text)]">{statistiques.total_remboursements}</div>
              <p className="text-xs text-[var(--zalama-text-secondary)]">
                {formatMontant(statistiques.montant_total_a_rembourser)} à rembourser
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">Effectués</CardTitle>
              <TrendingUp className="h-4 w-4 text-[var(--zalama-success)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--zalama-success)]">{statistiques.par_statut?.PAYE || 0}</div>
              <p className="text-xs text-[var(--zalama-text-secondary)]">
                {formatMontant(statistiques.montant_total_rembourse)} remboursés
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">En attente</CardTitle>
              <Clock className="h-4 w-4 text-[var(--zalama-warning)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--zalama-warning)]">{statistiques.par_statut?.EN_ATTENTE || 0}</div>
              <p className="text-xs text-[var(--zalama-text-secondary)]">
                En attente de paiement
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">En Retard</CardTitle>
              <TrendingDown className="h-4 w-4 text-[var(--zalama-danger)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--zalama-danger)]">{statistiques.par_statut?.EN_RETARD || 0}</div>
              <p className="text-xs text-[var(--zalama-text-secondary)]">
                {formatMontant(statistiques.montant_en_retard)} en retard
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">Annulés</CardTitle>
              <AlertTriangle className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--zalama-text-secondary)]">{statistiques.par_statut?.ANNULE || 0}</div>
              <p className="text-xs text-[var(--zalama-text-secondary)]">
                Remboursements annulés
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[var(--zalama-bg-light)] border-[var(--zalama-border)]">
          <TabsTrigger value="remboursements" className="data-[state=active]:bg-[var(--zalama-blue)] data-[state=active]:text-white">Remboursements</TabsTrigger>
          <TabsTrigger value="transactions-sans-remboursement" className="data-[state=active]:bg-[var(--zalama-blue)] data-[state=active]:text-white">
            Transactions sans Remboursement ({transactionsSansRemboursement.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="remboursements" className="space-y-4">
          {/* Filtres */}
          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
            <CardHeader>
              <CardTitle className="text-lg text-[var(--zalama-text)] flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--zalama-text-secondary)]" />
                  <Input
                    placeholder="Rechercher par employé ou partenaire..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 bg-[var(--zalama-bg-light)] border-[var(--zalama-border)] text-[var(--zalama-text)] placeholder:text-[var(--zalama-text-secondary)]"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-[var(--zalama-bg-light)] border-[var(--zalama-border)] text-[var(--zalama-text)]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
                    <SelectItem value="tous">Tous les statuts</SelectItem>
                    <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                    <SelectItem value="PAYE">Payé</SelectItem>
                    <SelectItem value="EN_RETARD">En retard</SelectItem>
                    <SelectItem value="ANNULE">Annulé</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="bg-[var(--zalama-bg-light)] border-[var(--zalama-border)] text-[var(--zalama-text)]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Mois" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
                    <SelectItem value="tous">Tous les mois</SelectItem>
                    {getMoisDisponibles().map(mois => (
                      <SelectItem key={mois.value} value={mois.value}>
                        {mois.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={partnerFilter} onValueChange={setPartnerFilter}>
                  <SelectTrigger className="bg-[var(--zalama-bg-light)] border-[var(--zalama-border)] text-[var(--zalama-text)]">
                    <Building className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Partenaire" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
                    <SelectItem value="tous">Tous les partenaires</SelectItem>
                    {partners.map(partner => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bouton pour payer par partenaire */}
              {partnerFilter !== 'tous' && (
                <div className="mt-4 pt-4 border-t border-[var(--zalama-border)]">
                  <Button
                    onClick={() => handlePayerParPartenaire(partnerFilter)}
                    className="bg-[var(--zalama-success)] hover:bg-[var(--zalama-success-accent)] text-white"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Payer tous les remboursements de ce partenaire
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tableau des remboursements */}
          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--zalama-text)]">Remboursements ({filteredRemboursements.length})</CardTitle>
              <CardDescription className="text-[var(--zalama-text-secondary)]">
                Liste des remboursements des avances de salaire
              </CardDescription>
              {/* Debug temporaire */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <strong>Debug:</strong> Total brut: {remboursements.length}, Après filtres: {filteredRemboursements.length}
                  <br />
                  Filtres actifs: statut={statusFilter}, partenaire={partnerFilter}, mois={monthFilter}
                  <br />
                  Partenaires trouvés: {partners.length}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {filteredRemboursements.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-[var(--zalama-text-secondary)] mb-4">
                    {remboursements.length === 0 ? (
                      <>
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Aucun remboursement trouvé dans la base de données</p>
                        <p className="text-sm mt-1">Les remboursements sont créés automatiquement après les transactions effectuées</p>
                      </>
                    ) : (
                      <>
                        <Filter className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Aucun remboursement ne correspond aux filtres sélectionnés</p>
                        <p className="text-sm mt-1">{remboursements.length} remboursement(s) au total</p>
                      </>
                    )}
                  </div>
                  {remboursements.length === 0 && (
                    <Button
                      onClick={loadData}
                      variant="outline"
                      className="border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Recharger les données
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-[var(--zalama-border)] hover:bg-[var(--zalama-bg-light)]">
                      <TableHead className="text-[var(--zalama-text)]">Employé</TableHead>
                      <TableHead className="text-[var(--zalama-text)]">Partenaire</TableHead>
                      <TableHead className="text-[var(--zalama-text)]">Montant</TableHead>
                      <TableHead className="text-[var(--zalama-text)]">Date Limite</TableHead>
                      <TableHead className="text-[var(--zalama-text)]">Statut</TableHead>
                      <TableHead className="text-[var(--zalama-text)]">Méthode</TableHead>
                      <TableHead className="text-[var(--zalama-text)]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRemboursements.map((remboursement) => (
                      <TableRow key={remboursement.id} className="border-[var(--zalama-border)] hover:bg-[var(--zalama-bg-light)]">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                            <div>
                              <div className="font-medium text-[var(--zalama-text)]">
                                {remboursement.employe?.nom} {remboursement.employe?.prenom}
                              </div>
                              <div className="text-sm text-[var(--zalama-text-secondary)]">
                                {remboursement.employe?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                            <div className="font-medium text-[var(--zalama-text)]">{remboursement.partenaire?.nom}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-[var(--zalama-text)]">
                            {formatMontant(remboursement.montant_total_remboursement)}
                          </div>
                          <div className="text-sm text-[var(--zalama-text-secondary)]">
                            Transaction: {formatMontant(remboursement.montant_transaction)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-[var(--zalama-text)]">{formatDate(remboursement.date_limite_remboursement)}</div>
                          {remboursement.jours_retard && remboursement.jours_retard > 0 && (
                            <div className="text-sm text-[var(--zalama-danger)]">
                              {remboursement.jours_retard} jours de retard
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(remboursement.statut)}
                        </TableCell>
                        <TableCell>
                          {getMethodBadge(remboursement.methode_remboursement)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEffectuerPaiement(remboursement)}
                              disabled={remboursement.statut !== 'EN_ATTENTE'}
                              className="border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Payer
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleVoirDetails(remboursement)}
                              className="border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions-sans-remboursement" className="space-y-4">
          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--zalama-text)]">Transactions sans Remboursement</CardTitle>
              <CardDescription className="text-[var(--zalama-text-secondary)]">
                Transactions réussies qui n'ont pas encore de remboursement créé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--zalama-border)] hover:bg-[var(--zalama-bg-light)]">
                    <TableHead className="text-[var(--zalama-text)]">Employé</TableHead>
                    <TableHead className="text-[var(--zalama-text)]">Partenaire</TableHead>
                    <TableHead className="text-[var(--zalama-text)]">Montant</TableHead>
                    <TableHead className="text-[var(--zalama-text)]">Date Transaction</TableHead>
                    <TableHead className="text-[var(--zalama-text)]">Méthode</TableHead>
                    <TableHead className="text-[var(--zalama-text)]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsSansRemboursement.map((transaction) => (
                    <TableRow key={transaction.transaction_id} className="border-[var(--zalama-border)] hover:bg-[var(--zalama-bg-light)]">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                          <div>
                            <div className="font-medium text-[var(--zalama-text)]">
                              {transaction.employe_nom} {transaction.employe_prenom}
                            </div>
                            <div className="text-sm text-[var(--zalama-text-secondary)]">
                              {transaction.employe_email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                          <div className="font-medium text-[var(--zalama-text)]">{transaction.partenaire_nom}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-[var(--zalama-text)]">
                          {formatMontant(transaction.montant_total_remboursement)}
                        </div>
                        <div className="text-sm text-[var(--zalama-text-secondary)]">
                          Transaction: {formatMontant(transaction.montant)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(transaction.date_transaction)}
                      </TableCell>
                      <TableCell>
                        {getMethodBadge(transaction.methode_paiement)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleCreerRemboursement(transaction)}
                          className="bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)]"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Créer Remboursement
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        remboursement={selectedRemboursement}
        onSuccess={handlePaymentSuccess}
      />

      <CreateReimbursementModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        transaction={selectedTransaction}
        onSuccess={handleCreateSuccess}
      />

      <ReimbursementDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        remboursement={selectedRemboursement}
      />
    </div>
  );
} 