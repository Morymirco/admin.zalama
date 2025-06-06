"use client"
import { Bell, Sun, Moon, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import NotificationDrawer from '@/components/dashboard/notifications/NotificationDrawer';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';

export default function DashboardHeader() {
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, refreshUnreadCount } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();
  
  // Obtenir le titre de la page en fonction du chemin
  const getPageTitle = () => {
    if (!pathname) return "Tableau de Bord";
    const title =(()=>{
    if (pathname === "/dashboard") return "";
    if (pathname.includes("/utilisateurs")) return "Gestion des Utilisateurs";
    if (pathname.includes("/finances")) return "Finances";
    if (pathname.includes("/services")) return "Services";
    if (pathname.includes("/partenaires")) return "Partenaires";
    if (pathname.includes("/alertes")) return "Alertes";
    if (pathname.includes("/performance")) return "Performance";
    if (pathname.includes("/visualisations")) return "Visualisations";
    if (pathname.includes("/settings")) return "Paramètres";
    })()
    return title ? (
      <span className="flex items-center gap-1 text-xl font-semibold">
        <Link href={'/dashboard'} className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>Tableau de Bord </Link>
        <ChevronRight className="h-4 w-4" />
        {title}
      </span>
    ) : <span className="flex items-center gap-1 text-xl font-semibold">Tableau de Bord</span>;
  };
  
  // Gérer l'ouverture/fermeture du drawer de notifications
  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    
    // Rafraîchir le compteur lorsqu'on ouvre/ferme le drawer
    if (!notificationsOpen) {
      refreshUnreadCount();
    }
  };

  return (
    <>
      <header className="w-full h-16 flex items-center justify-between px-4 md:px-8 bg-[var(--zalama-header-blue)] border-b border-[var(--zalama-border)] shadow-sm sticky top-0 z-20">
        {/* Titre du dashboard */}
        <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}> {getPageTitle()}</h1>
        {/* Bloc actions */}
        <div className="flex items-center gap-4 md:gap-6">
          <button
            className="relative focus:outline-none"
            aria-label="Voir les notifications"
            onClick={toggleNotifications}
          >
            <Bell className={`w-6 h-6 ${theme === 'dark' ? 'text-zinc-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`} />
            {unreadCount > 0 && (
              <>
                <span className="animate-ping absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] text-white rounded-full px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </>
            )}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors focus:outline-none"
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-zinc-200" />}
          </button>
        </div>
      </header>
      
      {/* Drawer de notifications */}
      <NotificationDrawer 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </>
  );
}

