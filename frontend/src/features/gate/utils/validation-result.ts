import type { GateValidationResultType } from '../types'

type ResultDisplay = {
  label: string
  className: string
}

const resultDisplay: Record<GateValidationResultType, ResultDisplay> = {
  VALID: {
    label: 'Ingresso válido',
    className: 'border-gate-green/40 bg-gate-green text-paper',
  },
  ALREADY_USED: {
    label: 'Este ingresso já foi utilizado',
    className: 'border-stage-violet/40 bg-stage-violet text-paper',
  },
  WRONG_EVENT: {
    label: 'Este ingresso não pertence a este evento',
    className: 'border-stub-red/40 bg-stub-red text-paper',
  },
  INVALID: {
    label: 'Ingresso não encontrado',
    className: 'border-stub-red/40 bg-stub-red text-paper',
  },
}

export function getValidationResultDisplay(
  result: GateValidationResultType,
): ResultDisplay {
  return resultDisplay[result]
}
