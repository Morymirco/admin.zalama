"use client";
import { Home, Users, BarChart2, AlertCircle, Target, PieChart, Settings, LogOut, ChevronLeft, ChevronRight, User2, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const navItems = [
  { label: 'Tableau de bord', icon: Home, href: '/dashboard' },
  { label: 'Utilisateurs', icon: Users, href: '/dashboard/utilisateurs' },
  { label: 'Finances', icon: BarChart2, href: '/dashboard/finances' },
  { label: 'Services', icon: PieChart, href: '/dashboard/services' },
  { label: 'Partenaires', icon: Users, href: '/dashboard/partenaires' },
  { label: 'Alertes & Risques', icon: AlertCircle, href: '/dashboard/alertes' },
  { label: 'Objectifs & Performances', icon: Target, href: '/dashboard/performance' },
  { label: 'Visualisations', icon: BarChart2, href: '/dashboard/visualisations' },
  { label: 'Paramètres', icon: Settings, href: '/dashboard/settings' },
];

export default function Sidebar() {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    
    // Mettre à jour la variable CSS pour le layout
    document.documentElement.style.setProperty(
      '--current-sidebar-width', 
      newCollapsedState ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
    );
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Initialiser la variable CSS au chargement du composant
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--current-sidebar-width', 
      collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
    );
  }, [collapsed]);

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen sidebar flex flex-col shadow-lg z-30 ${theme === 'dark' ? 'bg-[var(--zalama-sidebar)] text-zinc-100' : 'bg-white text-gray-800'}`}
      style={{ width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--zalama-border)]">
        <div className="flex items-center gap-3">
          <Image src="/images/Logo_vertical.svg" alt="ZaLaMa Logo" width={100} height={20} />
          
        </div>
        <button 
          onClick={toggleSidebar} 
          className="text-[var(--zalama-gray)] hover:text-[var(--zalama-blue)] transition-colors focus:outline-none"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, href }) => (
          <Link 
            key={href} 
            href={href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${theme === 'dark' ? 'hover:bg-[var(--zalama-bg-light)]' : 'hover:bg-gray-100'}`}
            title={label}
          >
            <Icon className={`w-5 h-5 ${theme === 'dark' ? 'text-[var(--zalama-blue)]' : 'text-blue-600'}`} />
            <span className={`sidebar-text ${collapsed ? 'hidden' : 'block'}`}>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-[var(--zalama-border)]" ref={menuRef}>
        <button 
          onClick={toggleMenu}
          className="flex items-center justify-between w-full px-2 py-2 rounded-md hover:bg-[var(--zalama-bg-light)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              <User2 className="w-4 h-4 md:hidden" />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>FG</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-zinc-100 text-sm leading-tight">Fassou Gbagan</span>
                <span className="bg-green-600 text-xs text-white px-1.5 py-0.5 rounded w-fit">Admin</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <div>
              {menuOpen ? <ChevronUp className="w-4 h-4 text-[var(--zalama-gray)]" /> : <ChevronDown className="w-4 h-4 text-[var(--zalama-gray)]" />}
            </div>
          )}
        </button>
        
        {menuOpen && !collapsed && (
          <div className="py-1 bg-[var(--zalama-bg-darker)] rounded-md shadow-lg absolute bottom-20 right-[calc(-200px)] w-[200px] z-50 border border-[var(--zalama-border)]">
            <button className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-[var(--zalama-bg-light)] transition-colors">
              <User2 className="w-4 h-4 text-[var(--zalama-blue)]" />
              <span>Profil</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-[var(--zalama-bg-light)] transition-colors">
              <Settings className="w-4 h-4 text-[var(--zalama-blue)]" />
              <span>Paramètres</span>
            </button>
            <div className="border-t border-[var(--zalama-border)] my-1"></div>
            <button className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-400 hover:bg-[var(--zalama-bg-light)] transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
