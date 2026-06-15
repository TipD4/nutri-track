import { cn } from '@/lib/cn'
import type { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-100 p-4', className)} {...props}>
      {children}
    </div>
  )
}
