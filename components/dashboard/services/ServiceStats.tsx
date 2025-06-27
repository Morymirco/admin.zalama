import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, CheckCircle, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ServiceStatsProps {
  service: {
    nombreDemandes: number;
    nombreTransactions: number;
    montantTotal: number;
  };
}

export function ServiceStats({ service }: ServiceStatsProps) {
  const tauxTraitement = service.nombreDemandes > 0 
    ? Math.round((service.nombreTransactions / service.nombreDemandes) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Demandes totales
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{service.nombreDemandes}</div>
          <p className="text-xs text-muted-foreground">
            +12% par rapport au mois dernier
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Transactions
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{service.nombreTransactions}</div>
          <p className="text-xs text-muted-foreground">
            +8% par rapport au mois dernier
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Montant total
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(service.montantTotal)}
          </div>
          <p className="text-xs text-muted-foreground">
            +15% par rapport au mois dernier
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Taux de traitement
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {tauxTraitement}%
          </div>
          <div className="mt-2">
            <Progress value={tauxTraitement} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
