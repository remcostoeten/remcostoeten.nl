'use client'

import { useState, useEffect } from 'react'

// Client-side auth state
let authState = {
  isAuthenticated: false,
  user: null as { id: number; email: string; name: string } | null,
  loading: true
}

let listeners: (() => void)[] = []

function notifyListeners() {
  listeners.forEach(listener => listener())
}

function subscribe(listener: () => void) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter(l => l !== listener)
  }
}

// Check authentication status
export async function checkAuth(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/me')
    
    if (response.ok) {
      const result = await response.json()
      authState.isAuthenticated = true
      authState.user = result.user
      authState.loading = false
      notifyListeners()
      return true
    } else {
      authState.isAuthenticated = false
      authState.user = null
      authState.loading = false
      notifyListeners()
      return false
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    authState.isAuthenticated = false
    authState.user = null
    authState.loading = false
    notifyListeners()
    return false
  }
}

// Logout function
export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/sign-out', {
      method: 'POST'
    })
  } catch (error) {
    console.error('Logout request failed:', error)
  }
  
  // Clear local state regardless of API call result
  authState.isAuthenticated = false
  authState.user = null
  authState.loading = false
  notifyListeners()
  
  // Redirect to signin
  window.location.href = '/auth/signin'
}

// Simple sync check (returns cached state)
export function isAuthenticated(): boolean {
  return authState.isAuthenticated
}

// Get current user
export function getCurrentUser(): { id: number; email: string; name: string } | null {
  return authState.user
}

// React hook for auth state
export function useAuth() {
  const [state, setState] = useState(authState)
  
  useEffect(() => {
    // Initial auth check
    checkAuth()
    
    // Subscribe to auth state changes
    const unsubscribe = subscribe(() => {
      setState({ ...authState })
    })
    
    return unsubscribe
  }, [])
  
  return {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    loading: state.loading,
    logout,
    checkAuth
  }
}

// Initialize auth state on load
if (typeof window !== 'undefined') {
  checkAuth()
}
