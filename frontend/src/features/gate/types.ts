export type GateValidationResultType =
  | 'VALID'
  | 'INVALID'
  | 'ALREADY_USED'
  | 'WRONG_EVENT'

export type GateValidationResult = {
  result: GateValidationResultType
}
