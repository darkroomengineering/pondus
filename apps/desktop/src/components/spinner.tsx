import { cn } from '@specto/ui'

interface SpinnerProps {
	size?: 'sm' | 'md' | 'lg'
	className?: string
}

const sizeClasses = {
	sm: 'w-4 h-4 border-2',
	md: 'w-6 h-6 border-2',
	lg: 'w-8 h-8 border-3',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
	return (
		<div
			className={cn(
				'animate-spin rounded-full border-[var(--border)] border-t-[var(--accent)]',
				sizeClasses[size],
				className
			)}
		/>
	)
}

interface LoadingProps {
	text?: string
	className?: string
}

export function Loading({ text = 'Loading...', className }: LoadingProps) {
	return (
		<div className={cn('flex flex-col items-center justify-center gap-3', className)}>
			<Spinner size="lg" />
			<span className="text-sm text-[var(--muted)]">{text}</span>
		</div>
	)
}
