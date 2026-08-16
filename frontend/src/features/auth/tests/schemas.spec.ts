import { describe, expect, it } from 'vitest'
import { loginSchema } from '../schemas/login.schema'
import { signupSchema } from '../schemas/signup.schema'

describe('loginSchema', () => {
  it('rejeita email malformado', () => {
    const result = loginSchema.safeParse({
      email: 'email-invalido',
      password: 'senha123',
    })

    expect(result.success).toBe(false)
  })

  it('rejeita senha vazia', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })

    expect(result.success).toBe(false)
  })

  it('aceita dados válidos', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'senha123',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        email: 'user@example.com',
        password: 'senha123',
      })
    }
  })
})

describe('signupSchema', () => {
  it('rejeita senha curta (mínimo de 8 caracteres)', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: '1234567',
      role: 'CLIENTE',
    })

    expect(result.success).toBe(false)
  })

  it('rejeita role fora do enum', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: '12345678',
      role: 'PORTARIA',
    })

    expect(result.success).toBe(false)
  })

  it('aceita name ausente (campo opcional)', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: '12345678',
      role: 'CLIENTE',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBeUndefined()
    }
  })

  it('aceita dados válidos completos', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: '12345678',
      role: 'ORGANIZADOR',
      name: 'Maria Silva',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        email: 'user@example.com',
        password: '12345678',
        role: 'ORGANIZADOR',
        name: 'Maria Silva',
      })
    }
  })
})
