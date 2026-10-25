import type { Answer, AppData, Evaluation, FeedbackRequest, Form, RequestStatus, User } from './types'

const users: User[] = [
  { id: 'marc', name: 'Marc Lefèvre', role: 'manager', managerId: null },
  { id: 'lea', name: 'Léa Martin', role: 'user', managerId: 'marc' },
  { id: 'hugo', name: 'Hugo Bernard', role: 'user', managerId: 'marc' },
  { id: 'ines', name: 'Inès Roux', role: 'user', managerId: 'marc' },
]

const standardForm: Form = {
  id: 'form-standard',
  name: 'Feedback standard',
  questions: [
    { id: 'q-note', type: 'note', label: 'Comment évaluez-vous la collaboration ?', required: true },
    {
      id: 'q-choix',
      type: 'choix',
      label: "Qu'est-ce qui a le mieux fonctionné ?",
      required: true,
      options: ['La communication', 'La fiabilité', "L'entraide", "La prise d'initiative"],
    },
    { id: 'q-ouverte', type: 'ouverte', label: 'Un conseil pour progresser ?', required: false },
  ],
}

function evaluation(
  e: Omit<Evaluation, 'formSnapshot' | 'participantIds'>,
  participants: Record<string, RequestStatus>,
): Evaluation {
  return { ...e, formSnapshot: structuredClone(standardForm), participantIds: Object.keys(participants) }
}

function answers(note?: number, choix?: string[], conseil?: string): Record<string, Answer> {
  const a: Record<string, Answer> = {}
  if (note !== undefined) a['q-note'] = note
  if (choix !== undefined) a['q-choix'] = choix
  if (conseil !== undefined) a['q-ouverte'] = conseil
  return a
}

let requestCounter = 0
function request(
  evaluationId: string,
  authorId: string,
  status: RequestStatus,
  a: Record<string, Answer> = {},
  submittedAt?: string,
): FeedbackRequest {
  requestCounter += 1
  return { id: `req-${requestCounter}`, evaluationId, authorId, status, answers: a, submittedAt }
}

/*
 * Corpus de démo : chaque évaluation illustre un cas précis.
 * (Date du jour de référence pour la démo : fin octobre 2026.)
 *
 * 1. eval-lea-s1     CLÔTURÉE  · user (Léa) pour elle-même · 2 terminés + 1 expiré → historique, résultats visibles
 * 2. eval-ines-s2    EN COURS  · user (Inès) pour elle-même · tous les statuts : terminé, brouillon, envoyé
 * 3. eval-hugo-proj  EN COURS  · EN RETARD (date limite dépassée) · créée par le manager pour Hugo
 * 4. eval-marc-s2    EN COURS  · le manager s'auto-évalue (pas de manager au-dessus de lui)
 * 5. eval-hugo-draft BROUILLON · Hugo, incomplet, visible de lui seul
 */
export function createSeedData(): AppData {
  requestCounter = 0

  const evaluations: Evaluation[] = [
    evaluation(
      { id: 'eval-lea-s1', name: 'Évaluation S1 2026', period: 'S1 2026', deadline: '2026-06-30', subjectId: 'lea', createdBy: 'lea', status: 'cloturee' },
      { hugo: 'termine', marc: 'termine', ines: 'expire' },
    ),
    evaluation(
      { id: 'eval-ines-s2', name: 'Évaluation S2 2026', period: 'S2 2026', deadline: '2026-11-20', subjectId: 'ines', createdBy: 'ines', status: 'en_cours' },
      { lea: 'termine', hugo: 'brouillon', marc: 'envoye' },
    ),
    evaluation(
      { id: 'eval-hugo-proj', name: 'Retour projet Atlas', period: 'T3 2026', deadline: '2026-10-15', subjectId: 'hugo', createdBy: 'marc', status: 'en_cours' },
      { lea: 'termine', ines: 'envoye' },
    ),
    evaluation(
      { id: 'eval-marc-s2', name: 'Feedback management S2', period: 'S2 2026', deadline: '2026-12-05', subjectId: 'marc', createdBy: 'marc', status: 'en_cours' },
      { lea: 'termine', hugo: 'envoye', ines: 'envoye' },
    ),
    evaluation(
      { id: 'eval-hugo-draft', name: 'Point mi-parcours', period: '', deadline: '', subjectId: 'hugo', createdBy: 'hugo', status: 'brouillon' },
      { lea: 'envoye' }, // brouillon : la liste sert juste à pré-remplir, aucune demande n'est créée
    ),
  ]

  const requests: FeedbackRequest[] = [
    // 1. Léa, clôturée
    request('eval-lea-s1', 'hugo', 'termine', answers(4, ['La communication', "L'entraide"], 'Partager plus tôt les points de blocage.'), '2026-06-12T10:00:00.000Z'),
    request('eval-lea-s1', 'marc', 'termine', answers(4, ['La fiabilité', "La prise d'initiative"], 'Prendre la parole davantage en réunion.'), '2026-06-20T09:15:00.000Z'),
    request('eval-lea-s1', 'ines', 'expire'),

    // 2. Inès, en cours : tous les statuts de demande
    request('eval-ines-s2', 'lea', 'termine', answers(5, ['La fiabilité', "L'entraide"], 'Rien à redire, continue !'), '2026-10-20T13:00:00.000Z'),
    request('eval-ines-s2', 'hugo', 'brouillon', answers(4)), // note saisie, choix manquant : envoi impossible en l'état
    request('eval-ines-s2', 'marc', 'envoye'),

    // 3. Hugo, en cours et en retard
    request('eval-hugo-proj', 'lea', 'termine', answers(3, ['La communication'], 'Mieux anticiper la charge en fin de sprint.'), '2026-10-10T17:30:00.000Z'),
    request('eval-hugo-proj', 'ines', 'envoye'),

    // 4. Marc s'auto-évalue
    request('eval-marc-s2', 'lea', 'termine', answers(5, ['La communication', "La prise d'initiative"], ''), '2026-10-22T10:10:00.000Z'),
    request('eval-marc-s2', 'hugo', 'envoye'),
    request('eval-marc-s2', 'ines', 'envoye'),
  ]

  return { users, forms: [standardForm], evaluations, requests }
}
