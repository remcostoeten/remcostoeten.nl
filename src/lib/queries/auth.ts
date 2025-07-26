import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query'

type TApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

type TUser = {
  readonly id: string
  readonly email: string
  readonly name?: string
  readonly avatarUrl?: string
  readonly role: 'admin' | 'user'
  readonly createdAt: Date
  readonly updatedAt: Date
}

type TLoginData = {
  readonly email: string
  readonly password: string
}

type TRegisterData = {
  readonly email: string
  readonly password: string
  readonly name?: string
}

type TAuthResponse = {
  readonly user: TUser
  readonly token: string
}

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('auth_token', token)
}

const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
}

const fetchCurrentUser = async (): Promise<TUser> => {
  const token = getStoredToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const result: TApiResponse<TUser> = await response.json()
  
  if (!result.success) {
    removeStoredToken() // Clear invalid token
    throw new Error(result.error || 'Failed to fetch user')
  }
  
  if (!result.data) {
    throw new Error('No user data returned')
  }
  
  return result.data
}

const loginUser = async (data: TLoginData): Promise<TAuthResponse> => {
  // For now, we'll simulate a login since we don't have a full auth backend
  // In a real app, this would call /api/auth/login
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  const result: TApiResponse<TAuthResponse> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Login failed')
  }
  
  if (!result.data) {
    throw new Error('No auth data returned')
  }
  
  setStoredToken(result.data.token)
  return result.data
}

const registerUser = async (data: TRegisterData): Promise<TAuthResponse> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  const result: TApiResponse<TAuthResponse> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Registration failed')
  }
  
  if (!result.data) {
    throw new Error('No auth data returned')
  }
  
  setStoredToken(result.data.token)
  return result.data
}

const logoutUser = async (): Promise<void> => {
  const token = getStoredToken()
  
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Logout API call failed:', error)
    }
  }
  
  removeStoredToken()
}

// Query hooks
export const useCurrentUser = () => {
  return createQuery(() => ({
    queryKey: ['auth', 'currentUser'],
    queryFn: fetchCurrentUser,
    retry: false,
    enabled: !!getStoredToken()
  }))
}

export const useLogin = () => {
  const queryClient = useQueryClient()
  
  return createMutation(() => ({
    mutationFn: loginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  }))
}

export const useRegister = () => {
  const queryClient = useQueryClient()
  
  return createMutation(() => ({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  }))
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  
  return createMutation(() => ({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear() // Clear all cached data on logout
    }
  }))
}

// Utility functions
export const isAuthenticated = (): boolean => {
  return !!getStoredToken()
}

export const getAuthToken = (): string | null => {
  return getStoredToken()
}
