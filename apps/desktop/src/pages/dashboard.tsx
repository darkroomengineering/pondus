import { Card, Stat, Button } from '@pondus/ui'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

export function Dashboard() {
	const [orgInput, setOrgInput] = useState('')
	const navigate = useNavigate()
	const { username } = useAuthStore()

	const handleAddOrg = () => {
		if (orgInput.trim()) {
			navigate(`/org/${orgInput.trim()}`)
		}
	}

	return (
		<div className="h-full flex flex-col p-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-[var(--foreground)]">Dashboard</h1>
				<p className="text-sm text-[var(--muted)] mt-1">
					Welcome back, <span className="text-[var(--accent)]">{username}</span>
				</p>
			</div>

			{/* Quick add organization */}
			<Card className="mb-6">
				<Card.Content>
					<div className="flex items-center gap-4">
						<input
							type="text"
							value={orgInput}
							onChange={(e) => setOrgInput(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleAddOrg()}
							placeholder="Enter organization name (e.g., darkroomengineering)"
							className="flex-1 px-4 py-2.5 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
						/>
						<Button onClick={handleAddOrg} disabled={!orgInput.trim()}>
							View Metrics
						</Button>
					</div>
				</Card.Content>
			</Card>

			{/* Quick stats placeholder */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<Stat label="Organizations" value={0} description="Connected" />
				<Stat label="Total Commits" value="—" description="This year" />
				<Stat label="Contributors" value="—" description="Active" />
				<Stat label="Repositories" value="—" description="Total" />
			</div>

			{/* Getting started */}
			<Card className="flex-1">
				<Card.Header>
					<h2 className="text-lg font-medium">Getting Started</h2>
				</Card.Header>
				<Card.Content>
					<div className="space-y-4 text-sm text-[var(--muted)]">
						<p>
							Welcome to <span className="text-[var(--accent)] font-medium">Pondus</span> — your GitHub organization metrics dashboard.
						</p>
						<ol className="list-decimal list-inside space-y-2">
							<li>Enter an organization name above to view its metrics</li>
							<li>Browse commit statistics, member activity, teams, and more</li>
							<li>Data is fetched in real-time from the GitHub API</li>
						</ol>
						<p className="pt-2 text-xs border-t border-[var(--border)]">
							Tip: Try <code className="px-1.5 py-0.5 rounded bg-[var(--card-hover)] text-[var(--foreground)]">darkroomengineering</code> or your own organization.
						</p>
					</div>
				</Card.Content>
			</Card>
		</div>
	)
}
