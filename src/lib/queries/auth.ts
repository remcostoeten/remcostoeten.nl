import { createMutation } from '@tanstack/solid-query'

type TLoginData = {
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

async function logout(): Promise<TAuthResponse> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Logout failed')
  }

  return result
}

export function useLogin() {
  return createMutation(() => ({
    mutationFn: login
  }))
}

export function useLogout() {
  return createMutation(() => ({
    mutationFn: logout
  }))
}


