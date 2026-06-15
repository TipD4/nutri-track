import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { getUserMessage } from '@/lib/error-messages'

interface FormData {
  username: string
  password: string
}

export function LoginForm() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { username: '', password: '' }
  })

  const onSubmit = async (data: FormData) => {
    try {
      setError(null)
      const email = data.username.includes('@') ? data.username : `${data.username}@nutri-track.local`
      if (mode === 'login') {
        await signIn(email, data.password)
      } else {
        await signUp(email, data.password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(getUserMessage(err))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('username', { required: '请输入用户名' })}
        label="用户名"
        placeholder="输入用户名"
        error={errors.username?.message}
        autoComplete="username"
      />
      <Input
        {...register('password', { required: '请输入密码', minLength: { value: 6, message: '密码至少6位' } })}
        type="password"
        label="密码"
        placeholder="输入密码"
        error={errors.password?.message}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
      />
      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        {mode === 'login' ? '登录' : '注册'}
      </Button>
      <div className="text-center">
        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          {mode === 'login' ? '没有账号？注册' : '已有账号？登录'}
        </button>
      </div>
    </form>
  )
}
