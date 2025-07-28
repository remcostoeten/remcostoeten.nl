import { createMutation } from '@tanstack/solid-query'

type TCreateContactMessage = {
  name: string
  email: string
  subject: string
  message: string
}

type TContactResponse = {
  success: boolean
  message?: string
  data?: any
  error?: string
}

async function createContactMessage(data: TCreateContactMessage): Promise<TContactResponse> {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to send message')
  }

  return result
}

export function useCreateContactMessage() {
  return createMutation(() => ({
    mutationFn: createContactMessage
  }))
}
