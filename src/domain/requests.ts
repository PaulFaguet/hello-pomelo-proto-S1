import type { Answer, AppData, Evaluation, FeedbackRequest, Form } from './types'

// Une demande est "à compléter" tant qu'elle n'est ni terminée ni expirée et que son évaluation est en cours.
export function isPending(request: FeedbackRequest, evaluation: Evaluation): boolean {
  return evaluation.status === 'en_cours' && (request.status === 'envoye' || request.status === 'brouillon')
}

// Règle 11 : compteur affiché sur l'onglet "Feedback".
export function pendingCount(data: AppData, userId: string): number {
  return myRequests(data, userId).filter(({ request, evaluation }) => isPending(request, evaluation)).length
}

// Les demandes adressées à l'utilisateur, avec leur évaluation (on ignore les évaluations en brouillon : aucune demande n'y existe).
export function myRequests(data: AppData, userId: string): { request: FeedbackRequest; evaluation: Evaluation }[] {
  return data.requests
    .filter((r) => r.authorId === userId)
    .map((request) => ({ request, evaluation: data.evaluations.find((e) => e.id === request.evaluationId)! }))
    .filter(({ evaluation }) => evaluation && evaluation.status !== 'brouillon')
    .sort((a, b) => a.evaluation.deadline.localeCompare(b.evaluation.deadline))
}

// Retard : date limite dépassée alors que la demande est encore à compléter. On peut toujours répondre (hypothèse 3).
export function isLate(request: FeedbackRequest, evaluation: Evaluation, today: string): boolean {
  return isPending(request, evaluation) && evaluation.deadline < today
}

// Règle 7 : seul l'auteur répond, uniquement si l'évaluation est en cours et la demande pas encore envoyée.
export function canAnswer(request: FeedbackRequest, evaluation: Evaluation, userId: string): boolean {
  return request.authorId === userId && isPending(request, evaluation)
}

function isEmpty(answer: Answer | undefined): boolean {
  if (answer === undefined) return true
  if (typeof answer === 'string') return answer.trim() === ''
  if (Array.isArray(answer)) return answer.length === 0
  return false
}

// Règle 7 : l'envoi est bloqué si une question obligatoire est vide. Retourne un message par question en erreur.
export function validateAnswers(form: Form, answers: Record<string, Answer>): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const q of form.questions) {
    if (q.required && isEmpty(answers[q.id])) {
      errors[q.id] = q.type === 'choix' ? 'Cochez au moins une réponse.' : 'Cette question est obligatoire.'
    }
  }
  return errors
}

function updateRequest(data: AppData, requestId: string, patch: Partial<FeedbackRequest>): AppData {
  return { ...data, requests: data.requests.map((r) => (r.id === requestId ? { ...r, ...patch } : r)) }
}

// Brouillon : réponses conservées, reprise possible.
export function saveAnswerDraft(data: AppData, requestId: string, answers: Record<string, Answer>): AppData {
  return updateRequest(data, requestId, { status: 'brouillon', answers })
}

// Envoi : la demande passe "termine" et n'est plus modifiable. L'appelant doit avoir vérifié validateAnswers.
export function submitAnswers(data: AppData, requestId: string, answers: Record<string, Answer>, now: string): AppData {
  return updateRequest(data, requestId, { status: 'termine', answers, submittedAt: now })
}
