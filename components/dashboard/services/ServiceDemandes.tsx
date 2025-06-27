import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Search, Filter, ChevronDown, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SetStateAction, useState } from "react";
import { format } from "date-fns/format";
import { fr } from "date-fns/locale/fr";

interface DemandeService {
  id: string;
  reference: string;
  demandeurNom: string;
  dateDemande: string;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TRAITEE' | 'REJETEE' | 'ANNULEE';
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'URGENTE';
}

interface ServiceDemandesProps {
  demandes: DemandeService[];
  onViewDetails: (demande: DemandeService) => void;
}

export function ServiceDemandes({ demandes, onViewDetails }: ServiceDemandesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TOUS');

  const statusOptions = [
    { value: 'TOUS', label: 'Tous les statuts' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TRAITEE', label: 'Traitée' },
    { value: 'REJETEE', label: 'Rejetée' },
    { value: 'ANNULEE', label: 'Annulée' },
  ];

  const filteredDemandes = demandes.filter(demande => {
    const matchesSearch = demande.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        demande.demandeurNom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'TOUS' || demande.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE':
      case 'EN_COURS':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'TRAITEE':
        return <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />;
      case 'REJETEE':
      case 'ANNULEE':
        return <XCircle className="h-4 w-4 mr-1 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher des demandes..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchTerm(e.target.value)}
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
      
      <div className="rounded-md border
      ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Demandeur</TableHead>
              <TableHead>Date de demande</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDemandes.length > 0 ? (
              filteredDemandes.map((demande) => (
                <TableRow key={demande.id}>
                  <TableCell className="font-medium">{demande.reference}</TableCell>
                  <TableCell>{demande.demandeurNom}</TableCell>
                  <TableCell>
                    {format(new Date(demande.dateDemande), 'PPpp', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={demande.priorite === 'HAUTE' || demande.priorite === 'URGENTE' ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {demande.priorite.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(demande.statut)}
                      <span className="capitalize">
                        {demande.statut.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDetails(demande)}
                    >
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Aucune demande trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {filteredDemandes.length} demande(s) au total
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
