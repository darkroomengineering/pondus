import { create } from 'zustand'
import { useAuthStore } from './auth'
import type {
	Organization,
	Member,
	Team,
	Repository,
	CommitStats,
} from '@specto/core'

export type Timeframe = '7d' | '30d' | '90d' | 'ytd' | 'all'
export type MetricType = 'commits' | 'prs' | 'issues' | 'reviews'

// Request cache with TTL (5 minutes default)
const REQUEST_CACHE_TTL = 5 * 60 * 1000
const requestCache = new Map<string, { data: unknown; timestamp: number }>()

function getCacheKey(endpoint: string): string {
	return endpoint
}

function getFromCache<T>(key: string): T | null {
	const cached = requestCache.get(key)
	if (cached && Date.now() - cached.timestamp < REQUEST_CACHE_TTL) {
		return cached.data as T
	}
	if (cached) {
		requestCache.delete(key)
	}
	return null
}

function setCache(key: string, data: unknown): void {
	requestCache.set(key, { data, timestamp: Date.now() })
}

// In-flight request deduplication
const inFlightRequests = new Map<string, Promise<unknown>>()

interface PRStats {
	author: string
	count: number
	merged: number
}

interface IssueStats {
	author: string
	opened: number
	closed: number
}

interface OrgData {
	info: Organization | null
	members: Member[]
	teams: Team[]
	repos: Repository[]
	commitStats: CommitStats[]
	prStats: PRStats[]
	issueStats: IssueStats[]
	totalPRs: number
	totalIssues: number
	totalLinesAdded: number
	totalLinesDeleted: number
}

interface GitHubState {
	currentOrg: string | null
	orgData: OrgData
	timeframe: Timeframe
	metricType: MetricType
	isLoading: {
		info: boolean
		members: boolean
		teams: boolean
		repos: boolean
		commits: boolean
		prs: boolean
		issues: boolean
	}
	error: string | null
	setOrg: (org: string) => void
	setTimeframe: (tf: Timeframe) => void
	setMetricType: (mt: MetricType) => void
	fetchOrgInfo: () => Promise<void>
	fetchMembers: () => Promise<void>
	fetchTeams: () => Promise<void>
	fetchRepos: () => Promise<void>
	fetchCommitStats: () => Promise<void>
	fetchPRStats: () => Promise<void>
	fetchIssueStats: () => Promise<void>
	fetchAll: () => Promise<void>
	clearCache: () => void
}

function getDateSince(timeframe: Timeframe): string {
	const now = new Date()
	switch (timeframe) {
		case '7d':
			now.setDate(now.getDate() - 7)
			break
		case '30d':
			now.setDate(now.getDate() - 30)
			break
		case '90d':
			now.setDate(now.getDate() - 90)
			break
		case 'ytd':
			return `${now.getFullYear()}-01-01T00:00:00Z`
		case 'all':
			return '2008-01-01T00:00:00Z' // GitHub's founding year
	}
	return now.toISOString()
}

async function githubFetch<T>(endpoint: string, skipCache = false): Promise<T> {
	const cacheKey = getCacheKey(endpoint)

	// Check cache first (unless skipped)
	if (!skipCache) {
		const cached = getFromCache<T>(cacheKey)
		if (cached) {
			return cached
		}
	}

	// Deduplicate in-flight requests
	const inFlight = inFlightRequests.get(cacheKey)
	if (inFlight) {
		return inFlight as Promise<T>
	}

	const token = await useAuthStore.getState().getToken()
	if (!token) throw new Error('Not authenticated')

	const fetchPromise = (async () => {
		const response = await fetch(`https://api.github.com${endpoint}`, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
			},
		})

		if (!response.ok) {
			throw new Error(`GitHub API error: ${response.status}`)
		}

		const data = await response.json() as T
		setCache(cacheKey, data)
		return data
	})()

	inFlightRequests.set(cacheKey, fetchPromise)

	try {
		const result = await fetchPromise
		return result
	} finally {
		inFlightRequests.delete(cacheKey)
	}
}

export const useGitHubStore = create<GitHubState>((set, get) => ({
	currentOrg: null,
	orgData: {
		info: null,
		members: [],
		teams: [],
		repos: [],
		commitStats: [],
		prStats: [],
		issueStats: [],
		totalPRs: 0,
		totalIssues: 0,
		totalLinesAdded: 0,
		totalLinesDeleted: 0,
	},
	timeframe: 'ytd',
	metricType: 'commits',
	isLoading: {
		info: false,
		members: false,
		teams: false,
		repos: false,
		commits: false,
		prs: false,
		issues: false,
	},
	error: null,

	setOrg: (org) => {
		set({
			currentOrg: org,
			orgData: {
				info: null,
				members: [],
				teams: [],
				repos: [],
				commitStats: [],
				prStats: [],
				issueStats: [],
				totalPRs: 0,
				totalIssues: 0,
				totalLinesAdded: 0,
				totalLinesDeleted: 0,
			},
			error: null,
		})
	},

	setTimeframe: (timeframe) => {
		set({ timeframe })
		// Refetch stats with new timeframe
		const { fetchCommitStats, fetchPRStats, fetchIssueStats } = get()
		Promise.all([fetchCommitStats(), fetchPRStats(), fetchIssueStats()])
	},

	setMetricType: (metricType) => {
		set({ metricType })
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
		const { currentOrg, orgData, timeframe } = get()
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

			const since = getDateSince(timeframe)

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

	fetchPRStats: async () => {
		const { currentOrg, orgData, timeframe } = get()
		if (!currentOrg) return

		set((s) => ({ isLoading: { ...s.isLoading, prs: true } }))

		try {
			let repos = orgData.repos
			if (repos.length === 0) {
				repos = await githubFetch<Repository[]>(`/orgs/${currentOrg}/repos?per_page=100&sort=pushed`)
				set((s) => ({ orgData: { ...s.orgData, repos } }))
			}

			const topRepos = repos.slice(0, 10)
			const prsByAuthor = new Map<string, { count: number; merged: number }>()
			let totalPRs = 0

			const since = getDateSince(timeframe)

			await Promise.all(
				topRepos.map(async (repo) => {
					try {
						const prs = await githubFetch<Array<{
							user?: { login: string }
							merged_at: string | null
							created_at: string
						}>>(`/repos/${repo.full_name}/pulls?state=all&per_page=100&sort=created&direction=desc`)

						for (const pr of prs) {
							if (new Date(pr.created_at) < new Date(since)) continue
							totalPRs++
							if (pr.user?.login) {
								const current = prsByAuthor.get(pr.user.login) ?? { count: 0, merged: 0 }
								current.count++
								if (pr.merged_at) current.merged++
								prsByAuthor.set(pr.user.login, current)
							}
						}
					} catch {
						// Skip repos we can't access
					}
				})
			)

			const prStats: PRStats[] = Array.from(prsByAuthor.entries())
				.map(([author, stats]) => ({ author, count: stats.count, merged: stats.merged }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 10)

			set((s) => ({
				orgData: { ...s.orgData, prStats, totalPRs },
				isLoading: { ...s.isLoading, prs: false },
			}))
		} catch (err) {
			set((s) => ({ isLoading: { ...s.isLoading, prs: false } }))
		}
	},

	fetchIssueStats: async () => {
		const { currentOrg, orgData, timeframe } = get()
		if (!currentOrg) return

		set((s) => ({ isLoading: { ...s.isLoading, issues: true } }))

		try {
			let repos = orgData.repos
			if (repos.length === 0) {
				repos = await githubFetch<Repository[]>(`/orgs/${currentOrg}/repos?per_page=100&sort=pushed`)
				set((s) => ({ orgData: { ...s.orgData, repos } }))
			}

			const topRepos = repos.slice(0, 10)
			const issuesByAuthor = new Map<string, { opened: number; closed: number }>()
			let totalIssues = 0

			const since = getDateSince(timeframe)

			await Promise.all(
				topRepos.map(async (repo) => {
					try {
						const issues = await githubFetch<Array<{
							user?: { login: string }
							state: string
							created_at: string
							pull_request?: unknown
						}>>(`/repos/${repo.full_name}/issues?state=all&per_page=100&since=${since}`)

						for (const issue of issues) {
							// Skip pull requests (they show up in issues endpoint too)
							if (issue.pull_request) continue
							if (new Date(issue.created_at) < new Date(since)) continue
							totalIssues++
							if (issue.user?.login) {
								const current = issuesByAuthor.get(issue.user.login) ?? { opened: 0, closed: 0 }
								current.opened++
								if (issue.state === 'closed') current.closed++
								issuesByAuthor.set(issue.user.login, current)
							}
						}
					} catch {
						// Skip repos we can't access
					}
				})
			)

			const issueStats: IssueStats[] = Array.from(issuesByAuthor.entries())
				.map(([author, stats]) => ({ author, opened: stats.opened, closed: stats.closed }))
				.sort((a, b) => b.opened - a.opened)
				.slice(0, 10)

			set((s) => ({
				orgData: { ...s.orgData, issueStats, totalIssues },
				isLoading: { ...s.isLoading, issues: false },
			}))
		} catch (err) {
			set((s) => ({ isLoading: { ...s.isLoading, issues: false } }))
		}
	},

	fetchAll: async () => {
		const { currentOrg, fetchOrgInfo, fetchMembers, fetchTeams, fetchRepos } = get()
		if (!currentOrg) return

		// Phase 1: Fetch org info, members, teams, and repos in parallel
		// Repos are needed by all stats functions, so fetch them first
		await Promise.all([
			fetchOrgInfo(),
			fetchMembers(),
			fetchTeams(),
			fetchRepos(),
		])

		// Phase 2: Now fetch all stats in parallel (they'll use cached repos)
		const { fetchCommitStats, fetchPRStats, fetchIssueStats } = get()
		await Promise.all([
			fetchCommitStats(),
			fetchPRStats(),
			fetchIssueStats(),
		])
	},

	// Clear cache for current org (useful for manual refresh)
	clearCache: () => {
		requestCache.clear()
	},
}))
