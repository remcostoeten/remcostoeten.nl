import { createSignal, Show } from 'solid-js'
import { useCreateContactMessage } from '~/lib/queries/contact'
import BaseLayout from '~/components/layout/BaseLayout'
import Button from '~/components/ui/Button'
import Input from '~/components/ui/Input'

type TContactForm = {
  name: string
  email: string
  subject: string
  message: string
}

type TFormErrors = {
  name?: string
  email?: string
  subject?: string
  message?: string
  general?: string
}

const ContactPage = () => {
  const createMessageMutation = useCreateContactMessage()
  const [showSuccessMessage, setShowSuccessMessage] = createSignal(false)
  
  const [formData, setFormData] = createSignal<TContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  
  const [errors, setErrors] = createSignal<TFormErrors>({})

  const validateForm = (): boolean => {
    const data = formData()
    const newErrors: TFormErrors = {}
    
    if (!data.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!data.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!data.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    
    if (!data.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (data.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      await createMessageMutation.mutateAsync({
        name: formData().name.trim(),
        email: formData().email.trim(),
        subject: formData().subject.trim(),
        message: formData().message.trim()
      })
      
      // Reset form and show success message
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
      setErrors({})
      setShowSuccessMessage(true)
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000)
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Failed to send message' })
    }
  }

  const updateField = (field: keyof TContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (errors()[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <BaseLayout>
      <div class="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p class="text-lg text-gray-600">
            Have a question or want to work together? I'd love to hear from you.
          </p>
        </div>
        
        <div class="bg-white shadow-lg rounded-lg p-8">
          <Show when={showSuccessMessage()}>
            <div class="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <div class="flex items-center">
                <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Thank you for your message! I'll get back to you soon.
              </div>
            </div>
          </Show>
          
          <form onSubmit={handleSubmit} class="space-y-6">
            <Show when={errors().general}>
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors().general}
              </div>
            </Show>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Your name"
                type="text"
                value={formData().name}
                onInput={(e) => updateField('name', e.currentTarget.value)}
                error={errors().name}
                required
                autocomplete="name"
              />
              
              <Input
                label="Email address"
                type="email"
                value={formData().email}
                onInput={(e) => updateField('email', e.currentTarget.value)}
                error={errors().email}
                required
                autocomplete="email"
              />
            </div>
            
            <Input
              label="Subject"
              type="text"
              value={formData().subject}
              onInput={(e) => updateField('subject', e.currentTarget.value)}
              error={errors().subject}
              required
              placeholder="What's this about?"
            />
            
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">
                Message <span class="text-red-500 ml-1">*</span>
              </label>
              <textarea
                class={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 ${
                  errors().message 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                rows={6}
                value={formData().message}
                onInput={(e) => updateField('message', e.currentTarget.value)}
                placeholder="Tell me about your project or question..."
                required
              />
              <Show when={errors().message}>
                <p class="text-sm text-red-600">{errors().message}</p>
              </Show>
            </div>
            
            <Button
              type="submit"
              loading={createMessageMutation.isPending}
              size="lg"
              class="w-full"
            >
              {createMessageMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
        
        <div class="mt-12 text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Other Ways to Reach Me</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="flex flex-col items-center">
              <div class="bg-blue-100 p-3 rounded-full mb-4">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="font-medium text-gray-900">Email</p>
              <p class="text-gray-600">remco@example.com</p>
            </div>
            
            <div class="flex flex-col items-center">
              <div class="bg-gray-100 p-3 rounded-full mb-4">
                <svg class="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.562-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-12.014C24.007 5.367 18.641.001.012 12.017 0z"/>
                </svg>
              </div>
              <p class="font-medium text-gray-900">GitHub</p>
              <p class="text-gray-600">@remcostoeten</p>
            </div>
            
            <div class="flex flex-col items-center">
              <div class="bg-blue-100 p-3 rounded-full mb-4">
                <svg class="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <p class="font-medium text-gray-900">LinkedIn</p>
              <p class="text-gray-600">@remcostoeten</p>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}

export default ContactPage
