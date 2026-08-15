import { z } from 'zod'

export const signupSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  role: z.enum(['ORGANIZADOR', 'CLIENTE']),
  name: z.string().optional(),
})

export type SignupFormData = z.infer<typeof signupSchema>
