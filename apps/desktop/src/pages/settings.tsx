import { Card, Button, Badge } from '@pondus/ui'
import { useAuthStore } from '../stores/auth'
import { Spinner } from '../components/spinner'
import { open } from '@tauri-apps/plugin-shell'

export function Settings() {
	const { isAuthenticated, isLoading, username, error, checkAuth } = useAuthStore()

	return (
		<div className="h-full flex flex-col p-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-[var(--foreground)]">Settings</h1>
				<p className="text-sm text-[var(--muted)] mt-1">
					Configure your Pondus preferences
				</p>
			</div>

			<div className="space-y-6 max-w-2xl">
				{/* Authentication */}
				<Card>
					<Card.Header>
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-medium">GitHub Authentication</h2>
							{isLoading ? (
								<Spinner size="sm" />
							) : isAuthenticated ? (
								<Badge variant="success">Connected</Badge>
							) : (
								<Badge variant="error">Not Connected</Badge>
							)}
						</div>
					</Card.Header>
					<Card.Content>
						<div className="space-y-4">
							<div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
								<div>
									<p className="text-sm font-medium">Status</p>
									<p className="text-xs text-[var(--muted)]">
										GitHub CLI authentication
									</p>
								</div>
								<span className="text-sm">
									{isLoading ? (
										<Spinner size="sm" />
									) : isAuthenticated ? (
										<span className="text-[var(--color-success)]">Authenticated</span>
									) : (
										<span className="text-[var(--color-error)]">Not authenticated</span>
									)}
								</span>
							</div>

							{username && (
								<div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
									<div>
										<p className="text-sm font-medium">Username</p>
										<p className="text-xs text-[var(--muted)]">
											Logged in as
										</p>
									</div>
									<span className="text-sm text-[var(--accent)]">{username}</span>
								</div>
							)}

							{error && (
								<div className="py-2 px-3 rounded-md bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
									<p className="text-sm text-[var(--color-error)]">{error}</p>
								</div>
							)}

							<div className="flex gap-2 pt-2">
								<Button variant="secondary" onClick={checkAuth}>
									{isLoading ? <Spinner size="sm" /> : 'Refresh Status'}
								</Button>
								{!isAuthenticated && (
									<Button onClick={() => open('https://cli.github.com')}>
										Install GitHub CLI
									</Button>
								)}
							</div>
						</div>
					</Card.Content>
					<Card.Footer>
						<p className="text-xs text-[var(--muted)]">
							Run <code className="px-1.5 py-0.5 rounded bg-[var(--card-hover)]">gh auth login</code> in your terminal to authenticate.
						</p>
					</Card.Footer>
				</Card>

				{/* Appearance */}
				<Card>
					<Card.Header>
						<h2 className="text-lg font-medium">Appearance</h2>
					</Card.Header>
					<Card.Content>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Theme</p>
								<p className="text-xs text-[var(--muted)]">
									Choose your preferred color scheme
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									variant="secondary"
									size="sm"
									onClick={() => document.documentElement.setAttribute('data-theme', 'dark')}
								>
									Dark
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => document.documentElement.setAttribute('data-theme', 'light')}
								>
									Light
								</Button>
							</div>
						</div>
					</Card.Content>
				</Card>

				{/* About */}
				<Card>
					<Card.Header>
						<h2 className="text-lg font-medium">About Pondus</h2>
					</Card.Header>
					<Card.Content>
						<div className="space-y-3 text-sm">
							<div className="flex justify-between">
								<span className="text-[var(--muted)]">Version</span>
								<span>1.0.0</span>
							</div>
							<div className="flex justify-between">
								<span className="text-[var(--muted)]">Built by</span>
								<span className="text-[var(--accent)]">Darkroom Engineering</span>
							</div>
							<div className="flex justify-between">
								<span className="text-[var(--muted)]">Framework</span>
								<span>Tauri + React</span>
							</div>
						</div>
					</Card.Content>
				</Card>
			</div>
		</div>
	)
}
