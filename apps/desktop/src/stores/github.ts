import { create } from 'zustand'
import { useAuthStore } from './auth'
import type {
	Organization,
	Member,
	Team,
	Repository,
	CommitStats,
} from '@pondus/core'

interface OrgData {
	info: Organization | null
	members: Member[]
	teams: Team[]
	repos: Repository[]
	commitStats: CommitStats[]
}

interface GitHubState {
	currentOrg: string | null
	orgData: OrgData
	isLoading: {
		info: boolean
		members: boolean
		teams: boolean
		repos: boolean
		commits: boolean
	}
	error: string | null
	setOrg: (org: string) => void
	fetchOrgInfo: () => Promise<void>
	fetchMembers: () => Promise<void>
	fetchTeams: () => Promise<void>
	fetchRepos: () => Promise<void>
	fetchCommitStats: () => Promise<void>
	fetchAll: () => Promise<void>
}

async function githubFetch<T>(endpoint: string): Promise<T> {
	const token = await useAuthStore.getState().getToken()
	if (!token) throw new Error('Not authenticated')

	const response = await fetch(`https://api.github.com${endpoint}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github+json',
		},
	})

	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.status}`)
	}

	return response.json() as Promise<T>
}

export const useGitHubStore = create<GitHubState>((set, get) => ({
	currentOrg: null,
	orgData: {
		info: null,
		members: [],
		teams: [],
		repos: [],
		commitStats: [],
	},
	isLoading: {
		info: false,
		members: false,
		teams: false,
		repos: false,
		commits: false,
	},
	error: null,

	setOrg: (org) => {
		set({
			currentOrg: org,
			orgData: { info: null, members: [], teams: [], repos: [], commitStats: [] },
			error: null,
		})
	},

	fetchOrgInfo: async () => {
		const { currentOrg } = get()
		if (!currentOrg) return

		set((s) => ({ isLoading: { ...s.isLoading, info: true }, error: null }))
		try {
			const info = await githubFetch<Organization>(`/orgs/${currentOrg}`)
			set((s) => ({
				orgData: { ...s.orgData, info },
				isLoading: { ...s.isLoading, info: false },
			}))
		} catch (err) {
			set((s) => ({
				isLoading: { ...s.isLoading, info: false },
				error: err instanceof Error ? err.message : 'Failed to fetch org info',
			}))
		}
	},

	fetchMembers: async () => {
		const { currentOrg } = get()
		if (!currentOrg) return

		set((s) => ({ isLoading: { ...s.isLoading, members: true } }))
		try {
			const members = await githubFetch<Member[]>(`/orgs/${currentOrg}/members?per_page=100`)
			set((s) => ({
				orgData: { ...s.orgData, members },
				isLoading: { ...s.isLoading, members: false },
			}))
		} catch (err) {
			set((s) => ({ isLoading: { ...s.isLoading, members: false } }))
		}
	},

	fetchTeams: async () => {
		const { currentOrg } = get()
		if (!currentOrg) return

		set((s) => ({ isLoading: { ...s.isLoading, teams: true } }))
		try {
			const teams = await githubFetch<Team[]>(`/orgs/${currentOrg}/teams?per_page=100`)
			set((s) => ({
				orgData: { ...s.orgData, teams },
				isLoading: { ...s.isLoading, teams: false },
			}))
		} catch (err) {
			set((s) => ({ isLoading: { ...s.isLoading, teams: false } }))
		}
	},

	fetchRepos: async () => {
		const { currentOrg } = get()
		if (!currentOrg) return

		set((s) => ({ isLoading: { ...s.isLoading, repos: true } }))
		try {
			const repos = await githubFetch<Repository[]>(`/orgs/${currentOrg}/repos?per_page=100&sort=pushed`)
			set((s) => ({
				orgData: { ...s.orgData, repos },
				isLoading: { ...s.isLoading, repos: false },
			}))
		} catch (err) {
			set((s) => ({ isLoading: { ...s.isLoading, repos: false } }))
		}
	},

	fetchCommitStats: async () => {
		const { currentOrg, orgData } = get()
		if (!currentOrg) return

		set((s) => ({ isLoading: { ...s.isLoading, commits: true } }))

		try {
			// Get repos first if not loaded
			let repos = orgData.repos
			if (repos.length === 0) {
				repos = await githubFetch<Repository[]>(`/orgs/${currentOrg}/repos?per_page=100&sort=pushed`)
				set((s) => ({ orgData: { ...s.orgData, repos } }))
			}

			// Get commits from top 10 most active repos (to keep it fast)
			const topRepos = repos.slice(0, 10)
			const commitsByAuthor = new Map<string, number>()

			const year = new Date().getFullYear()
			const since = `${year}-01-01T00:00:00Z`

			await Promise.all(
				topRepos.map(async (repo) => {
					try {
						const commits = await githubFetch<Array<{ author?: { login: string } }>>(
							`/repos/${repo.full_name}/commits?per_page=100&since=${since}`
						)
						for (const commit of commits) {
							if (commit.author?.login) {
								const current = commitsByAuthor.get(commit.author.login) ?? 0
								commitsByAuthor.set(commit.author.login, current + 1)
							}
						}
					} catch {
						// Skip repos we can't access
					}
				})
			)

			const commitStats: CommitStats[] = Array.from(commitsByAuthor.entries())
				.map(([author, count]) => ({ author, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 10)

			set((s) => ({
				orgData: { ...s.orgData, commitStats },
				isLoading: { ...s.isLoading, commits: false },
			}))
		} catch (err) {
			set((s) => ({ isLoading: { ...s.isLoading, commits: false } }))
		}
	},

	fetchAll: async () => {
		const { fetchOrgInfo, fetchMembers, fetchTeams, fetchCommitStats } = get()
		await Promise.all([
			fetchOrgInfo(),
			fetchMembers(),
			fetchTeams(),
			fetchCommitStats(),
		])
	},
}))
