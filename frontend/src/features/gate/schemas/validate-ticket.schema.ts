import { z } from 'zod'

export const validateTicketSchema = z.object({
  code: z.string().min(1, 'Informe o código do ingresso'),
})

export type ValidateTicketFormData = z.infer<typeof validateTicketSchema>
