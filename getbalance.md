Description
L'API de Lengo Pay est conçue pour offrir une connectivité sécurisée et fluide entre votre plateforme et la passerelle de paiement Lengo. Elle fournit des fonctionnalités permettant d'effectuer des transactions financières en utilisant les différents modes de paiement pris en charge par Lengo Pay, tels que les paiements mobiles, bancaires, les portefeuilles électroniques, les cartes Visa, Masrtercard et les cryptomonnaies.

Endpoints

GET https://portal.lengopay.com/api/getbalance/{ID Site}
Utilisez ce endpoint pour obtenir le solde de votre compte Lengo Pay.
Headers

Authorization : Basic {license Key}
Accept : Application/json
Content-type : Application/json
Response
Retoune un objet JSON avec les propriétés suivantes:

status : Status du paiement
balance : Solde du compte
currency : Devise du solde
Example
Request :

GET /api/getbalance/gboerA8juxk2XwN8 HTTP/1.1
Host: portal.lengopay.com
Authorization: Basic {license key}
Accept: application/json
Content-Type: application/json

Response :

{
   "status": "Success",
   "balance": "7792",
   "currency": "GNF",
}
Réponse de l'API en JSON qui renvoie le solde du marchand.
Errors
Cette API utilise les codes d'erreur suivants :

400 Bad Request : La demande était mal formée ou il manquait les paramètres requis.
401 Unauthorized : La clé API fournie était invalide ou manquante.
404 Not Found : La ressource demandée n'a pas été trouvée.
500 Internal Server Error : Une erreur inattendue s'est produite sur le serveur.