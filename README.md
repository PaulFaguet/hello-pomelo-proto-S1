# Feedback entre collègues — prototype

Prototype démontrable (pas de la production) d'une plateforme interne de feedback entre collègues.
Aucun backend, aucune authentification : données fictives enregistrées dans le navigateur (localStorage).

## Lancer le prototype

Prérequis : Node.js 20 ou plus.

```bash
npm install
npm run dev
```

Ouvrir http://localhost:5173 (si le port est pris, Vite indique l'adresse exacte dans le terminal).

- **Profil simulé** (en haut à droite) : choisit la personne « connectée ».
- **Réinitialiser la démo** : recharge les données de départ (le profil actif est conservé).

## Les profils

Une seule équipe de 4 personnes.

| Repère | Personne | Rôle |
|---|---|---|
| Manager | Marc Lefèvre | manager de l'équipe |
| User 1 | Léa Martin | collaboratrice |
| User 2 | Hugo Bernard | collaborateur |
| User 3 | Inès Roux | collaboratrice |

## Données de départ

| Évaluation | Personne évaluée | Statut | Ce qu'elle illustre |
|---|---|---|---|
| Évaluation S1 2026 | User 1 | Clôturée | Historique et résultats dès le départ (2 terminés, 1 expiré) |
| Évaluation S2 2026 | User 3 | En cours | Tous les statuts de demande : terminé, brouillon, envoyé |
| Retour projet Atlas | User 2 | En cours, **en retard** | Créée par le manager ; date limite dépassée, réponses toujours possibles |
| Feedback management S2 | Manager | En cours | Le manager s'évalue lui-même |
| Point mi-parcours | User 2 | Brouillon | Brouillon incomplet, visible de son seul créateur |

## Parcours de démo en 6 étapes

1. **Historique** — Profil *User 1 (Léa)* → onglet *Historique* → *Voir les résultats* de « Évaluation S1 2026 » : note moyenne, réponses détaillées nommées, personne n'ayant pas répondu (expiré).
2. **Créer et lancer** — Profil *Manager (Marc)* → *Mes évaluations* → *Créer une évaluation*. Choisir *Léa Martin* comme personne évaluée. Cliquer *Lancer* à vide pour montrer les messages d'erreur (date limite au plus tôt demain, Lancer inactif sans personne). Interroger Hugo, puis *Lancer*.
3. **Répondre** — Profil *User 2 (Hugo)* → onglet *Feedback* (le compteur affiche 3) → *Répondre* sur la nouvelle évaluation de Léa. Donner une note, *Envoyer* → envoi bloqué (question obligatoire). *Enregistrer en brouillon*, revenir, *Reprendre*, compléter, *Envoyer*. La réponse devient non modifiable.
4. **Suivre** — Profil *User 1 (Léa)* → *Mes évaluations* → *Suivre* : compteur « 1/1 terminés », statuts par personne, contenu masqué. *Ajouter une personne* (Inès) : elle reçoit une demande, le compteur passe à « 1/2 ».
5. **Cloisonnement** — Profil *User 3 (Inès)* : elle voit la demande dans *Feedback*, mais ni l'évaluation de Léa dans *Mes évaluations*, ni ses résultats S1 dans *Historique*. Seuls Léa et son manager y ont accès.
6. **Clôturer et consulter** — Profil *Manager (Marc)* → *Mon équipe* → *Suivre* l'évaluation de Léa → *Clôturer* → confirmation (les demandes non terminées passent « Expiré »). *Voir les résultats*. Profil *User 1 (Léa)* → *Historique* : ses deux évaluations y sont.

## Règles métier et où les trouver

La logique métier est isolée dans des fonctions pures (`src/domain`), les écrans dans `src/screens` (un composant par écran).

| Fichier | Contenu |
|---|---|
| `src/domain/types.ts` | Modèle : User, Form, Evaluation, FeedbackRequest et leurs statuts |
| `src/domain/seed.ts` | Données de départ |
| `src/domain/evaluations.ts` | Création, validations, lancement, ajout de personne, clôture (règles 1 à 6, 10) |
| `src/domain/requests.ts` | Réponses, brouillon, champs obligatoires, retard, compteur (règles 7, 11) |
| `src/domain/access.ts` | Qui voit quoi, qui peut faire quoi (règles 6, 8, 9, 10) |
| `src/domain/results.ts` | Synthèse des résultats (moyenne, options cochées) |
| `src/storage.ts` | Sauvegarde localStorage (clé unique `feedback-prototype`, versionnée) |
| `src/index.css` | Couleurs et police (charte inspirée de hello-pomelo.com) |

## Hypothèses retenues

1. **Vue manager unique** : un manager a les 3 onglets + « Mon équipe ». À la création, il choisit « Moi-même » ou un membre de son équipe (pas de double profil manager/utilisateur).
2. **Question à choix** : plusieurs réponses possibles, au moins une obligatoire.
3. **Retard** : une fois la date limite dépassée, on peut toujours répondre tant que l'évaluation n'est pas clôturée. Le retard est seulement signalé visuellement ; l'expiration n'a lieu qu'à la clôture.
4. **Évaluation en brouillon** : visible et modifiable par son seul créateur. Elle s'enregistre sans aucune validation (même vide, elle apparaît « Sans titre »).
5. **Date limite** : strictement postérieure à aujourd'hui (au plus tôt demain).
6. **Personnes interrogées** : choisies parmi tous les collaborateurs (le code gère plusieurs équipes, la démo n'en compte qu'une). Être interrogé ne donne pas accès à l'évaluation : on ne voit que sa propre demande.
7. **Auto-évaluation d'un manager** : il n'a pas de manager au-dessus de lui, il est donc seul à pouvoir ajouter des personnes ou clôturer.
8. **Formulaire figé** : une copie du formulaire est enregistrée dans l'évaluation à sa création.
9. **Historique** : il liste les évaluations clôturées dont on peut voir le contenu (celles dont on est la personne évaluée, et celles de son équipe pour un manager).
10. **Données de départ** : le cahier des charges prévoyait 10 personnes, 2 équipes et « aucune évaluation en cours au départ ». La démo a été réduite à 1 manager et 3 collaborateurs, avec un corpus couvrant tous les cas. Le cloisonnement entre deux managers n'est donc plus démontrable à l'écran, mais il reste codé (`src/domain/access.ts`).

## Hors prototype

Non réalisés volontairement :

- Espace Admin
- Éditeur de formulaire (un seul formulaire « Feedback standard »)
- Intégrations Slack / Teams
- Notifications (in-app, e-mail)
- Refus d'une demande (le statut `refuse` existe dans le modèle, non utilisé)
- Archivage (le statut `archivee` existe dans le modèle, non utilisé)
- Export PDF
- Anonymat des feedbacks (les auteurs sont toujours nommés)
- Également : authentification, base de données, backend, import CSV, campagnes en masse, feedback spontané, tableau de bord avancé

## Historique du développement (session Claude Code du 25/10/2026)

Cette section retrace ce qui a été fait, pour reprendre le travail dans une nouvelle session Claude Code ou pour l'expliquer.

### Demande initiale

Un prompt détaillé demandait un prototype React + Vite + TypeScript strict + Tailwind, sans backend ni authentification, avec des données fictives dans localStorage. Il fixait :

- un modèle de données imposé (User, Form, Evaluation, FeedbackRequest et leurs statuts) ;
- 12 règles métier : création, validations, lancement, ajout de personnes, réponse, visibilité, confidentialité, clôture, compteur, historique ;
- 3 onglets, plus « Mon équipe » pour les managers ;
- une méthode en **6 étapes**, avec une pause et une validation entre chaque, un commit par étape et la logique métier isolée dans `src/domain` ;
- au départ : 2 managers et 8 collaborateurs, 1 formulaire, 1 seule évaluation clôturée et aucune évaluation en cours.

### Ce qui a été fait, étape par étape

| Étape | Demandé | Réalisé | Commit |
|---|---|---|---|
| 1. Socle | Projet, types, données, persistance, sélecteur de profil, onglets vides, Réinitialiser | Conforme. Clé localStorage unique et versionnée, Réinitialiser avec confirmation (garde le profil actif) | `f078bf9` |
| 2. Créer et lancer | Écran de création, règles 1 à 5, brouillon / Lancer | Conforme. Une liste minimale « Mes évaluations » a été ajoutée dès cette étape pour pouvoir reprendre un brouillon | `ee8564b` |
| 3. Répondre | Onglet Feedback (liste, retard, statut, compteur), écran de réponse (règle 7) | Conforme. Ajout d'une section « Déjà traités » et d'un affichage en lecture seule de sa propre réponse | `4a84966` |
| 4. Suivre | Statuts par personne, compteur « x/y terminés », contenu masqué, ajout de personne, Mon équipe | Conforme. Mon équipe affiche aussi 3 chiffres clés (en cours, en retard, clôturées) | `01e3cc7` |
| 5. Clôturer et consulter | Clôture avec confirmation, historique, résultats, contrôle d'accès | Conforme. Écran de résultats : note moyenne, options cochées, réponses nommées, personnes sans réponse | `1262402` |
| 6. Finitions | États vides, erreurs, cohérence visuelle, README | Conforme. Fermeture de la confirmation avec Échap | `d37ac87` |

**Écart de méthode** : les étapes 1 à 3 ont été validées une par une. Pour les étapes 4 à 6, la consigne a été « termine le proto entier, on jugera au final » : elles ont été enchaînées sans validation intermédiaire, toujours avec un commit par étape.

### Modifications demandées en cours de route

| Demande | Ce qui a changé | Commit |
|---|---|---|
| Reprendre la direction artistique de hello-pomelo.com | Couleurs relevées sur le site (encre `#111821`, framboise `#D9306B`, crème `#F7F6F3`), police Fustat, styles des boutons et étiquettes. Tout est dans `src/index.css` | `7bcf3a7` |
| Déplacer le projet sur le Bureau | Dossier déplacé de `~/hello pomelo` vers `~/Desktop/hello pomelo`, historique git intact | — |
| Ajouter des données d'exemple couvrant tous les cas | Corpus de départ avec tous les statuts d'évaluation et de demande, un cas en retard, l'auto-évaluation d'un manager, un brouillon | `93da8c8` |
| Réduire à 1 manager et 3 collaborateurs | 10 personnes → 4 (Marc, Léa, Hugo, Inès). Corpus, README et parcours de démo réécrits | `b6b1995` |
| Griser le champ Formulaire | Champ inactif tant qu'il n'existe qu'un formulaire, avec une explication en dessous. Il se réactive tout seul si un 2e formulaire est ajouté | `a8ac2ab` |

### Écarts par rapport au prompt initial (assumés)

- **Vue manager unique** au lieu de deux profils « Marc (manager) » et « Marc (utilisateur) ». Le prompt laissait le choix, j'ai pris la plus simple.
- **4 personnes au lieu de 10** et **des évaluations en cours dès le départ**, à la demande. Conséquence : on ne peut plus montrer à l'écran le cloisonnement entre deux managers, mais il reste codé dans `src/domain/access.ts`.
- **Évaluations clôturées** : elles quittent « Mes évaluations » et vont dans « Historique ».
- **Brouillon d'évaluation** : il s'enregistre sans aucune validation. La règle 4 dit « à tout moment ».

### Problèmes rencontrés

| Problème | Résolution |
|---|---|
| `npm install` a installé les dernières versions (Vite 8, TypeScript 7, Tailwind 4) | Elles fonctionnent. À rétrograder vers TypeScript 5.x en cas de souci sur un autre poste |
| La police des titres du site (Archia) est payante | Remplacée par Fustat (Google Fonts), celle du texte courant du site |
| Le logo Hello Pomelo n'a pas été copié | Remplacé par un point framboise |
| Les polices viennent de Google Fonts | Sans internet, la police système prend le relais (rendu un peu différent) |
| Le port 5173 était occupé pendant les tests (un `npm run dev` lancé en parallèle) | Vite bascule tout seul sur 5174 et l'indique dans le terminal |
| Les données localStorage ne correspondaient plus après un changement du corpus | `STORAGE_VERSION` incrémenté dans `src/storage.ts` (actuellement 3) : les anciennes données sont remplacées au rechargement |
| Un script de test cliquait sur une évaluation clôturée au lieu de l'évaluation en cours | Erreur du script de test, pas de l'application. Script corrigé, parcours rejoué avec succès |

### Comment le prototype a été vérifié

- `npm run build` (compilation TypeScript stricte puis build) passe à chaque commit.
- Vérifications manuelles dans le navigateur, à chaque étape : validations, compteurs, brouillons, clôture, accès par profil.
- Les droits d'accès ont été contrôlés pour chaque évaluation de départ : qui voit l'avancement, qui voit le contenu, qui peut ajouter ou clôturer.
- Le parcours de démo en 6 étapes ci-dessus a été rejoué en entier.
- **Il n'y a aucun test automatisé.**

### Reprendre avec une nouvelle session Claude Code

Contexte à donner à la session : « Lis le README, puis `src/domain/types.ts` et `src/App.tsx` ». Les conventions à respecter :

- **Règles métier** : uniquement dans `src/domain`, sous forme de fonctions pures (données en entrée, nouvelles données en sortie). Les droits d'accès passent tous par `src/domain/access.ts`.
- **Un composant par écran** dans `src/screens`. Les petits éléments partagés (Button, Field, Badge, ConfirmDialog) sont dans `src/ui.tsx`.
- **Navigation** : il n'y a pas de routeur. `App.tsx` contient l'onglet actif et un état `Screen` (`tab`, `creer`, `repondre`, `suivi`, `resultats`). Un nouvel écran se déclare en ajoutant un cas à `Screen` et une branche dans le rendu.
- **Données de départ** : `src/domain/seed.ts`. **À chaque modification du corpus ou du modèle, incrémenter `STORAGE_VERSION`** dans `src/storage.ts`.
- **Charte** : couleurs et police uniquement dans `src/index.css`. Utiliser les classes `text-ink`, `bg-brand`, `bg-cream`, etc. plutôt que des couleurs en dur.
- **Interface et commits** en français, un commit par changement cohérent.

### Points ouverts et suite possible

- Rédiger le **sprint backlog** (objectif de sprint, user stories avec critères d'acceptation, priorisation, risques, cadre de pilotage). C'est le livrable principal de l'étude de cas, il n'est pas encore produit.
- Compléter le **journal IA** ci-dessous.
- Vocabulaire : le cahier des charges parle des statuts « Envoyé → En cours → Terminé », le prototype affiche « Brouillon » pour l'état intermédiaire d'une demande. À aligner si besoin, en changeant le libellé dans `src/domain/labels.ts`.
- Questions à poser à la direction : règles de confidentialité (qui voit le contenu, anonymat ou non), information des salariés et CSE, nom « Évaluation » ou « Demande de feedback ».

## Journal : ce que l'IA a produit / ce que j'ai corrigé

| Date | Ce que l'IA a produit | Ce que j'ai corrigé ou décidé |
|---|---|---|
| | | |
| | | |
| | | |
