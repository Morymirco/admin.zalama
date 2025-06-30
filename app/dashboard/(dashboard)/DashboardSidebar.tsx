"use client";
import { Home, Users, AlertCircle, Target, PieChart, Settings, LogOut, ChevronLeft, ChevronRight, User2, CreditCard, Briefcase } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import LogoutButton from "@/components/LogoutButton";

const navItems = [
  { label: 'Tableau de bord', icon: Home, href: '/dashboard' },
  { label: 'Utilisateurs', icon: Users, href: '/dashboard/utilisateurs' },
  { label: 'Finances', icon: CreditCard, href: '/dashboard/finances' },
  { label: 'Services', icon: Briefcase, href: '/dashboard/services' },
  { label: 'Partenaires', icon: Briefcase, href: '/dashboard/partenaires' },
  { label: 'Alertes', icon: AlertCircle, href: '/dashboard/alertes' },
  { label: 'Performance', icon: Target, href: '/dashboard/performance' },
  { label: 'Visualisations', icon: PieChart, href: '/dashboard/visualisations' },
  { label: 'Paramètres', icon: Settings, href: '/dashboard/settings' },
];

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    
    // Mettre à jour la variable CSS pour le layout
    document.documentElement.style.setProperty(
      '--current-sidebar-width', 
      newCollapsedState ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
    );
    
    // Mettre à jour la classe du body
    if (newCollapsedState) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  };

  // Initialiser la variable CSS au chargement
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--current-sidebar-width', 
      collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
    );
    
    // Mettre à jour la classe du body
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
    
    return () => {
      document.body.classList.remove('sidebar-collapsed');
    };
  }, [collapsed]);

  // Fermer le menu déroulant si on clique en dehors
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

  return (
    <aside 
      className={`sidebar fixed top-0 left-0 h-full bg-[var(--zalama-bg-darker)] border-r border-[var(--zalama-border)] transition-all duration-300 z-30 ${collapsed ? 'w-16' : 'w-64'}`}
      style={{ width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
    >
      {/* Logo et titre */}
      <div className="flex items-center justify-between h-18 px-4 border-b border-[var(--zalama-border)]">
        <Link href="/dashboard" className="flex items-center">
          <div className="relative w-8 h-8 mr-3 flex-shrink-0">
            <Image 
              src="/logo-zalama.png" 
              alt="ZaLaMa Logo" 
              fill
              className="object-contain"
            />
          </div>
          <span className={`text-lg font-semibold text-[var(--zalama-gray)] ${collapsed ? 'hidden' : 'block'} sidebar-logo-text`}>
            ZaLaMa <span className="text-[var(--zalama-blue)]">Admin</span>
          </span>
        </Link>
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-[var(--zalama-bg-light)] text-[var(--zalama-gray)]/70"
        >
          {collapsed ? 
            <ChevronRight className="w-5 h-5" /> : 
            <ChevronLeft className="w-5 h-5" />
          }
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="mt-6 px-2 h-[calc(100vh-4.5rem-6rem)] overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/dashboard');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-[var(--zalama-blue)]/10 text-[var(--zalama-blue)]' 
                      : 'text-[var(--zalama-gray)]/80 hover:bg-[var(--zalama-bg-light)] hover:text-[var(--zalama-gray)]'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                  <span className={`${collapsed ? 'hidden' : 'block'} sidebar-text`}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Profil utilisateur */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--zalama-border)] p-4">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex items-center w-full rounded-lg p-2 text-[var(--zalama-gray)]/80 hover:bg-[var(--zalama-bg-light)] hover:text-[var(--zalama-gray)] transition-colors ${
              collapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-[var(--zalama-blue)] flex items-center justify-center text-white font-semibold flex-shrink-0">
                A
              </div>
              {!collapsed && (
                <div className="ml-3 sidebar-text">
                  <p className="text-sm font-medium">Admin ZaLaMa</p>
                  <p className="text-xs text-[var(--zalama-gray)]/60">Super Admin</p>
                </div>
              )}
            </div>
            {!collapsed && <ChevronRight className="w-4 h-4 sidebar-text" />}
          </button>
          
          {menuOpen && !collapsed && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] shadow-lg overflow-hidden">
              <ul>
                <li>
                  <Link 
                    href="/profile" 
                    className="flex items-center px-4 py-2 text-sm text-[var(--zalama-gray)]/80 hover:bg-[var(--zalama-bg-light)] hover:text-[var(--zalama-gray)]"
                  >
                    <User2 className="w-4 h-4 mr-2" />
                    Profil
                  </Link>
                </li>
                <li>
                  <LogoutButton />
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
