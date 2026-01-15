import { useState } from 'react'
import { Card, Button, Badge } from '@specto/ui'
import { useAuthStore } from '../stores/auth'
import { useLicenseStore, useProFeature, FREE_LIMITS } from '../stores/license'
import { Spinner } from '../components/spinner'
import { open } from '@tauri-apps/plugin-shell'

export function Settings() {
	const { isAuthenticated, isLoading, username, error, checkAuth } = useAuthStore()
	const {
		licenseKey,
		isPro: licenseIsPro,
		isValidating,
		error: licenseError,
		activatedAt,
		setLicenseKey,
		clearLicense,
	} = useLicenseStore()
	const { isPro, isDev } = useProFeature()
	const [keyInput, setKeyInput] = useState('')

	return (
		<div className="h-full flex flex-col p-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-[var(--foreground)]">Settings</h1>
				<p className="text-sm text-[var(--muted)] mt-1">
					Configure your Specto preferences
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

				{/* License / Pro */}
				<Card className={isPro ? 'border-[var(--accent)]' : ''}>
					<Card.Header>
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-medium">Specto Pro</h2>
							<div className="flex items-center gap-2">
								{isDev && (
									<Badge>Dev Mode</Badge>
								)}
								{isPro ? (
									<Badge variant="success">Pro Active</Badge>
								) : (
									<Badge>Free Plan</Badge>
								)}
							</div>
						</div>
					</Card.Header>
					<Card.Content>
						{isPro ? (
							<div className="space-y-4">
								<div className="p-4 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
									<div className="flex items-center gap-2 mb-2">
										<svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<span className="font-medium text-[var(--accent)]">Pro features unlocked</span>
									</div>
									<ul className="text-sm text-[var(--muted)] space-y-1 ml-7">
										<li>Unlimited organizations</li>
										<li>Unlimited history</li>
										<li>Export to CSV/JSON</li>
									</ul>
								</div>
								{activatedAt && (
									<p className="text-xs text-[var(--muted)]">
										Activated on {new Date(activatedAt).toLocaleDateString()}
									</p>
								)}
								<Button variant="ghost" size="sm" onClick={clearLicense}>
									Deactivate License
								</Button>
							</div>
						) : (
							<div className="space-y-4">
								<div className="p-4 rounded-lg bg-[var(--card-hover)] border border-[var(--border)]">
									<p className="text-sm font-medium mb-2">Free plan limits:</p>
									<ul className="text-sm text-[var(--muted)] space-y-1">
										<li>• {FREE_LIMITS.maxOrganizations} organizations max</li>
										<li>• {FREE_LIMITS.historyDays}-day history</li>
										<li>• No exports</li>
									</ul>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">
										Enter license key
									</label>
									<div className="flex gap-2">
										<input
											type="text"
											value={keyInput}
											onChange={(e) => setKeyInput(e.target.value)}
											placeholder="SPECTO_XXXX-XXXX-XXXX"
											className="flex-1 px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
										/>
										<Button
											onClick={() => {
												if (keyInput.trim()) {
													setLicenseKey(keyInput.trim())
													setKeyInput('')
												}
											}}
											disabled={!keyInput.trim() || isValidating}
										>
											{isValidating ? <Spinner size="sm" /> : 'Activate'}
										</Button>
									</div>
								</div>

								{licenseError && (
									<div className="py-2 px-3 rounded-md bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
										<p className="text-sm text-[var(--color-error)]">{licenseError}</p>
									</div>
								)}

								<div className="pt-2 border-t border-[var(--border)]">
									<p className="text-sm text-[var(--muted)] mb-2">Don't have a license?</p>
									<Button
										variant="secondary"
										size="sm"
										onClick={() => open('https://specto.darkroom.engineering/downloads')}
									>
										Get Specto Pro
									</Button>
								</div>
							</div>
						)}
					</Card.Content>
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
						<h2 className="text-lg font-medium">About Specto</h2>
					</Card.Header>
					<Card.Content>
						<div className="space-y-3 text-sm">
							<div className="flex justify-between">
								<span className="text-[var(--muted)]">Version</span>
								<span>1.1.0</span>
							</div>
							<div className="flex justify-between">
								<span className="text-[var(--muted)]">Plan</span>
								<span className={isPro ? 'text-[var(--accent)]' : ''}>
									{isPro ? 'Pro' : 'Free'}
								</span>
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
