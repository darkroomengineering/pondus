import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
	label: string
	value: string | number
	description?: string
	trend?: {
		value: number
		isPositive?: boolean
	}
	icon?: ReactNode
}

/**
 * Stat display component for metrics
 *
 * @example
 * ```tsx
 * <Stat
 *   label="Total Commits"
 *   value={1234}
 *   trend={{ value: 12, isPositive: true }}
 *   description="This month"
 * />
 * ```
 */
export function Stat({
	label,
	value,
	description,
	trend,
	icon,
	className,
	...props
}: StatProps) {
	return (
		<div
			className={cn(
				'flex flex-col gap-1 p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]',
				className
			)}
			{...props}
		>
			<div className="flex items-center justify-between">
				<span className="text-sm text-[var(--muted)]">{label}</span>
				{icon && <span className="text-[var(--muted)]">{icon}</span>}
			</div>
			<div className="flex items-baseline gap-2">
				<span className="text-2xl font-semibold text-[var(--foreground)]">
					{typeof value === 'number' ? value.toLocaleString() : value}
				</span>
				{trend && (
					<span
						className={cn(
							'text-sm font-medium',
							trend.isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
						)}
					>
						{trend.isPositive ? '+' : ''}{trend.value}%
					</span>
				)}
			</div>
			{description && (
				<span className="text-xs text-[var(--muted)]">{description}</span>
			)}
		</div>
	)
}
