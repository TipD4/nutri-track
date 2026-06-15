import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { loginSchema, type LoginFormData } from '@/lib/zod-schemas'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { getUserMessage } from '@/lib/error-messages'

export function LoginForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await signIn(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      setError(getUserMessage(err))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('email')}
        type="email"
        label="邮箱"
        placeholder="your@email.com"
        error={errors.email?.message}
        autoComplete="email"
      />
      <Input
        {...register('password')}
        type="password"
        label="密码"
        placeholder="请输入密码"
        error={errors.password?.message}
        autoComplete="current-password"
      />
      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        登录
      </Button>
    </form>
  )
}
