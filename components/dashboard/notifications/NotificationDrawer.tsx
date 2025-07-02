"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Notification } from '@/services/notificationService';
import NotificationHeader from './NotificationHeader';
import NotificationFilters from './NotificationFilters';
import NotificationList from './NotificationList';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationFooter from './NotificationFooter';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string>('all');
  const { 
    notifications, 
    stats, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refreshUnreadCount 
  } = useNotifications();

  // Rafraîchir les notifications quand le drawer s'ouvre
  useEffect(() => {
    if (isOpen) {
      refreshUnreadCount();
    }
  }, [isOpen, refreshUnreadCount]);
  
  // Fermer le drawer si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Empêcher le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  // Filtrer les notifications selon le type sélectionné
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter((notification: Notification) => notification.type === filter);
    
  // Obtenir le nombre de notifications non lues pour l'affichage local
  const localUnreadCount = filteredNotifications.filter((notification: Notification) => !notification.lu).length;
  
  return (
    <>
      {/* Overlay sombre */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-[var(--zalama-card)] shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* En-tête */}
          <NotificationHeader 
            unreadCount={localUnreadCount} 
            onClose={onClose} 
          />
          
          {/* Filtres */}
          <NotificationFilters 
            currentFilter={filter} 
            onFilterChange={setFilter}
            stats={stats}
          />
          
          {/* Liste des notifications */}
          <NotificationList 
            notifications={filteredNotifications} 
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            loading={loading}
          />
          
          {/* Pied de page */}
          <NotificationFooter 
            onMarkAllAsRead={markAllAsRead} 
            totalCount={filteredNotifications.length}
            unreadCount={localUnreadCount}
          />
        </div>
      </div>
    </>
  );
}
