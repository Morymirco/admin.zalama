import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Search, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TransactionService {
  id: string;
  reference: string;
  demandeurNom: string;
  dateTransaction: string;
  montant: number;
  typePaiement: string;
  statut: 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE' | 'ANNULEE' | 'REMBOURSEE';
}

interface ServiceTransactionsProps {
  transactions: TransactionService[];
  onViewDetails: (transaction: TransactionService) => void;
}

export function ServiceTransactions({ transactions, onViewDetails }: ServiceTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TOUS');

  const statusOptions = [
    { value: 'TOUS', label: 'Tous les statuts' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'VALIDEE', label: 'Validée' },
    { value: 'REJETEE', label: 'Rejetée' },
    { value: 'ANNULEE', label: 'Annulée' },
    { value: 'REMBOURSEE', label: 'Remboursée' },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        transaction.demandeurNom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'TOUS' || transaction.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'VALIDEE':
        return 'bg-green-100 text-green-800';
      case 'REJETEE':
      case 'ANNULEE':
        return 'bg-red-100 text-red-800';
      case 'REMBOURSEE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher des transactions..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Filter className="mr-2 h-4 w-4" />
                {statusFilter === 'TOUS' 
                  ? 'Tous les statuts' 
                  : statusOptions.find(s => s.value === statusFilter)?.label}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusOptions.map((option) => (
                <DropdownMenuItem 
                  key={option.value} 
                  onClick={() => setStatusFilter(option.value)}
                  className={statusFilter === option.value ? 'bg-accent' : ''}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" className="h-10">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Bénéficiaire</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Type de paiement</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.reference}</TableCell>
                  <TableCell>{transaction.demandeurNom}</TableCell>
                  <TableCell>
                    {format(new Date(transaction.dateTransaction), 'PP', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('fr-FR', { 
                      style: 'currency', 
                      currency: 'XOF' 
                    }).format(transaction.montant)}
                  </TableCell>
                  <TableCell className="capitalize">
                    {transaction.typePaiement.toLowerCase()}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`${getStatusBadgeVariant(transaction.statut)} capitalize`}
                    >
                      {transaction.statut.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDetails(transaction)}
                    >
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Aucune transaction trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {filteredTransactions.length} transaction(s) au total
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            disabled={true}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            disabled={true}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
