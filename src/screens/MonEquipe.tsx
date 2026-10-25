import { teamEvaluations } from '../domain/access'
import { formatDate, todayISO } from '../domain/dates'
import { getTeam, isEvaluationLate, progress } from '../domain/evaluations'
import { EVALUATION_STATUS_LABELS } from '../domain/labels'
import type { AppData, User } from '../domain/types'
import { Badge, Button } from '../ui'

interface Props {
  data: AppData
  currentUser: User
  onOpen: (evaluationId: string) => void
}

// Règle 8 : avancement des évaluations de MON équipe uniquement, sans le contenu avant clôture.
export default function MonEquipe({ data, currentUser, onOpen }: Props) {
  const today = todayISO()
  const team = getTeam(currentUser.id, data.users)
  const evaluations = teamEvaluations(data, currentUser)
  const active = evaluations.filter((e) => e.status === 'en_cours')
  const lateCount = active.filter((e) => isEvaluationLate(e, today)).length

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Mon équipe</h2>
      <p className="mt-1 mb-6 text-sm text-muted">
        Avancement des évaluations de vos {team.length} collaborateurs. Le contenu des feedbacks n'est visible qu'après clôture.
      </p>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <Stat label="Évaluations en cours" value={active.length} />
        <Stat label="En retard" value={lateCount} highlight={lateCount > 0} />
        <Stat label="Clôturées" value={evaluations.filter((e) => e.status === 'cloturee').length} />
      </div>

      <div className="flex flex-col gap-6">
        {team.map((member) => {
          const own = evaluations.filter((e) => e.subjectId === member.id)
          return (
            <section key={member.id}>
              <h3 className="mb-2 font-semibold">{member.name}</h3>
              {own.length === 0 ? (
                <p className="rounded-lg bg-cream px-5 py-3 text-sm text-muted">Aucune évaluation lancée.</p>
              ) : (
                <ul className="divide-y divide-line rounded-lg border border-line">
                  {own.map((e) => {
                    const { done, total } = progress(e, data.requests)
                    const late = isEvaluationLate(e, today)
                    return (
                      <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-3">
                        <div>
                          <p className="font-medium">{e.name}</p>
                          <p className="text-sm text-muted">
                            {e.period} · <span className={late ? 'font-medium text-brand' : ''}>échéance {formatDate(e.deadline)}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted">
                            <span className="font-semibold text-ink">
                              {done}/{total}
                            </span>{' '}
                            terminés
                          </span>
                          {late && <Badge tone="brand">En retard</Badge>}
                          <Badge tone={e.status === 'en_cours' ? 'brand' : 'neutral'}>{EVALUATION_STATUS_LABELS[e.status]}</Badge>
                          <Button onClick={() => onOpen(e.id)} className="w-24">
                            Suivre
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-5 ${highlight ? 'bg-brand-soft' : 'bg-cream'}`}>
      <p className={`text-3xl font-semibold ${highlight ? 'text-brand' : ''}`}>{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}
