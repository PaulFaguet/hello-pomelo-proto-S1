import type { Answer, AppData, Evaluation, FeedbackRequest, Form, RequestStatus, User } from './types'

const users: User[] = [
  { id: 'marc', name: 'Marc Lefèvre', role: 'manager', managerId: null },
  { id: 'lea', name: 'Léa Martin', role: 'user', managerId: 'marc' },
  { id: 'hugo', name: 'Hugo Bernard', role: 'user', managerId: 'marc' },
  { id: 'ines', name: 'Inès Roux', role: 'user', managerId: 'marc' },
  { id: 'tom', name: 'Tom Dupuis', role: 'user', managerId: 'marc' },
  { id: 'sophie', name: 'Sophie Garnier', role: 'manager', managerId: null },
  { id: 'nina', name: 'Nina Faure', role: 'user', managerId: 'sophie' },
  { id: 'paul', name: 'Paul Girard', role: 'user', managerId: 'sophie' },
  { id: 'emma', name: 'Emma Blanc', role: 'user', managerId: 'sophie' },
  { id: 'lucas', name: 'Lucas Petit', role: 'user', managerId: 'sophie' },
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
 * 1. eval-lea-s1     CLÔTURÉE  · user (Léa) pour elle-même · 4 terminés + 1 expiré → historique, résultats visibles
 * 2. eval-paul-s1    CLÔTURÉE  · créée par manager 2 (Sophie) pour Paul · interroge Hugo (autre équipe)
 * 3. eval-ines-s2    EN COURS  · user (Inès) pour elle-même · tous les statuts : terminé, brouillon, envoyé
 * 4. eval-nina-proj  EN COURS  · EN RETARD (date limite dépassée) · créée par manager 2 pour Nina
 * 5. eval-sophie-s2  EN COURS  · manager 2 s'auto-évalue (pas de manager au-dessus d'elle)
 * 6. eval-tom-draft  BROUILLON · Tom, incomplet, visible de lui seul
 */
export function createSeedData(): AppData {
  requestCounter = 0

  const evaluations: Evaluation[] = [
    evaluation(
      { id: 'eval-lea-s1', name: 'Évaluation S1 2026', period: 'S1 2026', deadline: '2026-06-30', subjectId: 'lea', createdBy: 'lea', status: 'cloturee' },
      { hugo: 'termine', ines: 'termine', marc: 'termine', nina: 'termine', tom: 'expire' },
    ),
    evaluation(
      { id: 'eval-paul-s1', name: 'Bilan S1 2026', period: 'S1 2026', deadline: '2026-07-10', subjectId: 'paul', createdBy: 'sophie', status: 'cloturee' },
      { emma: 'termine', lucas: 'termine', hugo: 'termine', sophie: 'expire' },
    ),
    evaluation(
      { id: 'eval-ines-s2', name: 'Évaluation S2 2026', period: 'S2 2026', deadline: '2026-11-20', subjectId: 'ines', createdBy: 'ines', status: 'en_cours' },
      { lea: 'termine', tom: 'brouillon', marc: 'envoye', emma: 'envoye' },
    ),
    evaluation(
      { id: 'eval-nina-proj', name: 'Retour projet Atlas', period: 'T3 2026', deadline: '2026-10-15', subjectId: 'nina', createdBy: 'sophie', status: 'en_cours' },
      { paul: 'termine', lucas: 'envoye', hugo: 'envoye' },
    ),
    evaluation(
      { id: 'eval-sophie-s2', name: 'Feedback management S2', period: 'S2 2026', deadline: '2026-12-05', subjectId: 'sophie', createdBy: 'sophie', status: 'en_cours' },
      { nina: 'termine', paul: 'envoye', marc: 'envoye' },
    ),
    evaluation(
      { id: 'eval-tom-draft', name: 'Point mi-parcours', period: '', deadline: '', subjectId: 'tom', createdBy: 'tom', status: 'brouillon' },
      { lea: 'envoye' }, // brouillon : la liste sert juste à pré-remplir, aucune demande n'est créée
    ),
  ]

  const requests: FeedbackRequest[] = [
    // 1. Léa, clôturée
    request('eval-lea-s1', 'hugo', 'termine', answers(4, ['La communication', "L'entraide"], 'Partager plus tôt les points de blocage.'), '2026-06-12T10:00:00.000Z'),
    request('eval-lea-s1', 'ines', 'termine', answers(5, ['La fiabilité'], ''), '2026-06-15T14:30:00.000Z'),
    request('eval-lea-s1', 'marc', 'termine', answers(4, ['La fiabilité', "La prise d'initiative"], 'Prendre la parole davantage en réunion.'), '2026-06-20T09:15:00.000Z'),
    request('eval-lea-s1', 'nina', 'termine', answers(3, ['La communication'], 'Documenter les décisions prises avec les autres équipes.'), '2026-06-25T16:45:00.000Z'),
    request('eval-lea-s1', 'tom', 'expire'),

    // 2. Paul, clôturée
    request('eval-paul-s1', 'emma', 'termine', answers(5, ['L\'entraide', 'La communication'], 'Continuer à animer les rétros, c\'est précieux.'), '2026-07-01T11:00:00.000Z'),
    request('eval-paul-s1', 'lucas', 'termine', answers(4, ['La fiabilité'], 'Déléguer davantage les sujets techniques.'), '2026-07-03T15:20:00.000Z'),
    request('eval-paul-s1', 'hugo', 'termine', answers(2, ['La prise d\'initiative'], 'Les échanges entre nos équipes manquaient de régularité : un point hebdo aiderait.'), '2026-07-08T09:40:00.000Z'),
    request('eval-paul-s1', 'sophie', 'expire'),

    // 3. Inès, en cours : tous les statuts de demande
    request('eval-ines-s2', 'lea', 'termine', answers(5, ['La fiabilité', "L'entraide"], 'Rien à redire, continue !'), '2026-10-20T13:00:00.000Z'),
    request('eval-ines-s2', 'tom', 'brouillon', answers(4)), // note saisie, choix manquant : envoi impossible en l'état
    request('eval-ines-s2', 'marc', 'envoye'),
    request('eval-ines-s2', 'emma', 'envoye'),

    // 4. Nina, en cours et en retard
    request('eval-nina-proj', 'paul', 'termine', answers(4, ['La communication'], 'Mieux anticiper la charge en fin de sprint.'), '2026-10-10T17:30:00.000Z'),
    request('eval-nina-proj', 'lucas', 'envoye'),
    request('eval-nina-proj', 'hugo', 'envoye'),

    // 5. Sophie s'auto-évalue
    request('eval-sophie-s2', 'nina', 'termine', answers(5, ['La communication', "La prise d'initiative"], ''), '2026-10-22T10:10:00.000Z'),
    request('eval-sophie-s2', 'paul', 'envoye'),
    request('eval-sophie-s2', 'marc', 'envoye'),
  ]

  return { users, forms: [standardForm], evaluations, requests }
}
