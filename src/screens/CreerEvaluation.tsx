import { useState } from 'react'
import { addDays, todayISO } from '../domain/dates'
import {
  allowedSubjects,
  eligibleParticipants,
  getTeam,
  hasErrors,
  launchEvaluation,
  saveDraft,
  validateForLaunch,
  type EvaluationInput,
} from '../domain/evaluations'
import type { AppData, User } from '../domain/types'
import { Button, Field, inputClass } from '../ui'

interface Props {
  data: AppData
  currentUser: User
  evaluationId?: string // présent quand on reprend un brouillon
  onDone: (data: AppData, message: string) => void
  onCancel: () => void
}

export default function CreerEvaluation({ data, currentUser, evaluationId, onDone, onCancel }: Props) {
  const existing = data.evaluations.find((e) => e.id === evaluationId)
  const [input, setInput] = useState<EvaluationInput>(() =>
    existing
      ? {
          name: existing.name,
          period: existing.period,
          deadline: existing.deadline,
          formId: existing.formSnapshot.id,
          subjectId: existing.subjectId,
          participantIds: existing.participantIds,
        }
      : { name: '', period: '', deadline: '', formId: data.forms[0]?.id ?? '', subjectId: currentUser.id, participantIds: [] },
  )
  // Les erreurs ne s'affichent qu'après une première tentative de lancement, puis se mettent à jour en direct.
  const [triedLaunch, setTriedLaunch] = useState(false)

  const today = todayISO()
  const errors = validateForLaunch(input, currentUser, data.users, today)
  const shownErrors = triedLaunch ? errors : {}
  const subjects = allowedSubjects(currentUser, data.users)
  // Tant qu'il n'existe qu'un formulaire, le choix est imposé : le champ est grisé.
  const singleForm = data.forms.length <= 1
  const eligibleIds = new Set(eligibleParticipants(input.subjectId, data.users).map((u) => u.id))

  // Personnes regroupées par équipe (manager en tête) pour faciliter le choix.
  const groups = data.users
    .filter((u) => u.role === 'manager')
    .map((m) => ({ manager: m, members: [m, ...getTeam(m.id, data.users)] }))

  function update<K extends keyof EvaluationInput>(key: K, value: EvaluationInput[K]) {
    setInput((prev) => {
      const next = { ...prev, [key]: value }
      // Si la personne évaluée change, on la retire des personnes interrogées (règle 3).
      if (key === 'subjectId') next.participantIds = prev.participantIds.filter((id) => id !== value)
      return next
    })
  }

  function toggleParticipant(id: string) {
    update(
      'participantIds',
      input.participantIds.includes(id) ? input.participantIds.filter((p) => p !== id) : [...input.participantIds, id],
    )
  }

  function handleSaveDraft() {
    onDone(saveDraft(data, input, currentUser.id, existing?.id), 'Brouillon enregistré.')
  }

  function handleLaunch() {
    setTriedLaunch(true)
    if (hasErrors(errors)) return
    const n = input.participantIds.length
    onDone(
      launchEvaluation(data, input, currentUser.id, existing?.id),
      `Évaluation lancée : ${n} demande${n > 1 ? 's' : ''} de feedback envoyée${n > 1 ? 's' : ''}.`,
    )
  }

  return (
    <div className="max-w-3xl">
      <button onClick={onCancel} className="mb-4 text-sm text-muted hover:text-ink">
        ← Retour à mes évaluations
      </button>
      <h2 className="mb-8 text-2xl font-semibold tracking-tight">
        {existing ? 'Reprendre le brouillon' : 'Créer une évaluation'}
      </h2>

      <form className="flex flex-col gap-6" noValidate onSubmit={(e) => e.preventDefault()}>
        {currentUser.role === 'manager' ? (
          <Field label="Personne évaluée" htmlFor="subject" error={shownErrors.subjectId}>
            <select
              id="subject"
              value={input.subjectId}
              onChange={(e) => update('subjectId', e.target.value)}
              className={inputClass}
            >
              {subjects.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.id === currentUser.id ? `Moi-même (${u.name})` : u.name}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <p className="text-sm text-muted">
            Personne évaluée : <span className="font-medium text-ink">vous-même</span>
          </p>
        )}

        <div className="grid grid-cols-2 gap-6">
          <Field label="Nom de l'évaluation *" htmlFor="name" error={shownErrors.name}>
            <input
              id="name"
              value={input.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Ex. Évaluation S2 2026"
              aria-invalid={!!shownErrors.name}
              className={inputClass}
            />
          </Field>
          <Field label="Période *" htmlFor="period" error={shownErrors.period}>
            <input
              id="period"
              value={input.period}
              onChange={(e) => update('period', e.target.value)}
              placeholder="Ex. S2 2026"
              aria-invalid={!!shownErrors.period}
              className={inputClass}
            />
          </Field>
          <Field label="Date limite *" htmlFor="deadline" error={shownErrors.deadline} hint="Au plus tôt demain.">
            <input
              id="deadline"
              type="date"
              min={addDays(today, 1)}
              value={input.deadline}
              onChange={(e) => update('deadline', e.target.value)}
              aria-invalid={!!shownErrors.deadline}
              className={inputClass}
            />
          </Field>
          <Field
            label="Formulaire *"
            htmlFor="form"
            error={shownErrors.formId}
            hint={singleForm ? 'Un seul formulaire disponible (éditeur de formulaires hors prototype).' : undefined}
          >
            <select
              id="form"
              value={input.formId}
              onChange={(e) => update('formId', e.target.value)}
              disabled={singleForm}
              aria-invalid={!!shownErrors.formId}
              className={`${inputClass} disabled:cursor-not-allowed disabled:bg-cream disabled:text-muted`}
            >
              {!singleForm && <option value="">— Choisir —</option>}
              {data.forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label={`Personnes interrogées (${input.participantIds.length} sélectionnée${input.participantIds.length > 1 ? 's' : ''})`}
          error={shownErrors.participantIds}
          hint="La personne évaluée ne peut pas être interrogée."
        >
          <div className="grid grid-cols-2 gap-4">
            {groups.map(({ manager, members }) => (
              <fieldset key={manager.id} className="rounded-lg border border-line p-4">
                <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted">
                  Équipe {manager.name}
                </legend>
                <div className="flex flex-col gap-2">
                  {members.map((u) => {
                    const disabled = !eligibleIds.has(u.id)
                    return (
                      <label
                        key={u.id}
                        className={`flex items-center gap-2 text-sm ${disabled ? 'text-subtle' : 'cursor-pointer'}`}
                      >
                        <input
                          type="checkbox"
                          disabled={disabled}
                          checked={input.participantIds.includes(u.id)}
                          onChange={() => toggleParticipant(u.id)}
                          className="accent-brand"
                        />
                        {u.name}
                        {u.role === 'manager' && <span className="text-xs text-muted">(manager)</span>}
                        {disabled && <span className="text-xs">— personne évaluée</span>}
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </Field>

        <div className="flex items-center justify-end gap-3 border-t border-line pt-6">
          {input.participantIds.length === 0 && (
            <p className="mr-auto text-sm text-muted">Sélectionnez au moins une personne pour pouvoir lancer.</p>
          )}
          <Button type="button" onClick={handleSaveDraft}>
            Enregistrer en brouillon
          </Button>
          <Button type="button" variant="primary" onClick={handleLaunch} disabled={input.participantIds.length === 0}>
            Lancer
          </Button>
        </div>
      </form>
    </div>
  )
}
