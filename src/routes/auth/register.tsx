import { createSignal, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { useRegister } from '~/lib/queries/auth'
import BaseLayout from '~/components/layout/base-layout'
import Button from '~/components/ui/Button'
import Input from '~/components/ui/Input'

type TRegisterForm = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type TFormErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

const RegisterPage = () => {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  
  const [formData, setFormData] = createSignal<TRegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    if (!data.password) {
      newErrors.password = 'Password is required'
    } else if (data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      const { confirmPassword, ...registerData } = formData()
      await registerMutation.mutateAsync(registerData)
      navigate('/')
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Registration failed' })
    }
  }

  const updateField = (field: keyof TRegisterForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors()[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <BaseLayout showNav={false}>
      <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
          <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Create account</h1>
            <p class="text-gray-600">Join us today</p>
          </div>
          
          <div class="bg-white py-8 px-6 shadow-lg rounded-lg">
            <form onSubmit={handleSubmit} class="space-y-6">
              <Show when={errors().general}>
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors().general}
                </div>
              </Show>
              
              <Input
                label="Full name"
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
              
              <Input
                label="Password"
                type="password"
                value={formData().password}
                onInput={(e) => updateField('password', e.currentTarget.value)}
                error={errors().password}
                required
                autocomplete="new-password"
                helperText="Must be at least 6 characters"
              />
              
              <Input
                label="Confirm password"
                type="password"
                value={formData().confirmPassword}
                onInput={(e) => updateField('confirmPassword', e.currentTarget.value)}
                error={errors().confirmPassword}
                required
                autocomplete="new-password"
              />
              
              <Button
                type="submit"
                loading={registerMutation.isPending}
                class="w-full"
              >
                {registerMutation.isPending ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
            
            <div class="mt-6 text-center">
              <p class="text-sm text-gray-600">
                Already have an account?{' '}
                <a 
                  href="/auth/login" 
                  class="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}

export default RegisterPage
