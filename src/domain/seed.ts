import type { AppData, FeedbackRequest, Form, User } from './types'

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

function doneRequest(
  id: string,
  authorId: string,
  note: number,
  choix: string[],
  conseil: string,
  submittedAt: string,
): FeedbackRequest {
  return {
    id,
    evaluationId: 'eval-lea-s1',
    authorId,
    status: 'termine',
    answers: { 'q-note': note, 'q-choix': choix, 'q-ouverte': conseil },
    submittedAt,
  }
}

// Données de départ : une seule évaluation, déjà clôturée, pour montrer l'historique.
export function createSeedData(): AppData {
  return {
    users,
    forms: [standardForm],
    evaluations: [
      {
        id: 'eval-lea-s1',
        name: 'Évaluation S1 2026',
        period: 'S1 2026',
        deadline: '2026-06-30',
        formSnapshot: structuredClone(standardForm),
        subjectId: 'lea',
        createdBy: 'lea',
        participantIds: ['hugo', 'ines', 'marc', 'nina', 'tom'],
        status: 'cloturee',
      },
    ],
    requests: [
      doneRequest('req-1', 'hugo', 4, ['La communication', "L'entraide"], 'Partager plus tôt les points de blocage.', '2026-06-12T10:00:00.000Z'),
      doneRequest('req-2', 'ines', 5, ['La fiabilité'], '', '2026-06-15T14:30:00.000Z'),
      doneRequest('req-3', 'marc', 4, ['La fiabilité', "La prise d'initiative"], 'Prendre la parole davantage en réunion.', '2026-06-20T09:15:00.000Z'),
      doneRequest('req-4', 'nina', 3, ['La communication'], 'Documenter les décisions prises avec les autres équipes.', '2026-06-25T16:45:00.000Z'),
      { id: 'req-5', evaluationId: 'eval-lea-s1', authorId: 'tom', status: 'expire', answers: {} },
    ],
  }
}
