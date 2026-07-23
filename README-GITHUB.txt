PORTFOLIO ANAËLLE — VERSION GITHUB PAGES

Ce dossier contient tout ce qui doit être envoyé dans un dépôt GitHub :
- index.html
- 404.html
- favicon.svg
- dossier assets
- dossier images
- dossier gallery
- fichier .nojekyll
- admin.html et admin.js pour gérer le blog
- blog-data.js contenant les articles
- firebase-config.js et firebase-blog.js pour la synchronisation en direct
- firestore.rules avec les règles sécurisées recommandées

Publication :
1. Créez un dépôt GitHub.
2. Envoyez tout le contenu de ce dossier à la racine du dépôt.
3. Dans Settings > Pages, sélectionnez Deploy from a branch.
4. Choisissez la branche main et le dossier /(root), puis Save.

Important : ne supprimez et ne renommez pas les dossiers assets, images ou gallery.

Configuration Firebase indispensable :
1. Dans Firebase Authentication, activez le fournisseur Adresse e-mail/Mot de passe.
2. Créez le compte de la propriétaire du site.
3. Dans Firestore Database > Rules, remplacez les règles temporaires par le contenu de firestore.rules.
4. Publiez ensuite tout ce dossier sur GitHub Pages.

Mise à jour du blog en direct :
1. Ouvrez https://votre-site.github.io/votre-depot/admin.html.
2. Connectez-vous avec le compte Firebase de la propriétaire.
3. Ajoutez ou modifiez les articles.
4. Cliquez sur Enregistrer toutes les modifications.
5. Le blog public se met à jour automatiquement grâce à Firestore.
