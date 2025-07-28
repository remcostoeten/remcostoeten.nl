import { createSignal, Show } from 'solid-js'
import { useCreateContactMessage } from '~/lib/queries/contact'
import { BaseLayout } from '~/components/layout/base-layout'
import { Button } from '~/components/ui/Button'
import { Input } from '~/components/ui/Input'
import { Textarea } from '~/components/primitives/Textarea'
import { ArrowLink } from '~/components/ui/ArrowLink'

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

function ContactPage() {
  const createMessageMutation = useCreateContactMessage()
  const [showSuccessMessage, setShowSuccessMessage] = createSignal(false)
  
  const [formData, setFormData] = createSignal<TContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  
  const [errors, setErrors] = createSignal<TFormErrors>({})

  function validateForm(): boolean {
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

  async function handleSubmit(e: Event) {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      await createMessageMutation.mutateAsync({
        name: formData().name.trim(),
        email: formData().email.trim(),
        subject: formData().subject.trim(),
        message: formData().message.trim()
      })
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
      setErrors({})
      setShowSuccessMessage(true)
      
      setTimeout(function() {
        setShowSuccessMessage(false);
      }, 5000)
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Failed to send message' })
    }
  }

  function updateField(field: keyof TContactForm, value: string) {
    setFormData(function(prev) {
      return { ...prev, [field]: value };
    })
    if (errors()[field]) {
      setErrors(function(prev) {
        return { ...prev, [field]: undefined };
      })
    }
  }

  function handleNameInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    updateField('name', target.value);
  }

  function handleEmailInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    updateField('email', target.value);
  }

  function handleSubjectInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    updateField('subject', target.value);
  }

  function handleMessageInput(e: Event) {
    const target = e.currentTarget as HTMLTextAreaElement;
    updateField('message', target.value);
  }

  return (
    <BaseLayout>
      <div class="container-centered">
        <div class="py-12">
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-foreground mb-4">Get in Touch</h1>
            <p class="text-lg text-muted-foreground">
              Have a question or want to work together? I'd love to hear from you.
            </p>
          </div>
          
          <div class="bg-card/50 border border-border rounded-lg p-8 backdrop-blur-sm">
          <Show when={showSuccessMessage()}>
            <div class="mb-6 bg-accent/10 border border-accent/20 text-accent px-4 py-3 rounded">
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
              <div class="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
                {errors().general}
              </div>
            </Show>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Your name"
                type="text"
                value={formData().name}
                onInput={handleNameInput}
                error={errors().name}
                required
                autocomplete="name"
              />
              
              <Input
                label="Email address"
                type="email"
                value={formData().email}
                onInput={handleEmailInput}
                error={errors().email}
                required
                autocomplete="email"
              />
            </div>
            
            <Input
              label="Subject"
              type="text"
              value={formData().subject}
              onInput={handleSubjectInput}
              error={errors().subject}
              required
              placeholder="What's this about?"
            />
            
            <Textarea
              label="Message"
              value={formData().message}
              onInput={handleMessageInput}
              error={errors().message}
              required
              placeholder="Tell me about your project or question..."
              minRows={6}
              resize="vertical"
            />
            
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
            <h2 class="text-2xl font-bold text-foreground mb-6">Other Ways to Reach Me</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="flex flex-col items-center p-4 bg-card/30 border border-border rounded-lg backdrop-blur-sm hover:bg-card/50 transition-colors">
                <div class="bg-accent/10 p-3 rounded-full mb-4">
                  <svg class="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p class="font-medium text-foreground">Email</p>
                <ArrowLink href="mailto:remco@remcostoeten.nl" external={false}>remco@remcostoeten.nl</ArrowLink>
              </div>
              
              <div class="flex flex-col items-center p-4 bg-card/30 border border-border rounded-lg backdrop-blur-sm hover:bg-card/50 transition-colors">
                <div class="bg-accent/10 p-3 rounded-full mb-4">
                  <svg class="h-6 w-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <p class="font-medium text-foreground">GitHub</p>
                <ArrowLink href="https://github.com/remcostoeten">@remcostoeten</ArrowLink>
              </div>
              
              <div class="flex flex-col items-center p-4 bg-card/30 border border-border rounded-lg backdrop-blur-sm hover:bg-card/50 transition-colors">
                <div class="bg-accent/10 p-3 rounded-full mb-4">
                  <svg class="h-6 w-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <p class="font-medium text-foreground">LinkedIn</p>
                <ArrowLink href="https://linkedin.com/in/remcostoeten">@remcostoeten</ArrowLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}

export default ContactPage
