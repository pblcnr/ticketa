import { z } from 'zod'

export const eventFormSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  place: z.string().min(1, 'O local é obrigatório'),
  totalCapacity: z
    .number({ error: 'A capacidade é obrigatória' })
    .int('A capacidade deve ser um número inteiro')
    .positive('A capacidade deve ser maior que zero'),
  priceInCents: z
    .number({ error: 'O preço é obrigatório' })
    .int('O preço deve ser um número inteiro')
    .min(0, 'O preço não pode ser negativo'),
  date: z.string().min(1, 'A data é obrigatória'),
  imageUrl: z.string().optional(),
  ticketmasterId: z.string().optional(),
})

export type EventFormData = z.infer<typeof eventFormSchema>
