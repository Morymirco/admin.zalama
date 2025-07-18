 Réponse API Lengo Pay parsée avec succès: {
  status: 'SUCCESS',
  pay_id: 'OHZOU1hwYTd6U0h2WnR3cHViQ2xSZlF4UEhvRHA1Skc=',
  amount: 1870,
  account: 625212115,
  date: '2025-07-18 16:01:14'
}
✅ Réponse statut Lengo Pay reçue: {
  status: 'SUCCESS',
  pay_id: 'OHZOU1hwYTd6U0h2WnR3cHViQ2xSZlF4UEhvRHA1Skc=',
  amount: 1870,
  account: 625212115,
  date: '2025-07-18 16:01:14'
}
🔍 Type de statusResult: object
🔍 Clés de statusResult: [ 'status', 'pay_id', 'amount', 'account', 'date' ]  
💾 Mise à jour du statut dans la base de données...
🔄 Mapping des statuts: {
  lengo_status: 'SUCCESS',
  mapped_db_status: 'EFFECTUEE',
  date_transaction: '2025-07-18T16:01:14.000Z',
  should_update_db: true
}
✅ Transaction mise à jour avec succès: {
  id: 'f5c4d308-db2d-40dd-ba4a-38cd74f440ad',
  demande_avance_id: '207b15bd-95b0-4eb6-8fe1-83dd3c2f6053',
  employe_id: '808d6d68-4274-4709-b7e6-83214cf3711b',
  entreprise_id: '35de2272-972a-4a52-b905-909ffce12152',
  montant: 1870,
  numero_transaction: 'OHZOU1hwYTd6U0h2WnR3cHViQ2xSZlF4UEhvRHA1Skc=',
  methode_paiement: 'MOBILE_MONEY',
  numero_compte: '+224625212115',
  numero_reception: '625212115',
  date_transaction: '2025-07-18T16:01:14+00:00',
  recu_url: null,
  date_creation: '2025-07-18T16:01:14.851+00:00',
  statut: 'EFFECTUEE',
  created_at: '2025-07-18T16:01:15.531095+00:00',
  updated_at: '2025-07-18T16:01:24.351+00:00',
  description: 'Avance sur salaire - MORY KOULIBALY - medicales',
  message_callback: 'Transaction Succeded'
}
🔍 Détails de la transaction: {
  demande_avance_id: '207b15bd-95b0-4eb6-8fe1-83dd3c2f6053',
  dbStatus: 'EFFECTUEE',
  pay_id: 'OHZOU1hwYTd6U0h2WnR3cHViQ2xSZlF4UEhvRHA1Skc='
}
🔄 Mise à jour du statut de la demande d'avance: 207b15bd-95b0-4eb6-8fe1-83dd3c2f6053
📋 État actuel de la demande: {
  id: '207b15bd-95b0-4eb6-8fe1-83dd3c2f6053',
  statut: 'Validé',
  numero_reception: null
}
⚠️ Erreur lors de la mise à jour du statut de la demande: {
  code: '22001',
  details: null,
  hint: null,
  message: 'value too long for type character varying(20)'
}
🎉 Vérification du statut terminée avec succès
 POST /api/payments/lengo-status 200 in 1622ms
📧 Début de l'envoi des notifications d'avance
📋 Body reçu: {
  type: 'payment_success',
  paymentId: 'OHZOU1hwYTd6U0h2WnR3cHViQ2xSZlF4UEhvRHA1Skc='
}
🔍 Détails de la notification: {
  type: 'payment_success',
  requestId: undefined,
  paymentId: 'OHZOU1hwYTd6U0h2WnR3cHViQ2xSZlF4UEhvRHA1Skc=',
  motif_rejet: undefined
}
🔄 Envoi des notifications de paiement pour la transaction: OHZOU1hwYTd6U0h2WnR3cHViQ2xSZlF4UEhvRHA1Skc=
🔍 Recherche de la transaction avec numero_transaction: OHZOU1hwYTd6U0h2WnR3cHViQ2xSZlF4UEhvRHA1Skc=
✅ Transaction trouvée: {
  id: 'f5c4d308-db2d-40dd-ba4a-38cd74f440ad',
  numero_transaction: 'OHZOU1hwYTd6U0h2WnR3cHViQ2xSZlF4UEhvRHA1Skc=',
  statut: 'EFFECTUEE',
  montant: 1870
}
📱 Envoi SMS côté serveur: {
  to: [ '+224625212115' ],
  message: 'ZaLaMa - Paiement confirmé. Votre avance de 1 870 ...',
  sender_name: 'ZaLaMa'
}
✅ SMS envoyé avec succès côté serveur: {
  messageid: '0cde55d5-3cb2-4de0-b66b-4ac6137434b2',
  url: 'https://api.nimbasms.com/v1/messages/0cde55d5-3cb2-4de0-b66b-4ac6137434b2'
}
📱 SMS employé (paiement): ✅ Envoyé
📧 Début envoi email côté serveur: {
  to: [ 'mory.koulibaly@nimbasolution.com' ],
  subject: 'Paiement confirmé - Avance sur salaire',
  from: 'ZaLaMa <noreply@zalamagn.com>'
}
✅ Email envoyé avec succès côté serveur: {
  id: '20837326-26c4-404d-8c8d-1dc4d02ec7f5',
  to: [ 'mory.koulibaly@nimbasolution.com' ],
  subject: 'Paiement confirmé - Avance sur salaire'
}
📧 Email employé (paiement): ✅ Envoyé
Erreur lors de la notification des administrateurs: {
  code: '42703',
  details: null,
  hint: null,
  message: 'column admin_users.nom does not exist'
}
🎉 Envoi des notifications terminé
  - Succès: true
  - SMS envoyé: true
  - Email envoyé: true
 POST /api/advance/notifications 200 in 2575ms
 POST /api/auth/session 200 in 29ms
 POST /api/user/profile 200 in 341ms
 POST /api/user/profile 200 in 296ms
 POST /api/user/profile 200 in 332ms
 POST /api/user/profile 200 in 310ms
 POST /api/user/profile 200 in 300ms
 GET /dashboard/remboursements 200 in 70ms
 POST /api/auth/session 200 in 22ms
 GET /api/remboursements 200 in 349ms
 POST /api/user/profile 200 in 335ms
 GET /api/remboursements/statistiques 200 in 367ms
 GET /api/remboursements 200 in 198ms
 GET /api/remboursements/statistiques 200 in 211ms
 GET /dashboard/remboursements 200 in 252ms
 GET /favicon.ico 200 in 24ms
 POST /api/auth/session 200 in 26ms
 GET /favicon.ico 200 in 41ms
 POST /api/user/profile 200 in 407ms
 GET /api/remboursements 200 in 442ms
 GET /api/remboursements/statistiques 200 in 445ms
 POST /api/user/profile 200 in 193ms
 GET /api/remboursements/statistiques 200 in 212ms
 GET /api/remboursements 200 in 218ms
 POST /api/user/profile 200 in 177ms
 POST /api/auth/session 200 in 36ms
 POST /api/user/profile 200 in 2310ms
 POST /api/user/profile 200 in 2374ms
 POST /api/user/profile 200 in 2337ms