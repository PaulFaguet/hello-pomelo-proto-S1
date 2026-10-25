import { useState } from 'react'
import { canManage, canViewContent, canViewProgress } from '../domain/access'
import { formatDate, todayISO } from '../domain/dates'
import { addParticipant, addParticipantError, closeEvaluation, isEvaluationLate, progress } from '../domain/evaluations'
import { EVALUATION_STATUS_LABELS, REQUEST_STATUS_LABELS } from '../domain/labels'
import type { AppData, User } from '../domain/types'
import { Badge, Button, ConfirmDialog, inputClass } from '../ui'

interface Props {
  data: AppData
  currentUser: User
  evaluationId: string
  onChange: (data: AppData, message: string) => void
  onBack: () => void
  onOpenResults: (evaluationId: string) => void
}

export default function SuiviEvaluation({ data, currentUser, evaluationId, onChange, onBack, onOpenResults }: Props) {
  const evaluation = data.evaluations.find((e) => e.id === evaluationId)
  const [newPerson, setNewPerson] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [confirmClose, setConfirmClose] = useState(false)

  // Règle 8 : garde-fou, même si l'interface ne propose jamais ce lien à une personne non autorisée.
  if (!evaluation || !canViewProgress(evaluation, currentUser, data.users)) {
    return <p className="rounded-lg bg-cream p-10 text-center text-sm text-muted">Vous n'avez pas accès à cette évaluation.</p>
  }

  const nameOf = (id: string) => data.users.find((u) => u.id === id)?.name ?? '?'
  const requests = data.requests.filter((r) => r.evaluationId === evaluation.id)
  const { done, total } = progress(evaluation, data.requests)
  const manageable = canManage(evaluation, currentUser, data.users)
  const late = isEvaluationLate(evaluation, todayISO())
  const candidates = data.users.filter((u) => !addParticipantError(evaluation, u.id))

  function handleAdd() {
    const error = addParticipantError(evaluation!, newPerson)
    if (error) return setAddError(error)
    onChange(addParticipant(data, evaluation!.id, newPerson), `${nameOf(newPerson)} a été ajouté·e : une demande lui est envoyée.`)
  }

  const notFinished = requests.filter((r) => r.status === 'envoye' || r.status === 'brouillon').length

  function handleClose() {
    setConfirmClose(false)
    onChange(closeEvaluation(data, evaluation!.id), `« ${evaluation!.name} » est clôturée. Les résultats sont disponibles.`)
  }

  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="mb-4 text-sm text-muted hover:text-ink">
        ← Retour
      </button>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{evaluation.name}</h2>
          <p className="mt-1 text-sm text-muted">
            Évalué·e : <span className="text-ink">{evaluation.subjectId === currentUser.id ? 'vous' : nameOf(evaluation.subjectId)}</span> ·{' '}
            {evaluation.period} · <span className={late ? 'font-medium text-brand' : ''}>échéance {formatDate(evaluation.deadline)}</span> ·
            créée par {evaluation.createdBy === currentUser.id ? 'vous' : nameOf(evaluation.createdBy)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {late && <Badge tone="brand">En retard</Badge>}
          <Badge tone={evaluation.status === 'en_cours' ? 'brand' : 'neutral'}>{EVALUATION_STATUS_LABELS[evaluation.status]}</Badge>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-cream p-5">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-3xl font-semibold">
            {done}/{total} <span className="text-base font-normal text-muted">terminés</span>
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-brand" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </div>
      </div>

      {evaluation.status === 'en_cours' && (
        <p className="mb-6 text-sm text-muted">
          Le contenu des réponses reste masqué jusqu'à la clôture. Seuls les statuts sont visibles.
        </p>
      )}

      <h3 className="mb-3 text-lg font-semibold">Personnes interrogées</h3>
      <ul className="mb-8 divide-y divide-line rounded-lg border border-line">
        {requests.map((r) => (
          <li key={r.id} className="flex items-center justify-between px-5 py-3">
            <span>{nameOf(r.authorId)}</span>
            <span className="flex items-center gap-3 text-sm text-muted">
              {r.submittedAt && `le ${formatDate(r.submittedAt.slice(0, 10))}`}
              <Badge tone={r.status === 'termine' ? 'brand' : 'neutral'}>{REQUEST_STATUS_LABELS[r.status]}</Badge>
            </span>
          </li>
        ))}
      </ul>

      {evaluation.status === 'cloturee' && (
        <div className="mb-8 flex items-center justify-between rounded-lg bg-cream px-5 py-4 text-sm">
          <span className="text-muted">Évaluation clôturée : elle ne peut plus être modifiée.</span>
          {canViewContent(evaluation, currentUser, data.users) && (
            <Button variant="primary" onClick={() => onOpenResults(evaluation.id)}>
              Voir les résultats
            </Button>
          )}
        </div>
      )}

      {manageable && (
        <section className="mb-8 rounded-lg border border-line p-5">
          <h3 className="mb-3 font-semibold">Ajouter une personne</h3>
          <div className="flex gap-3">
            <select
              value={newPerson}
              onChange={(e) => {
                setNewPerson(e.target.value)
                setAddError(null)
              }}
              className={`${inputClass} flex-1`}
              aria-label="Personne à ajouter"
            >
              <option value="">— Choisir une personne —</option>
              {candidates.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <Button variant="primary" onClick={handleAdd}>
              Ajouter une personne
            </Button>
          </div>
          {addError && <p className="mt-2 text-sm text-brand">{addError}</p>}
          {candidates.length === 0 && <p className="mt-2 text-sm text-muted">Tout le monde est déjà interrogé.</p>}
        </section>
      )}

      {manageable && (
        <section className="flex items-center justify-between rounded-lg border border-line p-5">
          <div>
            <h3 className="font-semibold">Clôturer l'évaluation</h3>
            <p className="text-sm text-muted">Fige l'évaluation et rend les résultats visibles. Action définitive.</p>
          </div>
          <Button onClick={() => setConfirmClose(true)}>Clôturer</Button>
        </section>
      )}

      {confirmClose && (
        <ConfirmDialog
          title={`Clôturer « ${evaluation.name} » ?`}
          confirmLabel="Clôturer définitivement"
          onConfirm={handleClose}
          onCancel={() => setConfirmClose(false)}
        >
          <p>
            {done} feedback{done > 1 ? 's' : ''} reçu{done > 1 ? 's' : ''} sur {total}.
            {notFinished > 0 &&
              ` ${notFinished} demande${notFinished > 1 ? 's' : ''} non terminée${notFinished > 1 ? 's' : ''} passer${notFinished > 1 ? 'ont' : 'a'} en « Expiré ».`}
          </p>
          <p className="mt-2">L'évaluation ne pourra plus être modifiée ni rouverte.</p>
        </ConfirmDialog>
      )}
    </div>
  )
}
