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

## Journal : ce que l'IA a produit / ce que j'ai corrigé

| Date | Ce que l'IA a produit | Ce que j'ai corrigé ou décidé |
|---|---|---|
| | | |
| | | |
| | | |
