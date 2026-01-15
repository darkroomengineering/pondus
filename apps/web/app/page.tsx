import { Button, Card } from '@pondus/ui'

export default function Home() {
	return (
		<div className="min-h-screen">
			{/* Hero */}
			<header className="border-b border-[var(--border)]">
				<div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
					<span className="text-xl font-semibold text-[var(--accent)]">pondus</span>
					<nav className="flex items-center gap-6">
						<a href="#features" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
							Features
						</a>
						<a href="https://github.com/darkroomengineering/pondus" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
							GitHub
						</a>
						<Button size="sm">Download</Button>
					</nav>
				</div>
			</header>

			{/* Hero section */}
			<section className="max-w-6xl mx-auto px-6 py-24 text-center">
				<h1 className="text-5xl font-bold text-[var(--foreground)] mb-6">
					GitHub metrics,<br />
					<span className="text-[var(--accent)]">beautifully tracked</span>
				</h1>
				<p className="text-xl text-[var(--muted)] max-w-2xl mx-auto mb-8">
					Track commits, members, teams, and more across your GitHub organizations.
					Available as CLI, desktop app, or web dashboard.
				</p>
				<div className="flex items-center justify-center gap-4">
					<Button size="lg">Download Desktop</Button>
					<Button variant="secondary" size="lg">View on GitHub</Button>
				</div>
			</section>

			{/* Features */}
			<section id="features" className="max-w-6xl mx-auto px-6 py-16">
				<h2 className="text-3xl font-bold text-center mb-12">Three ways to track</h2>
				<div className="grid md:grid-cols-3 gap-6">
					<Card hover>
						<Card.Content className="text-center py-8">
							<div className="text-4xl mb-4">⌨️</div>
							<h3 className="text-lg font-semibold mb-2">CLI</h3>
							<p className="text-sm text-[var(--muted)]">
								Quick metrics from your terminal. Perfect for scripts and automation.
							</p>
						</Card.Content>
					</Card>
					<Card hover>
						<Card.Content className="text-center py-8">
							<div className="text-4xl mb-4">🖥️</div>
							<h3 className="text-lg font-semibold mb-2">Desktop</h3>
							<p className="text-sm text-[var(--muted)]">
								Native app with a beautiful UI. Track multiple orgs with ease.
							</p>
						</Card.Content>
					</Card>
					<Card hover>
						<Card.Content className="text-center py-8">
							<div className="text-4xl mb-4">🌐</div>
							<h3 className="text-lg font-semibold mb-2">Web</h3>
							<p className="text-sm text-[var(--muted)]">
								Access your metrics from anywhere. Share with your team.
							</p>
						</Card.Content>
					</Card>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-[var(--border)] bg-[var(--card)]">
				<div className="max-w-6xl mx-auto px-6 py-16 text-center">
					<h2 className="text-2xl font-bold mb-4">Ready to dive in?</h2>
					<p className="text-[var(--muted)] mb-6">
						Install with npm, brew, or download the desktop app.
					</p>
					<code className="inline-block px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm">
						npm install -g @pondus/cli
					</code>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-[var(--border)]">
				<div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
					<span className="text-sm text-[var(--muted)]">
						Built by <span className="text-[var(--accent)]">Darkroom Engineering</span>
					</span>
					<span className="text-sm text-[var(--muted)]">MIT License</span>
				</div>
			</footer>
		</div>
	)
}
