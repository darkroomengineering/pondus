import { useEffect, useState, type ReactNode } from 'react'
import { useAuthStore } from '../stores/auth'
import { Button, Card } from '@specto/ui'
import { Loading } from './spinner'
import { open } from '@tauri-apps/plugin-shell'

interface AuthGuardProps {
	children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
	const { isAuthenticated, isLoading, error, ghNotInstalled, checkAuth, login } = useAuthStore()
	const [loginStarted, setLoginStarted] = useState(false)

	useEffect(() => {
		checkAuth()
	}, [checkAuth])

	// Poll for auth after login started
	useEffect(() => {
		if (!loginStarted) return

		const interval = setInterval(() => {
			checkAuth()
		}, 2000)

		return () => clearInterval(interval)
	}, [loginStarted, checkAuth])

	const handleLogin = async () => {
		setLoginStarted(true)
		await login()
	}

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
						<p className="text-sm text-[var(--muted)] mb-4">
							Specto uses the GitHub CLI for secure authentication.
						</p>
						{error && (
							<p className="text-sm text-[var(--color-error)] mb-4">{error}</p>
						)}

						{ghNotInstalled ? (
							<div className="space-y-4">
								<p className="text-sm text-[var(--muted)]">
									GitHub CLI is required. Install it first, then click "Login with GitHub".
								</p>
								<div className="flex flex-col gap-2">
									<Button onClick={() => open('https://cli.github.com')}>
										Install GitHub CLI
									</Button>
									<Button variant="secondary" onClick={checkAuth}>
										I've Installed It
									</Button>
								</div>
							</div>
						) : loginStarted ? (
							<div className="space-y-4">
								<div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
									<Loading text="Complete login in your browser..." />
								</div>
								<Button variant="secondary" onClick={checkAuth}>
									Check Again
								</Button>
							</div>
						) : (
							<div className="space-y-4">
								<Button onClick={handleLogin} className="w-full">
									Login with GitHub
								</Button>
								<p className="text-xs text-[var(--muted)]">
									This will open your browser to authenticate with GitHub.
								</p>
							</div>
						)}
					</Card.Content>
				</Card>
			</div>
		)
	}

	return <>{children}</>
}
