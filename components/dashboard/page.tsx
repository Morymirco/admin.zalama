"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Users, UserPlus, UserMinus, Search, Filter, Mail, Phone, Edit, Trash2, Upload, Download, X, ChevronDown } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';

// Données fictives pour les employés
const employeesData = [
  { 
    id: 1, 
    nom: "Dupont", 
    prenom: "Jean", 
    email: "jean.dupont@example.com", 
    telephone: "06 12 34 56 78", 
    poste: "Développeur Frontend", 
    departement: "Technique", 
    dateEmbauche: "15/03/2022",
    statut: "Actif"
  },
  { 
    id: 2, 
    nom: "Martin", 
    prenom: "Sophie", 
    email: "sophie.martin@example.com", 
    telephone: "06 23 45 67 89", 
    poste: "Designer UX/UI", 
    departement: "Création", 
    dateEmbauche: "05/06/2021",
    statut: "Actif"
  },
  { 
    id: 3, 
    nom: "Petit", 
    prenom: "Thomas", 
    email: "thomas.petit@example.com", 
    telephone: "06 34 56 78 90", 
    poste: "Chef de projet", 
    departement: "Management", 
    dateEmbauche: "10/01/2020",
    statut: "Actif"
  },
  { 
    id: 4, 
    nom: "Leroy", 
    prenom: "Emma", 
    email: "emma.leroy@example.com", 
    telephone: "06 45 67 89 01", 
    poste: "Développeur Backend", 
    departement: "Technique", 
    dateEmbauche: "22/09/2022",
    statut: "Actif"
  },
  { 
    id: 5, 
    nom: "Moreau", 
    prenom: "Lucas", 
    email: "lucas.moreau@example.com", 
    telephone: "06 56 78 90 12", 
    poste: "Commercial", 
    departement: "Ventes", 
    dateEmbauche: "18/04/2021",
    statut: "Congé"
  },
  { 
    id: 6, 
    nom: "Dubois", 
    prenom: "Chloé", 
    email: "chloe.dubois@example.com", 
    telephone: "06 67 89 01 23", 
    poste: "Responsable RH", 
    departement: "Ressources Humaines", 
    dateEmbauche: "03/11/2019",
    statut: "Actif"
  },
  { 
    id: 7, 
    nom: "Bernard", 
    prenom: "Antoine", 
    email: "antoine.bernard@example.com", 
    telephone: "06 78 90 12 34", 
    poste: "Comptable", 
    departement: "Finance", 
    dateEmbauche: "14/02/2020",
    statut: "Actif"
  },
  { 
    id: 8, 
    nom: "Robert", 
    prenom: "Julie", 
    email: "julie.robert@example.com", 
    telephone: "06 89 01 23 45", 
    poste: "Assistante administrative", 
    departement: "Administration", 
    dateEmbauche: "29/07/2022",
    statut: "Actif"
  }
];

// Statistiques des employés
const stats = [
  { label: "Total employés", value: 48, icon: <Users />, accent: "bg-blue-600" },
  { label: "Nouveaux ce mois", value: 3, icon: <UserPlus />, accent: "bg-green-600" },
  { label: "Départs ce mois", value: 1, icon: <UserMinus />, accent: "bg-red-600" },
  { label: "Taux de rétention", value: "96%", icon: <Users />, accent: "bg-purple-600" },
];

// Interface pour le type d'employé
interface Employee {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  departement: string;
  dateEmbauche: string;
  statut: string;
}

// Interface pour le formulaire d'employé
interface EmployeeForm {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  departement: string;
  dateEmbauche: string;
  statut: string;
}

// Départements disponibles
const departments = [
  "Technique",
  "Marketing",
  "Commercial",
  "Ressources Humaines",
  "Finance",
  "Direction",
  "Création",
  "Management",
  "Support",
  "Autre"
];

// Statuts disponibles
const statuses = ["Actif", "Congé", "Inactif"];

export default function EmployesPage() {
  // Utiliser useParams pour récupérer le slug de l'URL
  const params = useParams();
  const slug = params.slug as string;
  // États pour la gestion des employés
  const [employees, setEmployees] = useState<Employee[]>(employeesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeForm>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    poste: "",
    departement: "Technique",
    dateEmbauche: new Date().toISOString().split('T')[0],
    statut: "Actif"
  });
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  
  // Filtrer les employés en fonction des critères de recherche
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === "" ||
      employee.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.poste.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === null || employee.departement === selectedDepartment;
    const matchesStatus = selectedStatus === null || employee.statut === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });
  
  // Pagination
  const employeesPerPage = 8;
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  
  // Gérer les changements de page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Gérer les changements dans le formulaire
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Ajouter un nouvel employé
  const handleAddEmployee = () => {
    const newEmployee: Employee = {
      id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1,
      ...formData
    };
    
    setEmployees([...employees, newEmployee]);
    setIsAddModalOpen(false);
    resetForm();
  };
  
  // Modifier un employé existant
  const handleEditEmployee = () => {
    if (!selectedEmployee) return;
    
    const updatedEmployees = employees.map(employee => 
      employee.id === selectedEmployee.id ? { ...employee, ...formData } : employee
    );
    
    setEmployees(updatedEmployees);
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
    resetForm();
  };
  
  // Supprimer un employé
  const handleDeleteEmployee = () => {
    if (!selectedEmployee) return;
    
    const updatedEmployees = employees.filter(employee => employee.id !== selectedEmployee.id);
    setEmployees(updatedEmployees);
    setIsDeleteModalOpen(false);
    setSelectedEmployee(null);
  };
  
  // Ouvrir le modal d'édition et pré-remplir le formulaire
  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      nom: employee.nom,
      prenom: employee.prenom,
      email: employee.email,
      telephone: employee.telephone,
      poste: employee.poste,
      departement: employee.departement,
      dateEmbauche: employee.dateEmbauche,
      statut: employee.statut
    });
    setIsEditModalOpen(true);
  };
  
  // Ouvrir le modal de suppression
  const openDeleteModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };
  
  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      poste: "",
      departement: "Technique",
      dateEmbauche: new Date().toISOString().split('T')[0],
      statut: "Actif"
    });
  };
  
  // Simuler l'importation d'un fichier Excel
  const handleImportExcel = () => {
    // Dans une application réelle, nous traiterions le fichier Excel ici
    // Pour cette démo, nous ajoutons simplement quelques employés fictifs
    const newEmployees: Employee[] = [
      { 
        id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1, 
        nom: "Dubois", 
        prenom: "Marie", 
        email: "marie.dubois@example.com", 
        telephone: "06 78 90 12 34", 
        poste: "Analyste Marketing", 
        departement: "Marketing", 
        dateEmbauche: "01/05/2023",
        statut: "Actif"
      },
      { 
        id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 2 : 2, 
        nom: "Bernard", 
        prenom: "Lucas", 
        email: "lucas.bernard@example.com", 
        telephone: "06 89 01 23 45", 
        poste: "Développeur Mobile", 
        departement: "Technique", 
        dateEmbauche: "15/03/2023",
        statut: "Actif"
      },
      { 
        id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 3 : 3, 
        nom: "Moreau", 
        prenom: "Camille", 
        email: "camille.moreau@example.com", 
        telephone: "06 90 12 34 56", 
        poste: "Responsable RH", 
        departement: "Ressources Humaines", 
        dateEmbauche: "10/01/2022",
        statut: "Congé"
      }
    ];
    
    setEmployees([...employees, ...newEmployees]);
    setIsImportModalOpen(false);
  };
  
  // Exporter les données au format CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Nom", "Prénom", "Email", "Téléphone", "Poste", "Département", "Date d'embauche", "Statut"];
    const csvData = [
      headers.join(","),
      ...employees.map(employee => [
        employee.id,
        employee.nom,
        employee.prenom,
        employee.email,
        employee.telephone,
        employee.poste,
        employee.departement,
        employee.dateEmbauche,
        employee.statut
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `employes_${slug}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="py-4 ">
      
      {/* Statistiques */}
      <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Statistiques des employés</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
      
      {/* Barre d&apos;actions */}
      <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-2 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--zalama-text)]/50 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Rechercher un employé..." 
                className="pl-10 pr-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)] w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filtre par département */}
            <div className="relative">
              <button 
                onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                className="flex items-center gap-2 px-2 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
              >
                <Filter className="h-4 w-4" />
                <span>{selectedDepartment || "Département"}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {isDepartmentDropdownOpen && (
                <div className="absolute z-10 mt-1 w-56 rounded-md shadow-lg bg-[var(--zalama-card)] border border-[var(--zalama-border)]">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedDepartment(null);
                        setIsDepartmentDropdownOpen(false);
                      }}
                      className="block w-full text-left px-2 py-2 text-sm text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]"
                    >
                      Tous les départements
                    </button>
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setIsDepartmentDropdownOpen(false);
                        }}
                        className="block w-full text-left px-2 py-2 text-sm text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]"
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Filtre par statut */}
            <div className="relative">
              <button 
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex items-center gap-2 px-2 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
              >
                <Filter className="h-4 w-4" />
                <span>{selectedStatus || "Statut"}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {isStatusDropdownOpen && (
                <div className="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-[var(--zalama-card)] border border-[var(--zalama-border)]">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedStatus(null);
                        setIsStatusDropdownOpen(false);
                      }}
                      className="block w-full text-left px-2 py-2 text-sm text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]"
                    >
                      Tous les statuts
                    </button>
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setIsStatusDropdownOpen(false);
                        }}
                        className="block w-full text-left px-2 py-2 text-sm text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className="flex gap-2">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
            >
              <Upload className="h-4 w-4" />
              <span>Importer</span>
            </button>
            <button 
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
            >
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </button>
            <button 
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--zalama-blue)] text-white"
            >
              <UserPlus className="h-4 w-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Tableau des employés */}
      <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] overflow-hidden mb-6">
        <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text)]/70 uppercase tracking-wider w-[18%]">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text)]/70 uppercase tracking-wider w-[18%]">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text)]/70 uppercase tracking-wider w-[14%]">Poste</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text)]/70 uppercase tracking-wider w-[14%]">Département</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text)]/70 uppercase tracking-wider w-[14%]">Date d&apos;embauche</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text)]/70 uppercase tracking-wider w-[10%]">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--zalama-text)]/70 uppercase tracking-wider w-[12%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--zalama-border)]">
              {employeesData.map((employee) => (
                <tr key={employee.id} className="hover:bg-[var(--zalama-bg-light)]/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[var(--zalama-blue)]/10 flex items-center justify-center text-[var(--zalama-blue)] font-medium flex-shrink-0">
                        {employee.prenom[0]}{employee.nom[0]}
                      </div>
                      <div className="ml-3 overflow-hidden">
                        <div className="text-sm font-medium text-[var(--zalama-text)] truncate">{employee.prenom} {employee.nom}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="text-sm text-[var(--zalama-text)]">
                      <div className="flex items-center gap-1 overflow-hidden">
                        <Mail className="h-3 w-3 text-[var(--zalama-text)]/70 flex-shrink-0" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 overflow-hidden">
                        <Phone className="h-3 w-3 text-[var(--zalama-text)]/70 flex-shrink-0" />
                        <span className="truncate">{employee.telephone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="text-sm text-[var(--zalama-text)] truncate">{employee.poste}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="text-sm text-[var(--zalama-text)] truncate">{employee.departement}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="text-sm text-[var(--zalama-text)] truncate">{employee.dateEmbauche}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.statut === 'Actif' 
                        ? 'bg-green-100 text-green-800' 
                        : employee.statut === 'Congé' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.statut}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(employee)}
                        className="p-1 rounded-full hover:bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]/70 hover:text-[var(--zalama-text)]"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(employee)}
                        className="p-1 rounded-full hover:bg-red-100 text-red-400 hover:text-red-600"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="py-3 p-2 flex items-center justify-between border-t border-[var(--zalama-border)]">
          <div className="text-sm text-[var(--zalama-text)]/70">
            Affichage de {indexOfFirstEmployee + 1} à {Math.min(indexOfLastEmployee, filteredEmployees.length)} sur {filteredEmployees.length} employés
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border border-[var(--zalama-border)] ${currentPage === 1 ? 'bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]/50 cursor-not-allowed' : 'bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]/80 cursor-pointer'}`}
            >
              Précédent
            </button>
            
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded border border-[var(--zalama-border)] ${currentPage === i + 1 ? 'bg-[var(--zalama-blue)] text-white' : 'bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]/80'}`}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded border border-[var(--zalama-border)] ${currentPage === totalPages ? 'bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]/50 cursor-not-allowed' : 'bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]/80 cursor-pointer'}`}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Modale d'ajout d'employé */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--zalama-card)] rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Ajouter un employé</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--zalama-text)]/70 hover:text-[var(--zalama-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddEmployee(); }}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Poste</label>
                  <input
                    type="text"
                    name="poste"
                    value={formData.poste}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Département</label>
                  <select
                    name="departement"
                    value={formData.departement}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Date d&apos;embauche</label>
                  <input
                    type="date"
                    name="dateEmbauche"
                    value={formData.dateEmbauche}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Statut</label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[var(--zalama-blue)] text-white"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale de modification d'employé */}
      {isEditModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--zalama-card)] rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Modifier un employé</h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedEmployee(null);
                }}
                className="text-[var(--zalama-text)]/70 hover:text-[var(--zalama-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleEditEmployee(); }}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Poste</label>
                  <input
                    type="text"
                    name="poste"
                    value={formData.poste}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Département</label>
                  <select
                    name="departement"
                    value={formData.departement}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Date d&apos;embauche</label>
                  <input
                    type="date"
                    name="dateEmbauche"
                    value={formData.dateEmbauche}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--zalama-text)]/70 mb-1">Statut</label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                    required
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedEmployee(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[var(--zalama-blue)] text-white"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale de suppression d'employé */}
      {isDeleteModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--zalama-card)] rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Confirmer la suppression</h3>
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedEmployee(null);
                }}
                className="text-[var(--zalama-text)]/70 hover:text-[var(--zalama-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-[var(--zalama-text)] mb-6">
              Êtes-vous sûr de vouloir supprimer l&apos;employé <span className="font-semibold">{selectedEmployee.prenom} {selectedEmployee.nom}</span> ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedEmployee(null);
                }}
                className="px-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteEmployee}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'importation d'employés */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--zalama-card)] rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Importer des employés</h3>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="text-[var(--zalama-text)]/70 hover:text-[var(--zalama-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-[var(--zalama-text)]/70 mb-4">
              Sélectionnez un fichier Excel (.xlsx) ou CSV (.csv) contenant les données des employés à importer.
            </p>
            <div className="border-2 border-dashed border-[var(--zalama-border)] rounded-lg p-8 mb-4 text-center">
              <Upload className="h-10 w-10 mx-auto mb-2 text-[var(--zalama-text)]/50" />
              <p className="text-[var(--zalama-text)] font-medium">Glissez-déposez un fichier ici</p>
              <p className="text-[var(--zalama-text)]/70 text-sm mb-4">ou</p>
              <button className="px-4 py-2 rounded-lg bg-[var(--zalama-blue)] text-white">
                Parcourir les fichiers
              </button>
              <input type="file" className="hidden" accept=".xlsx,.csv" onChange={handleImportExcel} />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]"
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-[var(--zalama-blue)] text-white opacity-50 cursor-not-allowed"
                disabled
              >
                Importer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
