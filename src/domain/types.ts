export type Role = 'user' | 'manager'

export interface User {
  id: string
  name: string
  role: Role
  managerId: string | null
}

export type QuestionType = 'note' | 'choix' | 'ouverte'

export interface Question {
  id: string
  type: QuestionType
  label: string
  required: boolean
  options?: string[]
}

export interface Form {
  id: string
  name: string
  questions: Question[]
}

export type EvaluationStatus = 'brouillon' | 'en_cours' | 'cloturee' | 'archivee'

export interface Evaluation {
  id: string
  name: string
  period: string
  deadline: string // date ISO "AAAA-MM-JJ"
  // Copie figée du formulaire : modifier le formulaire source n'altère pas les évaluations existantes.
  formSnapshot: Form
  subjectId: string
  createdBy: string
  participantIds: string[]
  status: EvaluationStatus
}

export type RequestStatus = 'envoye' | 'brouillon' | 'termine' | 'refuse' | 'expire'

export type Answer = string | number | string[]

export interface FeedbackRequest {
  id: string
  evaluationId: string
  authorId: string
  status: RequestStatus
  answers: Record<string, Answer>
  submittedAt?: string
}

export interface AppData {
  users: User[]
  forms: Form[]
  evaluations: Evaluation[]
  requests: FeedbackRequest[]
}
