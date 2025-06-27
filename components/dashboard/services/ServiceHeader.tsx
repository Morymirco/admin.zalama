import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, DollarSign, Calendar, Edit } from "lucide-react";
import { ServiceDetail } from "@/types/service-detail";
import { format as formatDate } from "date-fns/format";
import { fr } from "date-fns/locale/fr";
import { Timestamp } from "firebase/firestore";

interface ServiceHeaderProps {
  service: ServiceDetail;
  onBack: () => void;
}

export function ServiceHeader({ service, onBack }: ServiceHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-sm text-muted-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux services
        </Button>
        
        <div className="flex items-center space-x-2">
          <Badge variant={service.actif ? 'default' : 'secondary'}>
            {service.actif ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={service.logo} alt={service.nom} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {service.nom.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{service.nom}</h1>
            <p className="text-muted-foreground">{service.description}</p>
            
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="mr-1 h-4 w-4" />
                <span>{service.nombreDemandes} demandes</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="mr-1 h-4 w-4" />
                <span>{service.nombreTransactions} transactions</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                <span>Créé le {formatDate(service.dateCreation instanceof Timestamp ? service.dateCreation.toDate() : new Date(service.dateCreation), 'PP', { locale: fr })}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Exporter les données
          </Button>
          <Button size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Nouvelle demande
          </Button>
        </div>
      </div>
    </div>
  );
}
