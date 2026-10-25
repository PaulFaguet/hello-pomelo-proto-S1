import { useState } from 'react'
import { formatDate, todayISO } from '../domain/dates'
import { canAnswer, isLate, saveAnswerDraft, submitAnswers, validateAnswers } from '../domain/requests'
import type { Answer, AppData, Question, User } from '../domain/types'
import { Badge, Button, inputClass } from '../ui'

interface Props {
  data: AppData
  currentUser: User
  requestId: string
  onDone: (data: AppData, message: string) => void
  onBack: () => void
}

export default function Repondre({ data, currentUser, requestId, onDone, onBack }: Props) {
  const request = data.requests.find((r) => r.id === requestId)
  const evaluation = data.evaluations.find((e) => e.id === request?.evaluationId)
  const [answers, setAnswers] = useState<Record<string, Answer>>(() => request?.answers ?? {})
  const [triedSubmit, setTriedSubmit] = useState(false)

  // Garde-fou : on n'affiche une demande qu'à son auteur.
  if (!request || !evaluation || request.authorId !== currentUser.id) {
    return <p className="rounded-lg bg-cream p-10 text-center text-sm text-muted">Cette demande n'est pas accessible.</p>
  }

  const editable = canAnswer(request, evaluation, currentUser.id)
  const form = evaluation.formSnapshot
  const errors = validateAnswers(form, answers)
  const shownErrors = triedSubmit ? errors : {}
  const errorCount = Object.keys(shownErrors).length
  const subjectName = data.users.find((u) => u.id === evaluation.subjectId)?.name ?? '?'

  function setAnswer(questionId: string, value: Answer) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function handleSubmit() {
    setTriedSubmit(true)
    if (Object.keys(errors).length > 0) return
    onDone(submitAnswers(data, requestId, answers, new Date().toISOString()), `Feedback envoyé à ${subjectName}. Merci !`)
  }

  return (
    <div className="max-w-2xl">
      <button onClick={onBack} className="mb-4 text-sm text-muted hover:text-ink">
        ← Retour aux feedbacks
      </button>
      <h2 className="text-2xl font-semibold tracking-tight">{evaluation.name}</h2>
      <p className="mt-1 mb-8 flex items-center gap-2 text-sm text-muted">
        Feedback pour <span className="font-medium text-ink">{subjectName}</span> · {evaluation.period} · échéance{' '}
        {formatDate(evaluation.deadline)}
        {isLate(request, evaluation, todayISO()) && <Badge tone="brand">En retard</Badge>}
      </p>

      {!editable && (
        <p className="mb-6 rounded-lg bg-cream px-4 py-3 text-sm text-muted">
          {request.status === 'termine'
            ? `Réponse envoyée le ${formatDate(request.submittedAt?.slice(0, 10) ?? '')}. Elle n'est plus modifiable.`
            : "Cette évaluation n'accepte plus de réponse."}
        </p>
      )}

      {errorCount > 0 && (
        <p className="mb-6 rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand" role="alert">
          Envoi impossible : {errorCount} question{errorCount > 1 ? 's' : ''} obligatoire{errorCount > 1 ? 's' : ''} sans
          réponse.
        </p>
      )}

      <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
        {form.questions.map((q, i) => (
          <fieldset key={q.id} disabled={!editable} className="flex flex-col gap-3">
            <legend className="mb-3 font-medium">
              {i + 1}. {q.label} {q.required ? <span className="text-brand">*</span> : <span className="text-sm text-muted">(facultatif)</span>}
            </legend>
            <QuestionInput question={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
            {shownErrors[q.id] && <p className="text-sm text-brand">{shownErrors[q.id]}</p>}
          </fieldset>
        ))}

        {editable && (
          <div className="flex justify-end gap-3 border-t border-line pt-6">
            <Button type="button" onClick={() => onDone(saveAnswerDraft(data, requestId, answers), 'Brouillon enregistré. Vous pourrez le reprendre plus tard.')}>
              Enregistrer en brouillon
            </Button>
            <Button type="button" variant="primary" onClick={handleSubmit}>
              Envoyer
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

function QuestionInput({ question, value, onChange }: { question: Question; value: Answer | undefined; onChange: (v: Answer) => void }) {
  if (question.type === 'note') {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            className={`h-11 w-11 rounded-md text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
              value === n ? 'bg-brand text-white' : 'bg-cream hover:bg-line'
            }`}
          >
            {n}
          </button>
        ))}
        <span className="ml-2 self-center text-xs text-muted">1 = à améliorer · 5 = excellente</span>
      </div>
    )
  }

  if (question.type === 'choix') {
    const selected = Array.isArray(value) ? value : []
    return (
      <div className="flex flex-col gap-2">
        {question.options?.map((opt) => (
          <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt])}
              className="accent-brand"
            />
            {opt}
          </label>
        ))}
      </div>
    )
  }

  return (
    <textarea
      rows={4}
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Votre conseil…"
      className={`${inputClass} disabled:bg-cream`}
    />
  )
}
