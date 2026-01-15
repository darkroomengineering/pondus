import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Stat, Table, Badge, Button } from '@pondus/ui'
import { useGitHubStore } from '../stores/github'
import { Spinner } from '../components/spinner'

export function Organization() {
	const { orgName } = useParams<{ orgName: string }>()
	const navigate = useNavigate()
	const { currentOrg, orgData, isLoading, error, setOrg, fetchAll } = useGitHubStore()

	useEffect(() => {
		if (orgName && orgName !== currentOrg) {
			setOrg(orgName)
		}
	}, [orgName, currentOrg, setOrg])

	useEffect(() => {
		if (currentOrg) {
			fetchAll()
		}
	}, [currentOrg, fetchAll])

	const { info, members, teams, commitStats, repos } = orgData
	const totalCommits = commitStats.reduce((sum, s) => sum + s.count, 0)

	return (
		<div className="h-full flex flex-col p-6 overflow-auto">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
						← Back
					</Button>
					<div>
						<h1 className="text-2xl font-semibold text-[var(--foreground)] flex items-center gap-2">
							{orgName}
							{isLoading.info ? (
								<Spinner size="sm" />
							) : info ? (
								<Badge variant="success">Connected</Badge>
							) : error ? (
								<Badge variant="error">Error</Badge>
							) : null}
						</h1>
						{info?.description && (
							<p className="text-sm text-[var(--muted)] mt-1">{info.description}</p>
						)}
					</div>
				</div>
			</div>

			{/* Error state */}
			{error && (
				<Card className="mb-6 border-[var(--color-error)]">
					<Card.Content>
						<p className="text-[var(--color-error)] text-sm">{error}</p>
						<Button variant="secondary" size="sm" className="mt-2" onClick={fetchAll}>
							Retry
						</Button>
					</Card.Content>
				</Card>
			)}

			{/* Stats grid */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<Stat
					label="Total Commits"
					value={isLoading.commits ? '...' : totalCommits || '—'}
					description={`${new Date().getFullYear()} YTD`}
				/>
				<Stat
					label="Members"
					value={isLoading.members ? '...' : members.length || '—'}
					description="Organization members"
				/>
				<Stat
					label="Teams"
					value={isLoading.teams ? '...' : teams.length || '—'}
					description="Active teams"
				/>
				<Stat
					label="Repositories"
					value={isLoading.repos ? '...' : repos.length || info?.public_repos || '—'}
					description="Total repos"
				/>
			</div>

			{/* Content grid */}
			<div className="grid lg:grid-cols-2 gap-6 flex-1">
				{/* Top contributors */}
				<Card className="flex flex-col">
					<Card.Header>
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-medium">Top Contributors</h2>
							{isLoading.commits && <Spinner size="sm" />}
						</div>
					</Card.Header>
					<Card.Content className="flex-1 p-0">
						{isLoading.commits && commitStats.length === 0 ? (
							<div className="flex items-center justify-center h-32">
								<Spinner />
							</div>
						) : commitStats.length === 0 ? (
							<div className="flex items-center justify-center h-32 text-[var(--muted)] text-sm">
								No commit data available
							</div>
						) : (
							<Table>
								<Table.Header>
									<Table.Row>
										<Table.Head>Author</Table.Head>
										<Table.Head className="text-right">Commits</Table.Head>
										<Table.Head className="text-right">Share</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{commitStats.slice(0, 5).map((stat) => (
										<Table.Row key={stat.author}>
											<Table.Cell className="font-medium">{stat.author}</Table.Cell>
											<Table.Cell className="text-right text-[var(--accent)]">
												{stat.count}
											</Table.Cell>
											<Table.Cell className="text-right text-[var(--muted)]">
												{totalCommits > 0 ? `${((stat.count / totalCommits) * 100).toFixed(1)}%` : '—'}
											</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table>
						)}
					</Card.Content>
				</Card>

				{/* Teams */}
				<Card className="flex flex-col">
					<Card.Header>
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-medium">Teams</h2>
							{isLoading.teams && <Spinner size="sm" />}
						</div>
					</Card.Header>
					<Card.Content className="flex-1 p-0">
						{isLoading.teams && teams.length === 0 ? (
							<div className="flex items-center justify-center h-32">
								<Spinner />
							</div>
						) : teams.length === 0 ? (
							<div className="flex items-center justify-center h-32 text-[var(--muted)] text-sm">
								No teams found
							</div>
						) : (
							<Table>
								<Table.Header>
									<Table.Row>
										<Table.Head>Team</Table.Head>
										<Table.Head>Privacy</Table.Head>
										<Table.Head className="text-right">Members</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{teams.slice(0, 5).map((team) => (
										<Table.Row key={team.id}>
											<Table.Cell className="font-medium">{team.name}</Table.Cell>
											<Table.Cell>
												<Badge variant={team.privacy === 'secret' ? 'warning' : 'success'}>
													{team.privacy}
												</Badge>
											</Table.Cell>
											<Table.Cell className="text-right">{team.members_count}</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table>
						)}
					</Card.Content>
				</Card>
			</div>
		</div>
	)
}
