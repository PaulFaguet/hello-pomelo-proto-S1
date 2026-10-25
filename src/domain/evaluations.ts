import type { AppData, Evaluation, FeedbackRequest, User } from './types'

// Ce que saisit l'utilisateur dans l'écran "Créer une évaluation".
export interface EvaluationInput {
  name: string
  period: string
  deadline: string // "AAAA-MM-JJ"
  formId: string
  subjectId: string
  participantIds: string[]
}

export type EvaluationErrors = Partial<Record<keyof EvaluationInput, string>>

export function getTeam(managerId: string, users: User[]): User[] {
  return users.filter((u) => u.managerId === managerId)
}

// Règle 1 : un user ne crée que pour lui-même ; un manager pour lui-même ou un membre de SON équipe.
export function allowedSubjects(creator: User, users: User[]): User[] {
  return creator.role === 'manager' ? [creator, ...getTeam(creator.id, users)] : [creator]
}

// Règle 3 : tout le monde peut être interrogé, sauf la personne évaluée.
export function eligibleParticipants(subjectId: string, users: User[]): User[] {
  return users.filter((u) => u.id !== subjectId)
}

// Règle 3 : pas de doublon, jamais la personne évaluée.
export function normalizeParticipants(ids: string[], subjectId: string): string[] {
  return [...new Set(ids)].filter((id) => id !== subjectId)
}

// Règles 1 à 4 : tout ce qui doit être vrai pour lancer. Retourne un message par champ en erreur.
export function validateForLaunch(
  input: EvaluationInput,
  creator: User,
  users: User[],
  today: string,
): EvaluationErrors {
  const errors: EvaluationErrors = {}
  if (!input.name.trim()) errors.name = 'Le nom est obligatoire.'
  if (!input.period.trim()) errors.period = 'La période est obligatoire.'
  if (!input.deadline) errors.deadline = 'La date limite est obligatoire.'
  // Comparaison de chaînes "AAAA-MM-JJ" : l'ordre alphabétique est l'ordre chronologique.
  else if (input.deadline <= today) errors.deadline = "La date limite doit être postérieure à aujourd'hui."
  if (!input.formId) errors.formId = 'Choisissez un formulaire.'
  if (!allowedSubjects(creator, users).some((u) => u.id === input.subjectId)) {
    errors.subjectId = "Vous ne pouvez pas créer d'évaluation pour cette personne."
  }
  if (input.participantIds.length === 0) {
    errors.participantIds = 'Ajoutez au moins une personne à interroger.'
  } else if (input.participantIds.includes(input.subjectId)) {
    errors.participantIds = 'La personne évaluée ne peut pas être interrogée.'
  }
  return errors
}

export function hasErrors(errors: EvaluationErrors): boolean {
  return Object.keys(errors).length > 0
}

// Seul le créateur peut reprendre un brouillon, et seulement tant qu'il n'est pas lancé.
export function canEditDraft(evaluation: Evaluation, userId: string): boolean {
  return evaluation.status === 'brouillon' && evaluation.createdBy === userId
}

function upsertEvaluation(
  data: AppData,
  input: EvaluationInput,
  creatorId: string,
  existingId: string | undefined,
  status: Evaluation['status'],
): { data: AppData; evaluation: Evaluation } {
  const form = data.forms.find((f) => f.id === input.formId) ?? data.forms[0]
  const evaluation: Evaluation = {
    id: existingId ?? crypto.randomUUID(),
    name: input.name.trim(),
    period: input.period.trim(),
    deadline: input.deadline,
    formSnapshot: structuredClone(form),
    subjectId: input.subjectId,
    createdBy: creatorId,
    participantIds: normalizeParticipants(input.participantIds, input.subjectId),
    status,
  }
  const evaluations = existingId
    ? data.evaluations.map((e) => (e.id === existingId ? evaluation : e))
    : [...data.evaluations, evaluation]
  return { data: { ...data, evaluations }, evaluation }
}

// Règle 4 : un brouillon s'enregistre à tout moment, sans validation.
export function saveDraft(data: AppData, input: EvaluationInput, creatorId: string, existingId?: string): AppData {
  return upsertEvaluation(data, input, creatorId, existingId, 'brouillon').data
}

// Règle 5 : au lancement, l'évaluation passe "en_cours" et chaque personne interrogée reçoit une demande "envoye".
// L'appelant doit avoir vérifié validateForLaunch au préalable.
export function launchEvaluation(
  data: AppData,
  input: EvaluationInput,
  creatorId: string,
  existingId?: string,
): AppData {
  const result = upsertEvaluation(data, input, creatorId, existingId, 'en_cours')
  const newRequests: FeedbackRequest[] = result.evaluation.participantIds.map((authorId) => ({
    id: crypto.randomUUID(),
    evaluationId: result.evaluation.id,
    authorId,
    status: 'envoye',
    answers: {},
  }))
  return { ...result.data, requests: [...result.data.requests, ...newRequests] }
}

// Liste provisoire de "Mes évaluations" (enrichie à l'étape 4) :
// mes brouillons + les évaluations en cours que j'ai créées ou dont je suis le sujet.
export function myActiveEvaluations(data: AppData, userId: string): Evaluation[] {
  return data.evaluations.filter(
    (e) =>
      (e.status === 'brouillon' && e.createdBy === userId) ||
      (e.status === 'en_cours' && (e.createdBy === userId || e.subjectId === userId)),
  )
}
