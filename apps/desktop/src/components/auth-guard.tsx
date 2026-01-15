import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '../stores/auth'
import { Button, Card } from '@specto/ui'
import { Loading } from './spinner'
import { open } from '@tauri-apps/plugin-shell'

interface AuthGuardProps {
	children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
	const { isAuthenticated, isLoading, username, error, checkAuth } = useAuthStore()

	useEffect(() => {
		checkAuth()
	}, [checkAuth])

	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center">
				<Loading text="Checking authentication..." />
			</div>
		)
	}

	if (!isAuthenticated) {
		return (
			<div className="h-full flex items-center justify-center p-6">
				<Card className="max-w-md w-full">
					<Card.Content className="text-center py-8">
						<div className="text-5xl mb-4">🔐</div>
						<h2 className="text-xl font-semibold mb-2">GitHub Authentication Required</h2>
						<p className="text-sm text-[var(--muted)] mb-6">
							Specto uses the GitHub CLI for secure authentication.
							{error && (
								<span className="block mt-2 text-[var(--color-error)]">{error}</span>
							)}
						</p>

						<div className="space-y-4">
							<div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
								<p className="text-xs text-[var(--muted)] mb-2">Run this command in your terminal:</p>
								<code className="text-sm text-[var(--accent)]">gh auth login</code>
							</div>

							<div className="flex flex-col gap-2">
								<Button
									onClick={() => open('https://cli.github.com')}
									variant="secondary"
								>
									Install GitHub CLI
								</Button>
								<Button onClick={checkAuth}>
									Check Again
								</Button>
							</div>
						</div>
					</Card.Content>
				</Card>
			</div>
		)
	}

	return <>{children}</>
}
