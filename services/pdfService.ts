import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PartnershipRequest } from '@/types/partnership';

export class PDFService {
  static generatePartnershipRequestPDF(request: PartnershipRequest) {
    const doc = new jsPDF();
    
    // Configuration des couleurs ZaLaMa
    const primaryColor = '#1e40af'; // Bleu ZaLaMa
    const secondaryColor = '#64748b'; // Gris
    const accentColor = '#059669'; // Vert succès
    
    // Page 1: Informations de l'entreprise
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ZaLaMa', 20, 20);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Demande de Partenariat', 20, 30);
    
    // Informations de base
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS DE L\'ENTREPRISE', 20, 50);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const companyInfo = [
      ['Nom de l\'entreprise', request.company_name],
      ['Statut légal', request.legal_status],
      ['RCCM', request.rccm],
      ['NIF', request.nif],
      ['Domaine d\'activité', request.activity_domain],
      ['Adresse du siège', request.headquarters_address],
      ['Téléphone', request.phone],
      ['Email', request.email],
      ['Nombre d\'employés', request.employees_count.toString()],
      ['Masse salariale', request.payroll],
      ['Nombre de CDI', request.cdi_count.toString()],
      ['Nombre de CDD', request.cdd_count.toString()],
      ['Date de paiement', request.payment_date],
      ['Statut de la demande', this.getStatusText(request.status)],
      ['Date de soumission', new Date(request.created_at).toLocaleDateString('fr-FR')]
    ];
    
    autoTable(doc, {
      startY: 60,
      head: [['Champ', 'Valeur']],
      body: companyInfo,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 5
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 240, 240] },
        1: { fillColor: [255, 255, 255] }
      }
    });
    
    // Pied de page page 1
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    doc.text(`Page 1/3 - Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 280);
    
    // Page 2: Informations du représentant
    doc.addPage();
    
    // En-tête page 2
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ZaLaMa', 20, 20);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Demande de Partenariat', 20, 30);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS DU REPRÉSENTANT', 20, 50);
    
    const repInfo = [
      ['Nom complet', request.rep_full_name],
      ['Poste', request.rep_position],
      ['Email', request.rep_email],
      ['Téléphone', request.rep_phone]
    ];
    
    autoTable(doc, {
      startY: 60,
      head: [['Champ', 'Valeur']],
      body: repInfo,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 6
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 240, 240] },
        1: { fillColor: [255, 255, 255] }
      }
    });
    
    // Informations supplémentaires sur l'entreprise (page 2)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉSUMÉ ENTREPRISE', 20, 140);
    
    const summaryInfo = [
      ['Entreprise', request.company_name],
      ['Statut légal', request.legal_status],
      ['Domaine', request.activity_domain],
      ['Employés', `${request.employees_count} (${request.cdi_count} CDI, ${request.cdd_count} CDD)`],
      ['Masse salariale', request.payroll]
    ];
    
    autoTable(doc, {
      startY: 150,
      head: [['Champ', 'Valeur']],
      body: summaryInfo,
      theme: 'grid',
      headStyles: {
        fillColor: secondaryColor,
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [245, 245, 245] },
        1: { fillColor: [255, 255, 255] }
      }
    });
    
    // Pied de page page 2
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    doc.text(`Page 2/3 - Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 280);
    
    // Page 3: Informations RH
    doc.addPage();
    
    // En-tête page 3
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ZaLaMa', 20, 20);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Demande de Partenariat', 20, 30);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS RESSOURCES HUMAINES', 20, 50);
    
    const hrInfo = [
      ['Nom du responsable RH', request.hr_full_name],
      ['Email RH', request.hr_email],
      ['Téléphone RH', request.hr_phone],
      ['Accord aux conditions', request.agreement ? 'Oui' : 'Non']
    ];
    
    autoTable(doc, {
      startY: 60,
      head: [['Champ', 'Valeur']],
      body: hrInfo,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 6
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 240, 240] },
        1: { fillColor: [255, 255, 255] }
      }
    });
    
    // Métadonnées et informations techniques
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MÉTADONNÉES', 20, 140);
    
    const metadata = [
      ['ID de la demande', request.id],
      ['Statut', this.getStatusText(request.status)],
      ['Date de création', new Date(request.created_at).toLocaleDateString('fr-FR')],
      ['Heure de création', new Date(request.created_at).toLocaleTimeString('fr-FR')],
      ['Date de modification', request.updated_at ? new Date(request.updated_at).toLocaleDateString('fr-FR') : 'Non modifiée']
    ];
    
    autoTable(doc, {
      startY: 150,
      head: [['Champ', 'Valeur']],
      body: metadata,
      theme: 'grid',
      headStyles: {
        fillColor: secondaryColor,
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 4
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [245, 245, 245] },
        1: { fillColor: [255, 255, 255] }
      }
    });
    
    // Pied de page page 3
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    doc.text(`Page 3/3 - Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 280);
    
    // Sauvegarder le PDF
    const fileName = `demande_partenariat_${request.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  static generateMultipleRequestsPDF(requests: PartnershipRequest[]) {
    const doc = new jsPDF();
    
    // Configuration des couleurs ZaLaMa
    const primaryColor = '#1e40af';
    const secondaryColor = '#64748b';
    
    // En-tête
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ZaLaMa', 20, 20);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Liste des Demandes de Partenariat', 20, 30);
    
    // Tableau des demandes
    const tableData = requests.map(request => [
      request.company_name,
      request.rep_full_name,
      request.activity_domain,
      request.employees_count.toString(),
      this.getStatusText(request.status),
      new Date(request.created_at).toLocaleDateString('fr-FR')
    ]);
    
    autoTable(doc, {
      startY: 50,
      head: [['Entreprise', 'Représentant', 'Domaine', 'Employés', 'Statut', 'Date']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }
      }
    });
    
    // Statistiques
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const approvedRequests = requests.filter(r => r.status === 'approved').length;
    const rejectedRequests = requests.filter(r => r.status === 'rejected').length;
    const inReviewRequests = requests.filter(r => r.status === 'in_review').length;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('STATISTIQUES', 20, doc.lastAutoTable.finalY + 20);
    
    const statsData = [
      ['Total des demandes', totalRequests.toString()],
      ['En attente', pendingRequests.toString()],
      ['Approuvées', approvedRequests.toString()],
      ['Rejetées', rejectedRequests.toString()],
      ['En révision', inReviewRequests.toString()]
    ];
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 25,
      head: [['Statut', 'Nombre']],
      body: statsData,
      theme: 'grid',
      headStyles: {
        fillColor: secondaryColor,
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 240, 240] },
        1: { fillColor: [255, 255, 255] }
      }
    });
    
    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 280);
    
    const fileName = `liste_demandes_partenariat_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  private static getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'En attente',
      'in_review': 'En révision',
      'approved': 'Approuvée',
      'rejected': 'Rejetée'
    };
    return statusMap[status] || status;
  }
} 