import { useEffect, useState } from 'react'
import { initialState, loadState, saveState, type PersistedState } from './storage'

type Tab = 'evaluations' | 'feedback' | 'historique' | 'equipe'

const TAB_LABELS: Record<Tab, string> = {
  evaluations: 'Mes évaluations',
  feedback: 'Feedback',
  historique: 'Historique',
  equipe: 'Mon équipe',
}

export default function App() {
  const [state, setState] = useState<PersistedState>(loadState)
  const [tab, setTab] = useState<Tab>('evaluations')

  useEffect(() => saveState(state), [state])

  const { users } = state.data
  const currentUser = users.find((u) => u.id === state.currentUserId) ?? users[0]
  const tabs: Tab[] =
    currentUser.role === 'manager'
      ? ['evaluations', 'feedback', 'historique', 'equipe']
      : ['evaluations', 'feedback', 'historique']
  // Si l'onglet courant n'existe pas pour ce profil (ex. "Mon équipe" pour un user), on revient au premier.
  const activeTab = tabs.includes(tab) ? tab : tabs[0]

  function switchUser(userId: string) {
    setState((s) => ({ ...s, currentUserId: userId }))
  }

  function resetDemo() {
    if (!window.confirm('Réinitialiser la démo ? Toutes les données créées seront perdues.')) return
    setState({ ...initialState(), currentUserId: state.currentUserId })
    setTab('evaluations')
  }

  return (
    <div className="min-h-screen text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <h1 className="text-lg font-semibold">Feedback entre collègues</h1>
          <div className="flex items-center gap-3">
            <label htmlFor="profile" className="text-sm text-slate-500">
              Profil simulé
            </label>
            <select
              id="profile"
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.role === 'manager' ? '(manager)' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={resetDemo}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
            >
              Réinitialiser la démo
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">
        <p className="mb-4 text-sm text-slate-500">
          Connecté en tant que <span className="font-medium text-slate-800">{currentUser.name}</span>
          {currentUser.role === 'manager' ? ' · Manager' : ' · Collaborateur'}
        </p>

        <nav className="mb-6 flex gap-1 border-b border-slate-200">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                t === activeTab
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </nav>

        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
          Onglet « {TAB_LABELS[activeTab]} » : contenu à venir.
        </section>
      </main>
    </div>
  )
}
