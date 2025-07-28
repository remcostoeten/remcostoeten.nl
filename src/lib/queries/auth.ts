import { createMutation } from '@tanstack/solid-query'

type TLoginData = {
  email: string
  password: string
}

type TRegisterData = {
  name: string
  email: string
  password: string
}

type TAuthResponse = {
  success: boolean
  data?: {
    user: any
    token?: string
  }
  error?: string
}

async function login(data: TLoginData): Promise<TAuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Login failed')
  }

  return result
}

async function register(data: TRegisterData): Promise<TAuthResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Registration failed')
  }

  return result
}

export function useLogin() {
  return createMutation(() => ({
    mutationFn: login
  }))
}

export function useRegister() {
  return createMutation(() => ({
    mutationFn: register
  }))
}
