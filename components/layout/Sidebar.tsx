"use client";
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, BarChart2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CreditCard, Database, FileText, Home, LogOut, MessageSquare, PieChart, Send, Settings, Target, User2, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

const navItems = [
  { label: 'Tableau de bord', icon: Home, href: '/dashboard' },
  { label: 'Utilisateurs', icon: Users, href: '/dashboard/utilisateurs' },
  { label: 'Finances', icon: BarChart2, href: '/dashboard/finances' },
  { label: 'Paiements', icon: CreditCard, href: '/dashboard/paiements' },
  { label: 'Services', icon: PieChart, href: '/dashboard/services' },
  { label: 'Partenaires', icon: Users, href: '/dashboard/partenaires' },
  { label: 'Avis', icon: MessageSquare, href: '/dashboard/avis' },
  { label: 'Demandes', icon: FileText, href: '/dashboard/demandes' },
  { label: 'Marketing', icon: Send, href: '/dashboard/marketing' },
  { label: 'Alertes & Risques', icon: AlertCircle, href: '/dashboard/alertes' },
  { label: 'Objectifs & Performances', icon: Target, href: '/dashboard/performance' },
  { label: 'Visualisations', icon: BarChart2, href: '/dashboard/visualisations' },
  { label: 'Profil', icon: User2, href: '/dashboard/profile' },
  { label: 'Test Migration', icon: Database, href: '/dashboard/migration-test' },
  { label: 'Test SMS', icon: MessageSquare, href: '/dashboard/test-sms' },
  { label: 'Test Employé', icon: User2, href: '/dashboard/test-employee' },
  { label: 'Paramètres', icon: Settings, href: '/dashboard/settings' },
];

export default function Sidebar() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ nom: string; prenom: string; role: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Charger les informations du profil utilisateur
  useEffect(() => {
    if (user?.email) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email })
      }).then(res => res.json());

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

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

  // Initiales de l'utilisateur
  const getUserInitials = () => {
    if (userProfile?.prenom && userProfile?.nom) {
      return `${userProfile.prenom.charAt(0)}${userProfile.nom.charAt(0)}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <aside 
      className="fixed top-0 left-0 h-screen sidebar flex flex-col shadow-lg z-30 bg-[var(--zalama-bg-darker)] text-[var(--zalama-text)]"
      style={{ width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--zalama-border)]">
        <div className="flex items-center gap-3">
          <Image src="/images/Logo_vertical.svg" alt="ZaLaMa Logo" width={100} height={20} />
          
        </div>
        <button 
          onClick={toggleSidebar} 
          className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-blue)] transition-colors focus:outline-none"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, href }) => (
          <Link 
            key={href} 
            href={href} 
            className="flex items-center gap-3 px-4 py-3 rounded-md transition-colors hover:bg-[var(--zalama-bg-light)]"
            title={label}
          >
            <Icon className="w-5 h-5 text-[var(--zalama-blue)]" />
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--zalama-blue)] to-[var(--zalama-blue-accent)] flex items-center justify-center text-white font-bold text-sm shadow-md">
              <User2 className="w-4 h-4 md:hidden" />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>{getUserInitials()}</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-[var(--zalama-text)] text-sm leading-tight">
                  {userProfile ? `${userProfile.prenom} ${userProfile.nom}` : user?.email}
                </span>
                <span className="bg-[var(--zalama-success)] text-xs text-white px-1.5 py-0.5 rounded w-fit">
                  {userProfile?.role || 'Admin'}
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <div>
              {menuOpen ? <ChevronUp className="w-4 h-4 text-[var(--zalama-text-secondary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--zalama-text-secondary)]" />}
            </div>
          )}
        </button>
        
        {menuOpen && !collapsed && (
          <div className="py-1 bg-[var(--zalama-bg-darker)] rounded-md shadow-lg absolute bottom-20 right-[calc(-200px)] w-[200px] z-50 border border-[var(--zalama-border)]">
            <Link 
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-[var(--zalama-bg-light)] transition-colors"
            >
              <User2 className="w-4 h-4 text-[var(--zalama-blue)]" />
              <span>Profil</span>
            </Link>
            <Link 
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-[var(--zalama-bg-light)] transition-colors"
            >
              <Settings className="w-4 h-4 text-[var(--zalama-blue)]" />
              <span>Paramètres</span>
            </Link>
            <div className="border-t border-[var(--zalama-border)] my-1"></div>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2 w-full text-left text-[var(--zalama-danger)] hover:bg-[var(--zalama-bg-light)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
