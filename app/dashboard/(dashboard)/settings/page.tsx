"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, Shield } from 'lucide-react';
import {
  ParametresProfil,
  ParametresApplication,
  ParametresSecurite
} from '@/components/dashboard/settings';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profil");
  
  useEffect(() => {
    // Simuler un chargement depuis une API
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <div className="p-6">
      <Tabs defaultValue="profil" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="profil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="application" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Application</span>
          </TabsTrigger>
          <TabsTrigger value="securite" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profil">
          <ParametresProfil isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="application">
          <ParametresApplication isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="securite">
          <ParametresSecurite isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
