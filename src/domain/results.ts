import type { AppData, Evaluation, FeedbackRequest } from './types'

export interface EvaluationResults {
  answered: FeedbackRequest[] // demandes terminées, avec leur contenu
  unanswered: FeedbackRequest[] // demandes expirées (ou refusées)
  averageNote: number | null // moyenne des notes, null si aucune réponse
  choiceCounts: { option: string; count: number }[] // nombre de fois où chaque option a été cochée
}

// Synthèse affichée sur l'écran de résultats. Suppose un formulaire avec au plus une question "note" et une "choix".
export function computeResults(data: AppData, evaluation: Evaluation): EvaluationResults {
  const requests = data.requests.filter((r) => r.evaluationId === evaluation.id)
  const answered = requests.filter((r) => r.status === 'termine')
  const unanswered = requests.filter((r) => r.status !== 'termine')

  const noteQuestion = evaluation.formSnapshot.questions.find((q) => q.type === 'note')
  const notes = answered
    .map((r) => (noteQuestion ? r.answers[noteQuestion.id] : undefined))
    .filter((n): n is number => typeof n === 'number')
  const averageNote = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : null

  const choiceQuestion = evaluation.formSnapshot.questions.find((q) => q.type === 'choix')
  const choiceCounts = (choiceQuestion?.options ?? []).map((option) => ({
    option,
    count: answered.filter((r) => {
      const a = choiceQuestion ? r.answers[choiceQuestion.id] : undefined
      return Array.isArray(a) && a.includes(option)
    }).length,
  }))

  return { answered, unanswered, averageNote, choiceCounts }
}
