# Hello Pomelo, feedbacks internes — prototype

Prototype démontrable d'une plateforme interne de feedback entre collègues.
Pas de backend ni d'authentification : données fictives enregistrées dans le navigateur (localStorage).

**Stack** : React 19, Vite, TypeScript strict, Tailwind.

## Cadrage du sprint 1

À la racine du dépôt :

- [Cadrage Sprint 1 feedbacks internes.pdf](Cadrage%20Sprint%201%20feedbacks%20internes.pdf) : présentation du cadrage du sprint 1
- [Cadrage_Sprint1_Feedback.xlsx](Cadrage_Sprint1_Feedback.xlsx) : backlog du sprint 1 (user stories, priorisation)

## Lancer

Prérequis : Node.js 20+.

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:5173.

- **Profil simulé** (en haut à droite) : choisit la personne « connectée ». Le manager arrive sur « Mon équipe ».
- **Réinitialiser la démo** : recharge les données de départ.

## Profils

| Personne | Rôle |
|---|---|
| Marc Lefèvre | Manager |
| Léa Martin | Collaboratrice |
| Hugo Bernard | Collaborateur |
| Inès Roux | Collaboratrice |

Les données de départ couvrent tous les cas : une évaluation clôturée, des évaluations en cours (dont une en retard), l'auto-évaluation du manager et un brouillon.

## Parcours de démo

1. **Historique** : Léa → *Historique* → résultats de « Évaluation S1 2026 ».
2. **Créer et lancer** : Marc → *Créer une évaluation* pour Léa, interroger Hugo, *Lancer*.
3. **Répondre** : Hugo → *Feedback* → enregistrer en brouillon, reprendre, *Envoyer*.
4. **Suivre** : Léa → *Suivre* → ajouter puis retirer Inès.
5. **Cloisonnement** : Inès voit sa demande, mais ni l'évaluation de Léa ni ses résultats.
6. **Clôturer** : Marc → *Mon équipe* → *Clôturer* → *Voir les résultats*.

## Structure

| Dossier | Contenu |
|---|---|
| `src/domain` | Règles métier en fonctions pures : modèle, création, réponses, droits d'accès, résultats, données de départ |
| `src/screens` | Un composant par écran |
| `src/App.tsx` | Onglets, navigation, profil actif |
| `src/storage.ts` | Persistance localStorage versionnée |
| `src/index.css` | Charte inspirée de hello-pomelo.com |

## Hypothèses principales

- Vue manager unique : les 3 onglets, plus « Mon équipe ».
- Une fois la date limite dépassée, on peut encore répondre tant que l'évaluation n'est pas clôturée.
- Être interrogé ne donne pas accès à l'évaluation : on ne voit que sa propre demande.
- Les feedbacks sont nommés (pas d'anonymat).

## Hors périmètre

Espace admin, éditeur de formulaires, notifications, intégrations Slack/Teams, export PDF, anonymat, authentification, backend. Aucun test automatisé.
