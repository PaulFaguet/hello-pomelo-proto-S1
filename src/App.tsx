import { useEffect, useState } from 'react'
import { pendingCount } from './domain/requests'
import type { AppData } from './domain/types'
import CreerEvaluation from './screens/CreerEvaluation'
import Feedback from './screens/Feedback'
import MesEvaluations from './screens/MesEvaluations'
import Repondre from './screens/Repondre'
import { initialState, loadState, saveState, type PersistedState } from './storage'

type Tab = 'evaluations' | 'feedback' | 'historique' | 'equipe'

// Écran courant (pas de routeur) : la liste de l'onglet, ou un écran de détail.
type Screen = { name: 'tab' } | { name: 'creer'; evaluationId?: string } | { name: 'repondre'; requestId: string }

const TAB_LABELS: Record<Tab, string> = {
  evaluations: 'Mes évaluations',
  feedback: 'Feedback',
  historique: 'Historique',
  equipe: 'Mon équipe',
}

export default function App() {
  const [state, setState] = useState<PersistedState>(loadState)
  const [tab, setTab] = useState<Tab>('evaluations')
  const [screen, setScreen] = useState<Screen>({ name: 'tab' })
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => saveState(state), [state])

  const { users } = state.data
  const currentUser = users.find((u) => u.id === state.currentUserId) ?? users[0]
  const tabs: Tab[] =
    currentUser.role === 'manager'
      ? ['evaluations', 'feedback', 'historique', 'equipe']
      : ['evaluations', 'feedback', 'historique']
  const toComplete = pendingCount(state.data, currentUser.id)
  // Si l'onglet courant n'existe pas pour ce profil (ex. "Mon équipe" pour un user), on revient au premier.
  const activeTab = tabs.includes(tab) ? tab : tabs[0]

  function goTo(next: Screen) {
    setScreen(next)
    setMessage(null)
  }

  function selectTab(t: Tab) {
    setTab(t)
    goTo({ name: 'tab' })
  }

  function switchUser(userId: string) {
    setState((s) => ({ ...s, currentUserId: userId }))
    goTo({ name: 'tab' })
  }

  function saveData(data: AppData, msg: string) {
    setState((s) => ({ ...s, data }))
    setScreen({ name: 'tab' })
    setMessage(msg)
  }

  function resetDemo() {
    if (!window.confirm('Réinitialiser la démo ? Toutes les données créées seront perdues.')) return
    setState({ ...initialState(), currentUserId: state.currentUserId })
    setTab('evaluations')
    goTo({ name: 'tab' })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="inline-block h-3 w-3 rounded-full bg-brand" aria-hidden />
            Feedback entre collègues
          </h1>
          <div className="flex items-center gap-3">
            <label htmlFor="profile" className="text-sm text-muted">
              Profil simulé
            </label>
            <select
              id="profile"
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="rounded-lg border border-line bg-cream px-3 py-2 text-sm focus:outline-2 focus:outline-brand"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.role === 'manager' ? '(manager)' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={resetDemo}
              className="rounded-md bg-cream px-3 py-2 text-sm font-medium hover:bg-line"
            >
              Réinitialiser la démo
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <p className="mb-6 flex items-center gap-2 text-sm text-muted">
          Connecté en tant que <span className="font-semibold text-ink">{currentUser.name}</span>
          <span className="rounded bg-brand-soft px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-brand">
            {currentUser.role === 'manager' ? 'Manager' : 'Collaborateur'}
          </span>
        </p>

        <nav className="mb-8 flex gap-1 border-b border-line">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => selectTab(t)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${
                t === activeTab
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {TAB_LABELS[t]}
              {t === 'feedback' && toComplete > 0 && (
                <span
                  className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white"
                  title={`${toComplete} feedback${toComplete > 1 ? 's' : ''} à compléter`}
                >
                  {toComplete}
                </span>
              )}
            </button>
          ))}
        </nav>

        {message && (
          <p className="mb-6 rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand" role="status">
            {message}
          </p>
        )}

        {screen.name === 'creer' ? (
          <CreerEvaluation
            key={screen.evaluationId ?? 'new'}
            data={state.data}
            currentUser={currentUser}
            evaluationId={screen.evaluationId}
            onDone={saveData}
            onCancel={() => goTo({ name: 'tab' })}
          />
        ) : screen.name === 'repondre' ? (
          <Repondre
            key={screen.requestId}
            data={state.data}
            currentUser={currentUser}
            requestId={screen.requestId}
            onDone={saveData}
            onBack={() => goTo({ name: 'tab' })}
          />
        ) : activeTab === 'feedback' ? (
          <Feedback data={state.data} currentUser={currentUser} onOpen={(id) => goTo({ name: 'repondre', requestId: id })} />
        ) : activeTab === 'evaluations' ? (
          <MesEvaluations
            data={state.data}
            currentUser={currentUser}
            onCreate={() => goTo({ name: 'creer' })}
            onEditDraft={(id) => goTo({ name: 'creer', evaluationId: id })}
          />
        ) : (
          <section className="rounded-lg bg-cream p-12 text-center text-sm text-muted">
            Onglet « {TAB_LABELS[activeTab]} » : contenu à venir.
          </section>
        )}
      </main>
    </div>
  )
}
