# Scripts utilitaires pour Madinia Dashboard

Ce dossier contient des scripts utilitaires pour le dashboard Madinia.

## CORS Proxy Server

Le proxy CORS résout les problèmes d'accès aux fichiers de Firebase Storage en fournissant un proxy qui ajoute les en-têtes CORS nécessaires.

### Installation

```bash
cd scripts
npm install
```

### Démarrage du serveur proxy

```bash
cd scripts
npm run proxy
```

Par défaut, le serveur écoute sur le port 3031. Vous pouvez modifier ce port en définissant la variable d'environnement PORT.

### Utilisation dans l'application

Le module `image-proxy.js` fournit des utilitaires pour transformer les URL Firebase Storage en URL proxy:

```javascript
import { getProxiedImageUrl, createProxiedImage } from '../scripts/image-proxy';

// Pour obtenir une URL proxifiée
const proxyUrl = getProxiedImageUrl(firebaseStorageUrl);

// Pour créer un élément Image avec une URL proxifiée
const imgElement = createProxiedImage(firebaseStorageUrl);
```

## Autres scripts

- `createCustomer.js` - Génère des clients de test dans Firestore
- `createInvoices.js` - Génère des factures de test dans Firestore
- `createBlog.js` - Génère des articles de blog de test dans Firestore
- `deleteUser.js` - Supprime des utilisateurs dans Firestore
- `update-admin-role.js` - Met à jour les rôles administrateur dans Firestore
