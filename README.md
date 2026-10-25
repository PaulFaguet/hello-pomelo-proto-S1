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

| Repère | Personne | Rôle |
|---|---|---|
| Manager 1 | Marc Lefèvre | manager de l'équipe 1 |
| User 1 à 4 | Léa Martin, Hugo Bernard, Inès Roux, Tom Dupuis | équipe 1 |
| Manager 2 | Sophie Garnier | manager de l'équipe 2 |
| User 5 à 8 | Nina Faure, Paul Girard, Emma Blanc, Lucas Petit | équipe 2 |

## Données de départ

| Évaluation | Personne évaluée | Statut | Ce qu'elle illustre |
|---|---|---|---|
| Évaluation S1 2026 | User 1 | Clôturée | Historique et résultats dès le départ (4 terminés, 1 expiré) |
| Bilan S1 2026 | User 6 | Clôturée | Créée par le manager 2 ; un user de l'équipe 1 y a répondu |
| Évaluation S2 2026 | User 3 | En cours | Tous les statuts de demande : terminé, brouillon, envoyé |
| Retour projet Atlas | User 5 | En cours, **en retard** | Date limite dépassée, réponses toujours possibles |
| Feedback management S2 | Manager 2 | En cours | Un manager qui s'évalue lui-même |
| Point mi-parcours | User 4 | Brouillon | Brouillon incomplet, visible de son seul créateur |

## Parcours de démo en 6 étapes

1. **Historique** — Profil *User 1 (Léa)* → onglet *Historique* → *Voir les résultats* de « Évaluation S1 2026 » : note moyenne, réponses détaillées nommées, personne n'ayant pas répondu (expiré).
2. **Créer et lancer** — Profil *Manager 1 (Marc)* → *Mes évaluations* → *Créer une évaluation*. Choisir *Hugo Bernard* comme personne évaluée (seule son équipe est proposée). Cliquer *Lancer* à vide pour montrer les messages d'erreur (date limite au plus tôt demain, Lancer inactif sans personne). Interroger Léa et Nina, puis *Lancer*.
3. **Répondre** — Profil *User 1 (Léa)* → onglet *Feedback* (le compteur affiche 1) → *Répondre*. Donner une note, *Envoyer* → envoi bloqué (question obligatoire). *Enregistrer en brouillon*, revenir, *Reprendre*, compléter, *Envoyer*. La réponse devient non modifiable.
4. **Suivre** — Profil *User 2 (Hugo)* → *Mes évaluations* → *Suivre* : compteur « 1/2 terminés », statuts par personne, contenu masqué. *Ajouter une personne* (Inès) : elle reçoit une demande.
5. **Cloisonnement** — Profil *Manager 2 (Sophie)* → *Mon équipe* : elle ne voit que son équipe (dont « Retour projet Atlas » en retard), jamais l'évaluation d'Hugo. Profil *User 3 (Inès)* : elle voit la demande dans *Feedback*, mais pas l'évaluation d'Hugo dans *Mes évaluations*.
6. **Clôturer et consulter** — Profil *Manager 1 (Marc)* → *Mon équipe* → *Suivre* l'évaluation d'Hugo → *Clôturer* → confirmation (les demandes non terminées passent « Expiré »). *Voir les résultats*. Profil *User 2 (Hugo)* → *Historique* : les résultats y sont.

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
6. **Personnes interrogées** : choisies dans toutes les équipes. Être interrogé ne donne pas accès à l'évaluation : on ne voit que sa propre demande.
7. **Auto-évaluation d'un manager** : il n'a pas de manager au-dessus de lui, il est donc seul à pouvoir ajouter des personnes ou clôturer.
8. **Formulaire figé** : une copie du formulaire est enregistrée dans l'évaluation à sa création.
9. **Historique** : il liste les évaluations clôturées dont on peut voir le contenu (celles dont on est la personne évaluée, et celles de son équipe pour un manager).
10. **Données de départ** : le cahier des charges prévoyait « aucune évaluation en cours au départ » ; un corpus couvrant tous les cas a été ajouté à la demande. La démo peut toujours en créer en direct.

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
