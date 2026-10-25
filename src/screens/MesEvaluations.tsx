import { formatDate } from '../domain/dates'
import { canEditDraft, myActiveEvaluations } from '../domain/evaluations'
import { EVALUATION_STATUS_LABELS } from '../domain/labels'
import type { AppData, User } from '../domain/types'
import { Badge, Button } from '../ui'

interface Props {
  data: AppData
  currentUser: User
  onCreate: () => void
  onEditDraft: (evaluationId: string) => void
}

// Version provisoire : la vue de suivi détaillée (statuts par personne, ajout, clôture) arrive à l'étape 4.
export default function MesEvaluations({ data, currentUser, onCreate, onEditDraft }: Props) {
  const evaluations = myActiveEvaluations(data, currentUser.id)
  const nameOf = (id: string) => data.users.find((u) => u.id === id)?.name ?? '?'

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Mes évaluations</h2>
        <Button variant="primary" onClick={onCreate}>
          Créer une évaluation
        </Button>
      </div>

      {evaluations.length === 0 ? (
        <p className="rounded-lg bg-cream p-10 text-center text-sm text-muted">
          Aucune évaluation en cours ou en brouillon.
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line">
          {evaluations.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-semibold">{e.name || 'Sans titre'}</p>
                <p className="text-sm text-muted">
                  Évalué·e : {e.subjectId === currentUser.id ? 'vous' : nameOf(e.subjectId)} · {e.period || '—'} ·
                  échéance {formatDate(e.deadline)} · {e.participantIds.length} personne(s) interrogée(s)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={e.status === 'en_cours' ? 'brand' : 'neutral'}>{EVALUATION_STATUS_LABELS[e.status]}</Badge>
                {canEditDraft(e, currentUser.id) && <Button onClick={() => onEditDraft(e.id)}>Reprendre</Button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
