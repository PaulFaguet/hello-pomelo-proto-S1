import type { AppData, Evaluation, User } from './types'

// Qui peut voir quoi (règles 6, 8, 9 et 10). Toutes les vérifications d'accès passent par ce fichier.

export function isManagerOf(manager: User, subjectId: string, users: User[]): boolean {
  return users.some((u) => u.id === subjectId && u.managerId === manager.id)
}

// Règles 6 et 10 : ajouter une personne et clôturer sont réservés au créateur, à la personne évaluée et à son manager.
export function canManage(evaluation: Evaluation, user: User, users: User[]): boolean {
  return (
    evaluation.status === 'en_cours' &&
    (evaluation.createdBy === user.id || evaluation.subjectId === user.id || isManagerOf(user, evaluation.subjectId, users))
  )
}

// Règle 8 : l'avancement (statuts, compteurs) est visible du créateur, de la personne évaluée et de son manager.
// Un brouillon n'est visible que de son créateur.
export function canViewProgress(evaluation: Evaluation, user: User, users: User[]): boolean {
  if (evaluation.status === 'brouillon') return evaluation.createdBy === user.id
  return evaluation.createdBy === user.id || evaluation.subjectId === user.id || isManagerOf(user, evaluation.subjectId, users)
}

// Règle 9 : le contenu n'est visible qu'après clôture, et seulement par la personne évaluée et son manager.
// (L'auteur voit sa propre réponse depuis l'onglet Feedback, c'est géré à part.)
export function canViewContent(evaluation: Evaluation, user: User, users: User[]): boolean {
  return (
    evaluation.status === 'cloturee' &&
    (evaluation.subjectId === user.id || isManagerOf(user, evaluation.subjectId, users))
  )
}

// Règle 8 : un manager voit les évaluations des membres de SON équipe (jamais un brouillon, jamais une autre équipe).
export function teamEvaluations(data: AppData, manager: User): Evaluation[] {
  return data.evaluations.filter(
    (e) => e.status !== 'brouillon' && isManagerOf(manager, e.subjectId, data.users),
  )
}
