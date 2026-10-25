import { canViewContent } from '../domain/access'
import { formatDate } from '../domain/dates'
import { REQUEST_STATUS_LABELS } from '../domain/labels'
import { computeResults } from '../domain/results'
import type { Answer, AppData, User } from '../domain/types'
import { Badge } from '../ui'

interface Props {
  data: AppData
  currentUser: User
  evaluationId: string
  onBack: () => void
}

export default function Resultats({ data, currentUser, evaluationId, onBack }: Props) {
  const evaluation = data.evaluations.find((e) => e.id === evaluationId)

  // Règles 8 et 9 : seuls la personne évaluée et son manager voient le contenu, et seulement après clôture.
  if (!evaluation || !canViewContent(evaluation, currentUser, data.users)) {
    return (
      <div className="rounded-lg bg-cream p-10 text-center text-sm text-muted">
        <p className="mb-2 font-medium text-ink">Accès refusé</p>
        <p>Les résultats ne sont visibles que par la personne évaluée et son manager, une fois l'évaluation clôturée.</p>
      </div>
    )
  }

  const nameOf = (id: string) => data.users.find((u) => u.id === id)?.name ?? '?'
  const { answered, unanswered, averageNote, choiceCounts } = computeResults(data, evaluation)
  const maxCount = Math.max(1, ...choiceCounts.map((c) => c.count))
  const questions = evaluation.formSnapshot.questions

  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="mb-4 text-sm text-muted hover:text-ink">
        ← Retour
      </button>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Résultats · {evaluation.name}</h2>
          <p className="mt-1 text-sm text-muted">
            Évalué·e : <span className="text-ink">{evaluation.subjectId === currentUser.id ? 'vous' : nameOf(evaluation.subjectId)}</span> ·{' '}
            {evaluation.period} · échéance {formatDate(evaluation.deadline)}
          </p>
        </div>
        <Badge>Clôturée</Badge>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-cream p-5">
          <p className="text-3xl font-semibold">
            {averageNote === null ? '—' : averageNote.toFixed(1).replace('.', ',')}
            <span className="text-base font-normal text-muted"> / 5</span>
          </p>
          <p className="text-sm text-muted">Note moyenne de collaboration</p>
        </div>
        <div className="rounded-lg bg-cream p-5">
          <p className="text-3xl font-semibold">
            {answered.length}
            <span className="text-base font-normal text-muted"> / {answered.length + unanswered.length}</span>
          </p>
          <p className="text-sm text-muted">Feedbacks reçus</p>
        </div>
      </div>

      {choiceCounts.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-3 text-lg font-semibold">Ce qui a le mieux fonctionné</h3>
          <div className="flex flex-col gap-2">
            {choiceCounts.map(({ option, count }) => (
              <div key={option} className="flex items-center gap-3 text-sm">
                <span className="w-44 shrink-0">{option}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream">
                  <div className="h-full bg-brand" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
                <span className="w-6 text-right font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h3 className="mb-3 text-lg font-semibold">Feedbacks détaillés</h3>
        {answered.length === 0 ? (
          <p className="rounded-lg bg-cream p-6 text-center text-sm text-muted">Aucun feedback n'a été envoyé avant la clôture.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {answered.map((r) => (
              <article key={r.id} className="rounded-lg border border-line p-5">
                <header className="mb-3 flex items-baseline justify-between">
                  <p className="font-semibold">{nameOf(r.authorId)}</p>
                  {r.submittedAt && <p className="text-xs text-muted">envoyé le {formatDate(r.submittedAt.slice(0, 10))}</p>}
                </header>
                <dl className="flex flex-col gap-2 text-sm">
                  {questions.map((q) => (
                    <div key={q.id}>
                      <dt className="text-muted">{q.label}</dt>
                      <dd>{formatAnswer(r.answers[q.id], q.type)}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      {unanswered.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-semibold">Sans réponse</h3>
          <ul className="flex flex-wrap gap-2 text-sm">
            {unanswered.map((r) => (
              <li key={r.id} className="flex items-center gap-2 rounded-md bg-cream px-3 py-1.5">
                {nameOf(r.authorId)} <Badge>{REQUEST_STATUS_LABELS[r.status]}</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function formatAnswer(answer: Answer | undefined, type: string) {
  if (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
    return <span className="text-subtle">Pas de réponse</span>
  }
  if (type === 'note') return <span className="font-semibold">{answer} / 5</span>
  if (Array.isArray(answer)) return answer.join(', ')
  return <span className="italic">« {answer} »</span>
}
