# Top Saphir

Site Node.js qui lit la feuille Google Sheets `achat de saphir`, regroupe les lignes par colonne `Client`, additionne `Nombre de Saphir` et affiche le classement.

## Sécurité importante

La clé de compte de service précédemment partagée ne doit pas être utilisée en production.
Révoquez-la dans Google Cloud et créez une nouvelle clé. Le fichier de credentials n'est volontairement pas inclus dans cette archive.

## Lancement local

1. Créez une nouvelle clé JSON pour le compte de service.
2. Enregistrez-la à la racine du projet sous le nom `credentials.json`.
3. Vérifiez que le Google Sheet est partagé avec le compte de service.
4. Lancez :

    npm install
    npm start

5. Ouvrez http://localhost:3000

## Déploiement

Définissez les variables :
- `SPREADSHEET_ID` : `1G5zrFDupHKhrFrhdDPL93g0QKs3EI0BkdXipHSVNHuI`
- `SHEET_NAME` : `achat de saphir`
- `GOOGLE_SERVICE_ACCOUNT_JSON` : contenu complet de votre NOUVELLE clé JSON

Commande de build : `npm install`
Commande de démarrage : `npm start`

Le serveur utilise la colonne `Client` et la colonne `Nombre de Saphir`.
