import { canViewContent } from '../domain/access'
import { formatDate } from '../domain/dates'
import { progress } from '../domain/evaluations'
import type { AppData, Evaluation, User } from '../domain/types'
import { Button } from '../ui'

interface Props {
  data: AppData
  currentUser: User
  onOpen: (evaluationId: string) => void
}

// Règle 12 : historique organisé par évaluation. On n'y liste que ce dont l'utilisateur peut voir le contenu (règle 9).
export default function Historique({ data, currentUser, onOpen }: Props) {
  const closed = data.evaluations.filter((e) => canViewContent(e, currentUser, data.users))
  const mine = closed.filter((e) => e.subjectId === currentUser.id)
  const team = closed.filter((e) => e.subjectId !== currentUser.id)
  const nameOf = (id: string) => data.users.find((u) => u.id === id)?.name ?? '?'

  function renderList(list: Evaluation[], empty: string, showSubject: boolean) {
    if (list.length === 0) return <p className="rounded-lg bg-cream p-10 text-center text-sm text-muted">{empty}</p>
    return (
      <ul className="divide-y divide-line rounded-lg border border-line">
        {list.map((e) => {
          const { done, total } = progress(e, data.requests)
          return (
            <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-semibold">{e.name}</p>
                <p className="text-sm text-muted">
                  {showSubject && <>{nameOf(e.subjectId)} · </>}
                  {e.period} · échéance {formatDate(e.deadline)} · {done}/{total} feedbacks reçus
                </p>
              </div>
              <Button onClick={() => onOpen(e.id)} className="whitespace-nowrap">
                Voir les résultats
              </Button>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-1 text-2xl font-semibold tracking-tight">Mon historique</h2>
        <p className="mb-6 text-sm text-muted">Vos évaluations clôturées et les feedbacks reçus.</p>
        {renderList(mine, "Aucune évaluation clôturée pour l'instant.", false)}
      </section>

      {currentUser.role === 'manager' && (
        <section>
          <h3 className="mb-1 text-lg font-semibold">Mon équipe</h3>
          <p className="mb-4 text-sm text-muted">Évaluations clôturées des membres de votre équipe.</p>
          {renderList(team, 'Aucune évaluation clôturée dans votre équipe.', true)}
        </section>
      )}
    </div>
  )
}
