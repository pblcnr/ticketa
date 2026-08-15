import { z } from 'zod'

export const gateFormSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  name: z.string().optional(),
})

export type GateFormData = z.infer<typeof gateFormSchema>
