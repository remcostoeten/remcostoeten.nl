import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query'

type TApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

type TContactMessage = {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly subject: string
  readonly message: string
  readonly status: 'new' | 'read' | 'replied' | 'archived'
  readonly createdAt: Date
  readonly updatedAt: Date
}

type TCreateContactMessage = {
  readonly name: string
  readonly email: string
  readonly subject: string
  readonly message: string
}

const fetchContactMessages = async (params?: { limit?: number; status?: string }): Promise<TContactMessage[]> => {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.status) searchParams.set('status', params.status)
  
  const response = await fetch(`/api/contact?${searchParams}`)
  const result: TApiResponse<TContactMessage[]> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch contact messages')
  }
  
  return result.data || []
}

const createContactMessage = async (data: TCreateContactMessage): Promise<TContactMessage> => {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  const result: TApiResponse<TContactMessage> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to send message')
  }
  
  if (!result.data) {
    throw new Error('No message data returned')
  }
  
  return result.data
}

const updateContactMessageStatus = async (id: string, status: TContactMessage['status']): Promise<TContactMessage> => {
  const response = await fetch(`/api/contact/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  
  const result: TApiResponse<TContactMessage> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to update message status')
  }
  
  if (!result.data) {
    throw new Error('No message data returned')
  }
  
  return result.data
}

export const useGetContactMessages = (params?: { limit?: number; status?: string }) => {
  return createQuery(() => ({
    queryKey: ['contact-messages', params],
    queryFn: () => fetchContactMessages(params)
  }))
}

export const useCreateContactMessage = () => {
  const queryClient = useQueryClient()
  
  return createMutation(() => ({
    mutationFn: createContactMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
    }
  }))
}

export const useUpdateContactMessageStatus = () => {
  const queryClient = useQueryClient()
  
  return createMutation(() => ({
    mutationFn: ({ id, status }: { id: string; status: TContactMessage['status'] }) => 
      updateContactMessageStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
    }
  }))
}
