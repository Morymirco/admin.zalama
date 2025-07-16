Description
L'API de Lengo Pay est conçue pour offrir une connectivité sécurisée et fluide entre votre plateforme et la passerelle de paiement Lengo. Elle fournit des fonctionnalités permettant d'effectuer des transactions financières en utilisant les différents modes de paiement pris en charge par Lengo Pay, tels que les paiements mobiles, bancaires, les portefeuilles électroniques, les cartes Visa, Masrtercard et les cryptomonnaies.

Endpoints

POST https://portal.lengopay.com/api/v1/payments
Utilisez ce endpoint pour générer votre URL de paiement. Une URL doit être généré pour chaque paiement.
Headers

Authorization : Basic {license Key}
Accept : Application/json
Content-type : Application/json
Body

websiteid : Identifiant unique de votre site "ID SITE"
amount : Montant du paiement
currency : Monnaie utiliser pour le paiement. Ex: GNF, XOF, USD, etc...
return_url : Url de retour vers le site du marchand (Ce paramètre n'est pas obligatoire)
callback_url : Url de notification callback (Ce paramètre n'est pas obligatoire)
Response
Retoune un objet JSON avec les propriétés suivantes:

status : Status de la requête
pay_id : Identifiant du paiement
payment_url : URL de paiement générée par la requête
Example
Request :

POST /api/v1/payments HTTP/1.1
Host: portal.lengopay.com
Authorization: Basic {license key}
Accept: application/json
Content-Type: application/json

{
  "websiteid": "ad8b9717",
  "currency": "GNF",
  "amount": 1500,
}
Response :

{
  "status": "Success",
  "pay_id": "WTVWaTBOUXVlNTB1NXNzbUhldGF0eENSV3VkeTJuV3E=",
  "payment_url": "https://payment.lengopay.com/WTVWaTBOUXVlNTB1NXNzbUhldGF0eENSV3VkeTJuV3E="
}
Réponse de l'API en JSON qui renvoie l'ID de paiement et l'URL de paiement.
Errors
Cette API utilise les codes d'erreur suivants :

400 Bad Request : La demande était mal formée ou il manquait les paramètres requis.
401 Unauthorized : La clé API fournie était invalide ou manquante.
404 Not Found : La ressource demandée n'a pas été trouvée.
500 Internal Server Error : Une erreur inattendue s'est produite sur le serveur.
Callback Notifications
Après le traitement d'un paiement, si un {callback_url} est fourni dans le corps de la requête, notre système enverra une notification HTTP POST à cette URL avec les détails de la transaction.

Callback URL
Le callback URL reçoit une requête POST avec les paramètres suivants :

pay_id : Identifiant unique du paiement
status : Le statut final de la transaction. Ex: SUCCESS, FAILED
amount : Montant du paiement traité
message : Un message décrivant le résultat de la transaction
Exemple de requête Callback
Lorsque la transaction est complétée, voici un exemple de requête POST envoyée à votre {callback_url}:

POST {callback_url} HTTP/1.1
Host: merchant-site.com
Content-Type: application/json

{
 "pay_id": "123456789",
 "status": "SUCCESS",
 "amount": 1500,
 "message": "Transaction Successful",
 "Client": "624897845"
}
Gestion des erreurs
Si la notification à votre {callback_url} échoue, notre serveur continuera d'essayer pendant une période limitée. Assurez-vous que votre serveur peut répondre correctement aux requêtes POST pour éviter toute perte de données.