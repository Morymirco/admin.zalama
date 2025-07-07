"use client"
import { Bell, Sun, Moon, ChevronRight } from 'lucide-react';
import React, { useState, useCallback } from 'react';
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
    if (pathname.includes("/avis")) return "Gestion des Avis";
    if (pathname.includes("/alertes")) return "Alertes";
    if (pathname.includes("/performance")) return "Performance";
    if (pathname.includes("/visualisations")) return "Visualisations";
    if (pathname.includes("/settings")) return "Paramètres";
    })()
    return title ? (
      <span className="flex items-center gap-1 text-xl font-semibold">
        <Link href={'/dashboard'} className="text-[var(--zalama-text)] hover:text-[var(--zalama-blue)] transition-colors">Tableau de Bord </Link>
        <ChevronRight className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
        {title}
      </span>
    ) : <span className="flex items-center gap-1 text-xl font-semibold text-[var(--zalama-text)]">Tableau de Bord</span>;
  };
  
  // Gérer l'ouverture/fermeture du drawer de notifications
  const toggleNotifications = useCallback(() => {
    setNotificationsOpen(prev => {
      const newState = !prev;
      
      // Rafraîchir le compteur seulement lors de l'ouverture
      if (newState) {
        // Utiliser setTimeout pour éviter les conflits de rendu
        setTimeout(() => {
          refreshUnreadCount();
        }, 0);
      }
      
      return newState;
    });
  }, [refreshUnreadCount]);

  return (
    <>
      <header className="w-full h-16 flex items-center justify-between px-4 md:px-8 bg-[var(--zalama-header-blue)] border-b border-[var(--zalama-border)] shadow-sm sticky top-0 z-20">
        {/* Titre du dashboard */}
        <h1 className="text-xl font-bold text-[var(--zalama-text)]"> {getPageTitle()}</h1>
        {/* Bloc actions */}
        <div className="flex items-center gap-4 md:gap-6">
          <button
            className="relative focus:outline-none"
            aria-label="Voir les notifications"
            onClick={toggleNotifications}
          >
            <Bell className="w-6 h-6 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors" />
            {unreadCount > 0 && (
              <>
                <span className="animate-ping absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-[var(--zalama-danger)] opacity-75"></span>
                <span className="absolute -top-1 -right-1 bg-[var(--zalama-danger)] text-[10px] text-white rounded-full px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </>
            )}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-[var(--zalama-bg-light)] hover:bg-[var(--zalama-bg-lighter)] transition-colors focus:outline-none"
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-[var(--zalama-warning)]" /> : <Moon className="w-5 h-5 text-[var(--zalama-text-secondary)]" />}
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

