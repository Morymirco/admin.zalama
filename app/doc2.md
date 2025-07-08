Description
L'API de Lengo Pay est conçue pour offrir une connectivité sécurisée et fluide entre votre plateforme et la passerelle de paiement Lengo. Elle fournit des fonctionnalités permettant d'effectuer des transactions financières en utilisant les différents modes de paiement pris en charge par Lengo Pay, tels que les paiements mobiles, bancaires, les portefeuilles électroniques, les cartes Visa, Masrtercard et les cryptomonnaies.

Endpoints

POST https://portal.lengopay.com/api/v2/cashin/transaction
Utilisez ce endpoint pour vérifier la status de votre paiement Cash In.
Headers

Authorization : Basic {license Key}
Accept : Application/json
Content-type : Application/json
Body

pay_id : Identifiant unique du paiement
websiteid : Identifiant unique du site "ID Site"
Response
Retoune un objet JSON avec les propriétés suivantes:

status : Status du paiement
pay_id : Identifiant du paiement
amount : Montant du paiement
account : Numéro de téléphone qui doit recevoir le paiement
date : Date du paiement
Example
Request :

POST /api/v2/cashin/transactions HTTP/1.1
Host: portal.lengopay.com
Authorization: Basic {license key}
Accept: application/json
Content-Type: application/json
Postman-Token: e18f3aac-9bd7-ddc5-a3a4-668e6089a0d5

{
 "pay_id": "elNZc1FUZzduVzhQcjlYVWtkZ2pmVmRac1Z5anUxUG8=",
 "websiteid": "ad8b9717",
}
Response :

{
 "status": "SUCCESS",
 "pay_id": "elNZc1FUZzduVzhQcjlYVWtkZ2pmVmRac1Z5anUxUG8=",
 "amount": 1000,
 "account": 620123456,
 "date": "2023-11-20 09:37:53",
}
Réponse de l'API en JSON qui renvoie le status du paiement.
Errors
Cette API utilise les codes d'erreur suivants :

400 Bad Request : La demande était mal formée ou il manquait les paramètres requis.
401 Unauthorized : La clé API fournie était invalide ou manquante.
404 Not Found : La ressource demandée n'a pas été trouvée.
500 Internal Server Error : Une erreur inattendue s'est produite sur le serveur.