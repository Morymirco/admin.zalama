import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { FileText, DollarSign, User, Settings, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ServiceSidebarProps {
  serviceId: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const sidebarItems = [
  {
    id: 'demandes',
    title: 'Demandes',
    icon: FileText,
  },
  {
    id: 'transactions',
    title: 'Transactions',
    icon: DollarSign,
  },
  {
    id: 'responsable',
    title: 'Responsable',
    icon: User,
  },
  {
    id: 'parametres',
    title: 'Paramètres',
    icon: Settings,
  },
];

export function ServiceSidebar({ 
  serviceId, 
  activeTab, 
  onTabChange,
  className 
}: ServiceSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Gestion
            </h2>
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => onTabChange(item.id)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <Link href={`/dashboard/services/${serviceId}/nouvelle-demande`} passHref>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle demande
          </Button>
        </Link>
      </div>
    </div>
  );
}
