import { formatDate, todayISO } from '../domain/dates'
import { REQUEST_STATUS_LABELS } from '../domain/labels'
import { isLate, isPending, myRequests } from '../domain/requests'
import type { AppData, Evaluation, FeedbackRequest, User } from '../domain/types'
import { Badge, Button } from '../ui'

interface Props {
  data: AppData
  currentUser: User
  onOpen: (requestId: string) => void
}

export default function Feedback({ data, currentUser, onOpen }: Props) {
  const today = todayISO()
  const all = myRequests(data, currentUser.id)
  const pending = all.filter(({ request, evaluation }) => isPending(request, evaluation))
  const done = all.filter(({ request, evaluation }) => !isPending(request, evaluation))
  const nameOf = (id: string) => data.users.find((u) => u.id === id)?.name ?? '?'

  function renderRow({ request, evaluation }: { request: FeedbackRequest; evaluation: Evaluation }) {
    const late = isLate(request, evaluation, today)
    const pendingRow = isPending(request, evaluation)
    return (
      <li key={request.id} className="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="font-semibold">{evaluation.name}</p>
          <p className="text-sm text-muted">
            Pour <span className="text-ink">{nameOf(evaluation.subjectId)}</span> · {evaluation.period} ·{' '}
            <span className={late ? 'font-medium text-brand' : ''}>échéance {formatDate(evaluation.deadline)}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {late && <Badge tone="brand">En retard</Badge>}
          <Badge tone={request.status === 'brouillon' ? 'brand' : 'neutral'}>{REQUEST_STATUS_LABELS[request.status]}</Badge>
          {pendingRow ? (
            <Button variant="primary" onClick={() => onOpen(request.id)} className="w-36 whitespace-nowrap">
              {request.status === 'brouillon' ? 'Reprendre' : 'Répondre'}
            </Button>
          ) : request.status === 'termine' ? (
            <Button onClick={() => onOpen(request.id)} className="w-36 whitespace-nowrap">
              Voir ma réponse
            </Button>
          ) : (
            <span className="w-36 whitespace-nowrap" />
          )}
        </div>
      </li>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-1 text-2xl font-semibold tracking-tight">Feedbacks à compléter</h2>
        <p className="mb-6 text-sm text-muted">
          {pending.length} feedback{pending.length > 1 ? 's' : ''} à compléter · les collègues qui vous ont sollicité·e pour un
          retour.
        </p>
        {pending.length === 0 ? (
          <p className="rounded-lg bg-cream p-10 text-center text-sm text-muted">Aucun feedback à compléter.</p>
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line">
            {pending.map(renderRow)}
          </ul>
        )}
      </section>

      {done.length > 0 && (
        <section>
          <h3 className="mb-4 text-lg font-semibold">Déjà traités</h3>
          <ul className="divide-y divide-line rounded-lg border border-line">
            {done.map(renderRow)}
          </ul>
        </section>
      )}
    </div>
  )
}
