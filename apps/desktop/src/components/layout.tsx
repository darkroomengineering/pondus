import { Outlet, NavLink } from 'react-router-dom'
import { cn } from '@pondus/ui'
import { useAuthStore } from '../stores/auth'

const navItems = [
	{ to: '/dashboard', label: 'Dashboard', icon: '📊' },
	{ to: '/settings', label: 'Settings', icon: '⚙️' },
]

export function Layout() {
	const { username } = useAuthStore()

	return (
		<div className="flex h-full">
			{/* Sidebar */}
			<aside className="w-56 flex-shrink-0 border-r border-[var(--border)] bg-[var(--card)] flex flex-col">
				{/* Logo */}
				<div className="h-14 flex items-center px-4 border-b border-[var(--border)]">
					<span className="text-lg font-semibold text-[var(--accent)]">pondus</span>
				</div>

				{/* Navigation */}
				<nav className="flex-1 p-2 space-y-1">
					{navItems.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							className={({ isActive }) =>
								cn(
									'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
									isActive
										? 'bg-[var(--accent)] text-white'
										: 'text-[var(--foreground)] hover:bg-[var(--card-hover)]'
								)
							}
						>
							<span>{item.icon}</span>
							<span>{item.label}</span>
						</NavLink>
					))}
				</nav>

				{/* User info */}
				{username && (
					<div className="p-4 border-t border-[var(--border)]">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-sm font-medium">
								{username[0]?.toUpperCase()}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">{username}</p>
								<p className="text-xs text-[var(--muted)]">Authenticated</p>
							</div>
						</div>
					</div>
				)}
			</aside>

			{/* Main content */}
			<main className="flex-1 overflow-auto">
				<Outlet />
			</main>
		</div>
	)
}
