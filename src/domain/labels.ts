import type { EvaluationStatus, RequestStatus } from './types'

export const EVALUATION_STATUS_LABELS: Record<EvaluationStatus, string> = {
  brouillon: 'Brouillon',
  en_cours: 'En cours',
  cloturee: 'Clôturée',
  archivee: 'Archivée',
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  envoye: 'Envoyé',
  brouillon: 'Brouillon',
  termine: 'Terminé',
  refuse: 'Refusé',
  expire: 'Expiré',
}
