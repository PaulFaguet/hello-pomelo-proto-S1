import { formatDate, todayISO } from '../domain/dates'
import { canEditDraft, isEvaluationLate, myActiveEvaluations, progress } from '../domain/evaluations'
import { EVALUATION_STATUS_LABELS } from '../domain/labels'
import type { AppData, User } from '../domain/types'
import { Badge, Button } from '../ui'

interface Props {
  data: AppData
  currentUser: User
  onCreate: () => void
  onEditDraft: (evaluationId: string) => void
  onOpen: (evaluationId: string) => void
}

export default function MesEvaluations({ data, currentUser, onCreate, onEditDraft, onOpen }: Props) {
  const today = todayISO()
  const evaluations = myActiveEvaluations(data, currentUser.id)
  const nameOf = (id: string) => data.users.find((u) => u.id === id)?.name ?? '?'

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Mes évaluations</h2>
          <p className="mt-1 text-sm text-muted">Brouillons et évaluations en cours. Les évaluations clôturées sont dans l'Historique.</p>
        </div>
        <Button variant="primary" onClick={onCreate}>
          Créer une évaluation
        </Button>
      </div>

      {evaluations.length === 0 ? (
        <div className="rounded-lg bg-cream p-10 text-center text-sm text-muted">
          <p className="mb-4">Aucune évaluation en cours ou en brouillon.</p>
          <Button variant="primary" onClick={onCreate}>
            Créer ma première évaluation
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line">
          {evaluations.map((e) => {
            const { done, total } = progress(e, data.requests)
            const late = isEvaluationLate(e, today)
            return (
              <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold">{e.name || 'Sans titre'}</p>
                  <p className="text-sm text-muted">
                    Évalué·e : {e.subjectId === currentUser.id ? 'vous' : nameOf(e.subjectId)} · {e.period || '—'} ·{' '}
                    <span className={late ? 'font-medium text-brand' : ''}>échéance {formatDate(e.deadline)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {e.status === 'en_cours' && (
                    <span className="text-sm text-muted">
                      <span className="font-semibold text-ink">
                        {done}/{total}
                      </span>{' '}
                      terminés
                    </span>
                  )}
                  {late && <Badge tone="brand">En retard</Badge>}
                  <Badge tone={e.status === 'en_cours' ? 'brand' : 'neutral'}>{EVALUATION_STATUS_LABELS[e.status]}</Badge>
                  {canEditDraft(e, currentUser.id) ? (
                    <Button onClick={() => onEditDraft(e.id)} className="w-24">
                      Reprendre
                    </Button>
                  ) : (
                    <Button onClick={() => onOpen(e.id)} className="w-24">
                      Suivre
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
