'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  CreditCard,
  Eye,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  Users,
  Building
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Remboursement, 
  StatistiquesRemboursementPartenaire,
  PaiementRemboursementData
} from '@/types/reimbursement';
import reimbursementService from '@/services/reimbursementService';

export default function RemboursementsPartenairePage() {
  const [remboursements, setRemboursements] = useState<Remboursement[]>([]);
  const [statistiques, setStatistiques] = useState<StatistiquesRemboursementPartenaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('en-attente');
  const [searchTerm, setSearchTerm] = useState('');
  
  // État pour la modal de paiement
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRemboursement, setSelectedRemboursement] = useState<Remboursement | null>(null);
  const [paymentData, setPaymentData] = useState<PaiementRemboursementData>({
    remboursement_id: '',
    methode_remboursement: 'VIREMENT_BANCAIRE',
    numero_transaction: '',
    numero_reception: '',
    reference_paiement: '',
    commentaire: ''
  });

  // TODO: Récupérer l'ID du partenaire connecté
  const partenaireId = 'partner-id'; // À remplacer par l'ID réel du partenaire

  useEffect(() => {
    loadData();
  }, [partenaireId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [remboursementsData, statistiquesData] = await Promise.all([
        reimbursementService.getByPartner(partenaireId),
        reimbursementService.getStatistiquesParPartenaire()
      ]);

      setRemboursements(remboursementsData);
      const partenaireStats = statistiquesData.find(s => s.partenaire_id === partenaireId);
      setStatistiques(partenaireStats || null);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
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

  const filteredRemboursements = remboursements.filter(remboursement => {
    const matchesSearch = searchTerm === '' || 
      remboursement.employe?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      remboursement.employe?.prenom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'tous' || 
      (activeTab === 'en-attente' && remboursement.statut === 'EN_ATTENTE') ||
      (activeTab === 'payes' && remboursement.statut === 'PAYE') ||
      (activeTab === 'en-retard' && remboursement.statut === 'EN_RETARD');
    
    return matchesSearch && matchesTab;
  });

  const handleEffectuerPaiement = (remboursement: Remboursement) => {
    setSelectedRemboursement(remboursement);
    setPaymentData({
      remboursement_id: remboursement.id,
      methode_remboursement: 'VIREMENT_BANCAIRE',
      numero_transaction: '',
      numero_reception: '',
      reference_paiement: '',
      commentaire: ''
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPaiement = async () => {
    try {
      // TODO: Implémenter l'appel API pour effectuer le paiement
      await reimbursementService.effectuerPaiementEcheance({
        echeance_id: paymentData.remboursement_id,
        montant_paye: selectedRemboursement?.montant_total_remboursement || 0,
        methode_paiement: paymentData.methode_remboursement,
        numero_transaction: paymentData.numero_transaction,
        numero_reception: paymentData.numero_reception,
        commentaire: paymentData.commentaire
      });

      toast.success('Paiement effectué avec succès');
      setShowPaymentModal(false);
      loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      toast.error('Erreur lors du paiement');
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight text-[var(--zalama-text)]">Mes Remboursements</h1>
          <p className="text-[var(--zalama-text-secondary)]">
            Gestion des remboursements de vos employés
          </p>
        </div>
      </div>

      {/* Statistiques */}
      {statistiques && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">Total Remboursements</CardTitle>
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
              <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">Remboursements Payés</CardTitle>
              <TrendingUp className="h-4 w-4 text-[var(--zalama-success)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--zalama-success)]">{statistiques.remboursements_payes}</div>
              <p className="text-xs text-[var(--zalama-text-secondary)]">
                {formatMontant(statistiques.montant_total_rembourse)} remboursés
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">En Attente</CardTitle>
              <Clock className="h-4 w-4 text-[var(--zalama-warning)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--zalama-warning)]">{statistiques.remboursements_en_attente}</div>
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
              <div className="text-2xl font-bold text-[var(--zalama-danger)]">{statistiques.remboursements_en_retard}</div>
              <p className="text-xs text-[var(--zalama-text-secondary)]">
                Nécessitent une attention urgente
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[var(--zalama-bg-light)] border-[var(--zalama-border)]">
          <TabsTrigger value="en-attente" className="data-[state=active]:bg-[var(--zalama-blue)] data-[state=active]:text-white">
            En Attente ({remboursements.filter(r => r.statut === 'EN_ATTENTE').length})
          </TabsTrigger>
          <TabsTrigger value="payes" className="data-[state=active]:bg-[var(--zalama-blue)] data-[state=active]:text-white">
            Payés ({remboursements.filter(r => r.statut === 'PAYE').length})
          </TabsTrigger>
          <TabsTrigger value="en-retard" className="data-[state=active]:bg-[var(--zalama-blue)] data-[state=active]:text-white">
            En Retard ({remboursements.filter(r => r.statut === 'EN_RETARD').length})
          </TabsTrigger>
          <TabsTrigger value="tous" className="data-[state=active]:bg-[var(--zalama-blue)] data-[state=active]:text-white">
            Tous ({remboursements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filtres */}
          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
            <CardHeader>
              <CardTitle className="text-lg text-[var(--zalama-text)] flex items-center gap-2">
                <Search className="h-5 w-5" />
                Rechercher
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--zalama-text-secondary)]" />
                <Input
                  placeholder="Rechercher par employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-[var(--zalama-bg-light)] border-[var(--zalama-border)] text-[var(--zalama-text)] placeholder:text-[var(--zalama-text-secondary)]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tableau des remboursements */}
          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--zalama-text)]">Remboursements ({filteredRemboursements.length})</CardTitle>
              <CardDescription className="text-[var(--zalama-text-secondary)]">
                Liste de vos remboursements d'avances de salaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--zalama-border)] hover:bg-[var(--zalama-bg-light)]">
                    <TableHead className="text-[var(--zalama-text)]">Employé</TableHead>
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
                        <div className="font-medium text-[var(--zalama-text)]">
                          {formatMontant(remboursement.montant_total_remboursement)}
                        </div>
                        <div className="text-sm text-[var(--zalama-text-secondary)]">
                          Transaction: {formatMontant(remboursement.montant_transaction)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                          <div>
                            <div className="text-[var(--zalama-text)]">{formatDate(remboursement.date_limite_remboursement)}</div>
                            {remboursement.jours_retard && remboursement.jours_retard > 0 && (
                              <div className="text-sm text-[var(--zalama-danger)]">
                                {remboursement.jours_retard} jours de retard
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(remboursement.statut)}
                      </TableCell>
                      <TableCell>
                        {getMethodBadge(remboursement.methode_remboursement)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {remboursement.statut === 'EN_ATTENTE' && (
                            <Button
                              size="sm"
                              onClick={() => handleEffectuerPaiement(remboursement)}
                              className="bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)]"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Payer
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de paiement */}
      {showPaymentModal && selectedRemboursement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--zalama-card)] rounded-lg p-6 w-full max-w-md border border-[var(--zalama-border)]">
            <h3 className="text-lg font-semibold mb-4 text-[var(--zalama-text)]">Effectuer le Paiement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--zalama-text)]">Employé</label>
                <div className="p-2 bg-[var(--zalama-bg-light)] rounded border border-[var(--zalama-border)] text-[var(--zalama-text)]">
                  {selectedRemboursement.employe?.nom} {selectedRemboursement.employe?.prenom}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--zalama-text)]">Montant à payer</label>
                <div className="p-2 bg-[var(--zalama-bg-light)] rounded border border-[var(--zalama-border)] font-semibold text-[var(--zalama-text)]">
                  {formatMontant(selectedRemboursement.montant_total_remboursement)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--zalama-text)]">Méthode de paiement</label>
                <Select 
                  value={paymentData.methode_remboursement} 
                  onValueChange={(value) => setPaymentData({...paymentData, methode_remboursement: value as any})}
                >
                  <SelectTrigger className="bg-[var(--zalama-bg-light)] border-[var(--zalama-border)] text-[var(--zalama-text)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
                    <SelectItem value="VIREMENT_BANCAIRE">Virement Bancaire</SelectItem>
                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                    <SelectItem value="ESPECES">Espèces</SelectItem>
                    <SelectItem value="CHEQUE">Chèque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--zalama-text)]">Numéro de transaction</label>
                <Input
                  value={paymentData.numero_transaction}
                  onChange={(e) => setPaymentData({...paymentData, numero_transaction: e.target.value})}
                  placeholder="Ex: VIR-2024-001"
                  className="bg-[var(--zalama-bg-light)] border-[var(--zalama-border)] text-[var(--zalama-text)] placeholder:text-[var(--zalama-text-secondary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--zalama-text)]">Numéro de réception</label>
                <Input
                  value={paymentData.numero_reception}
                  onChange={(e) => setPaymentData({...paymentData, numero_reception: e.target.value})}
                  placeholder="Numéro de réception"
                  className="bg-[var(--zalama-bg-light)] border-[var(--zalama-border)] text-[var(--zalama-text)] placeholder:text-[var(--zalama-text-secondary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--zalama-text)]">Commentaire</label>
                <Input
                  value={paymentData.commentaire}
                  onChange={(e) => setPaymentData({...paymentData, commentaire: e.target.value})}
                  placeholder="Commentaire optionnel"
                  className="bg-[var(--zalama-bg-light)] border-[var(--zalama-border)] text-[var(--zalama-text)] placeholder:text-[var(--zalama-text-secondary)]"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSubmitPaiement}
                className="flex-1 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)]"
              >
                Confirmer le Paiement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 