Description
L'API de Lengo Pay est conçue pour offrir une connectivité sécurisée et fluide entre votre plateforme et la passerelle de paiement Lengo. Elle fournit des fonctionnalités permettant d'effectuer des transactions financières en utilisant les différents modes de paiement pris en charge par Lengo Pay, tels que les paiements mobiles, bancaires, les portefeuilles électroniques, les cartes Visa, Masrtercard et les cryptomonnaies.

Point de terminaison

POST https://portal.lengopay.com/api/v2/cashin/request
Utilisez cet endpoint pour initier une transaction de paiement Cash In.
En-têtes

Authorization : Basic {License key}
Accept : application/json
Content-Type : application/json
Corps de la requête

amount : Montant du paiement (ex. : "1000")
currency : Code de la devise (ex. : "GNF")
websiteid : Identifiant unique du site web
type_account : Type de compte (ex. : ["lp-om-gn", "lp-momo-gn"])
account : Identifiant du compte (ex. : "620124578")
callback_url : URL pour recevoir les mises à jour du statut (facultatif)
Exemple de requête
Requête :

POST /api/v2/cashin/request HTTP/1.1
Host: https://portal.lengopay.com
Authorization: Basic {License key}
Accept: application/json
Content-Type: application/json

{
  "amount": "1000",
  "currency": "GNF",
  "websiteid": "gboerA8juxk2XwN8",
  "type_account": "lp-om-gn",
  "account": "620124578",
  "callback_url": "https://merchant-site.com/callback"
}
Réponse
Retourne un objet JSON avec les propriétés suivantes :

status : Statut de la requête ("Success" ou "ERROR")
pay_id : Identifiant unique de la transaction, encodé en base64 (présent si succès)
message : Message décrivant le résultat
Réponse réussie :

{
  "status": "Success",
  "pay_id": "elNZc1FUZzduVzhQcjlYVWtkZ2pmVmRac1Z5anUxUG8",
  "message": "Request received successfully"
}
Requête Callback
Si une callback_url est fournie, le serveur enverra une requête POST à cette URL avec les détails de la transaction.

URL de rappel
Le callback URL reçoit une requête POST avec les paramètres suivants :

pay_id : Identifiant unique du paiement
status : Statut final de la transaction (ex. : SUCCESS, FAILED)
amount : Montant du paiement traité
message : Message décrivant le résultat
account : Numéro de téléphone qui doit recevoir le paiement
Exemple de requête de rappel

POST https://merchant-site.com/callback HTTP/1.1
Host: merchant-site.com
Content-Type: application/json

{
  "pay_id": RzFmb1JvVWwxWFJQaXBCaXFWM,
  "status": "SUCCESS",
  "amount": 1000,
  "message": "Transaction Successful",
  "account": "620124578"
}
Gestion des erreurs
Si la notification à votre callback_url échoue, le serveur réessaiera pendant une période limitée. Assurez-vous que votre serveur répond correctement aux requêtes POST pour éviter toute perte de données.

Erreurs
Cette API utilise les codes d'erreur suivants :

400 Bad Request : Requête mal formée ou paramètres manquants.
401 Unauthorized : Jeton d'authentification invalide ou manquant.
Remarques

Assurez-vous que le jeton Authorization est valide.
Le amount doit être une chaîne numérique valide.
Le currency doit être un code de devise pris en charge.
Le websiteid doit correspondre à un site web enregistré.
Le type_account doit être un type de compte valide.
Le callback_url, si fournie, doit être une URL HTTPS valide.