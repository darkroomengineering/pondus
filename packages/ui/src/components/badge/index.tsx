import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
	children: ReactNode
}

const variantStyles = {
	default: 'bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]',
	success: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
	warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20',
	error: 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20',
	info: 'bg-[var(--color-info)]/10 text-[var(--color-info)] border-[var(--color-info)]/20',
}

/**
 * Badge component for status indicators
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * ```
 */
export function Badge({
	variant = 'default',
	className,
	children,
	...props
}: BadgeProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border',
				variantStyles[variant],
				className
			)}
			{...props}
		>
			{children}
		</span>
	)
}
