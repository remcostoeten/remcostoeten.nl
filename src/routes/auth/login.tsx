import { createSignal, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { useLogin } from '~/lib/queries/auth'
import BaseLayout from '~/components/layout/BaseLayout'
import Button from '~/components/ui/Button'
import Input from '~/components/ui/Input'

type TLoginForm = {
  email: string
  password: string
}

type TFormErrors = {
  email?: string
  password?: string
  general?: string
}

const LoginPage = () => {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  
  const [formData, setFormData] = createSignal<TLoginForm>({
    email: '',
    password: ''
  })
  
  const [errors, setErrors] = createSignal<TFormErrors>({})

  const validateForm = (): boolean => {
    const data = formData()
    const newErrors: TFormErrors = {}
    
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
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      await loginMutation.mutateAsync(formData())
      navigate('/')
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Login failed' })
    }
  }

  const updateField = (field: keyof TLoginForm, value: string) => {
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
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p class="text-gray-600">Sign in to your account</p>
          </div>
          
          <div class="bg-white py-8 px-6 shadow-lg rounded-lg">
            <form onSubmit={handleSubmit} class="space-y-6">
              <Show when={errors().general}>
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors().general}
                </div>
              </Show>
              
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
                autocomplete="current-password"
              />
              
              <Button
                type="submit"
                loading={loginMutation.isPending}
                class="w-full"
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            
            <div class="mt-6 text-center">
              <p class="text-sm text-gray-600">
                Don't have an account?{' '}
                <a 
                  href="/auth/register" 
                  class="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}

export default LoginPage
