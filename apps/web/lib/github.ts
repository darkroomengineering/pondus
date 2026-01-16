// GitHub API functions for fetching org metrics
// Used for the live leaderboard on the homepage

interface OrgStats {
	name: string
	avatarUrl: string
	commits: number
	prs: number
	contributors: number
	repos: number
	stars: number
}

interface CacheEntry {
	data: OrgStats[]
	timestamp: number
}

// In-memory cache (resets on server restart)
let cache: CacheEntry | null = null
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

// Featured orgs to track
const FEATURED_ORGS = [
	'vercel',
	'facebook',
	'microsoft',
	'google',
	'apple',
]

async function fetchOrgStats(org: string): Promise<OrgStats | null> {
	try {
		// Fetch org info
		const orgRes = await fetch(`https://api.github.com/orgs/${org}`, {
			headers: {
				Accept: 'application/vnd.github+json',
				'User-Agent': 'Specto-Web/1.0',
			},
			next: { revalidate: 3600 }, // Cache for 1 hour
		})

		if (!orgRes.ok) return null
		const orgData = await orgRes.json()

		// Fetch recent activity (repos sorted by push)
		const reposRes = await fetch(
			`https://api.github.com/orgs/${org}/repos?sort=pushed&per_page=10`,
			{
				headers: {
					Accept: 'application/vnd.github+json',
					'User-Agent': 'Specto-Web/1.0',
				},
				next: { revalidate: 3600 },
			}
		)

		let totalStars = 0
		let estimatedCommits = 0
		let estimatedPRs = 0
		const contributorSet = new Set<string>()

		if (reposRes.ok) {
			const repos = await reposRes.json()
			for (const repo of repos) {
				totalStars += repo.stargazers_count || 0

				// Estimate activity based on repo size and recent pushes
				// This is a rough estimate without auth - real data requires token
				const daysSinceUpdate = Math.max(
					1,
					Math.floor(
						(Date.now() - new Date(repo.pushed_at).getTime()) /
							(1000 * 60 * 60 * 24)
					)
				)
				const activityScore = Math.max(1, 30 - daysSinceUpdate)
				estimatedCommits += activityScore * 10
				estimatedPRs += Math.floor(activityScore * 2)
			}
		}

		// Estimate contributors from org members
		const membersRes = await fetch(
			`https://api.github.com/orgs/${org}/members?per_page=100`,
			{
				headers: {
					Accept: 'application/vnd.github+json',
					'User-Agent': 'Specto-Web/1.0',
				},
				next: { revalidate: 3600 },
			}
		)

		let contributorCount = 50 // Default estimate
		if (membersRes.ok) {
			const members = await membersRes.json()
			contributorCount = members.length || 50
		}

		return {
			name: org,
			avatarUrl: orgData.avatar_url,
			commits: estimatedCommits,
			prs: estimatedPRs,
			contributors: contributorCount,
			repos: orgData.public_repos || 0,
			stars: totalStars,
		}
	} catch (error) {
		console.error(`Failed to fetch stats for ${org}:`, error)
		return null
	}
}

export async function getLeaderboardData(): Promise<OrgStats[]> {
	// Check cache
	if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
		return cache.data
	}

	// Fetch all orgs in parallel
	const results = await Promise.all(FEATURED_ORGS.map(fetchOrgStats))

	// Filter out nulls and sort by commits
	const stats = results
		.filter((r): r is OrgStats => r !== null)
		.sort((a, b) => b.commits - a.commits)

	// Update cache
	cache = { data: stats, timestamp: Date.now() }

	return stats
}

// Fallback data if API fails
export const fallbackLeaderboardData: OrgStats[] = [
	{ name: 'vercel', avatarUrl: 'https://avatars.githubusercontent.com/u/14985020', commits: 12847, prs: 3421, contributors: 89, repos: 156, stars: 45000 },
	{ name: 'facebook', avatarUrl: 'https://avatars.githubusercontent.com/u/69631', commits: 11203, prs: 2987, contributors: 156, repos: 234, stars: 180000 },
	{ name: 'microsoft', avatarUrl: 'https://avatars.githubusercontent.com/u/6154722', commits: 10892, prs: 2654, contributors: 203, repos: 567, stars: 250000 },
	{ name: 'google', avatarUrl: 'https://avatars.githubusercontent.com/u/1342004', commits: 9876, prs: 2341, contributors: 178, repos: 432, stars: 120000 },
	{ name: 'apple', avatarUrl: 'https://avatars.githubusercontent.com/u/10639145', commits: 8234, prs: 1987, contributors: 92, repos: 87, stars: 35000 },
]
