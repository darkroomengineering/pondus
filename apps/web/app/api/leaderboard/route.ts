import { NextResponse } from 'next/server'

// Mock data - in production, this would query a database
// that aggregates GitHub API data periodically
const leaderboardData = [
	{ rank: 1, name: 'vercel', avatarUrl: 'https://avatars.githubusercontent.com/u/14985020', commits: 12847, prs: 3421, issues: 1892, contributors: 89, trend: 'up' },
	{ rank: 2, name: 'facebook', avatarUrl: 'https://avatars.githubusercontent.com/u/69631', commits: 11203, prs: 2987, issues: 2341, contributors: 156, trend: 'same' },
	{ rank: 3, name: 'microsoft', avatarUrl: 'https://avatars.githubusercontent.com/u/6154722', commits: 10892, prs: 2654, issues: 3102, contributors: 203, trend: 'up' },
	{ rank: 4, name: 'google', avatarUrl: 'https://avatars.githubusercontent.com/u/1342004', commits: 9876, prs: 2341, issues: 1876, contributors: 178, trend: 'down' },
	{ rank: 5, name: 'apple', avatarUrl: 'https://avatars.githubusercontent.com/u/10639145', commits: 8234, prs: 1987, issues: 892, contributors: 92, trend: 'up' },
	{ rank: 6, name: 'netflix', avatarUrl: 'https://avatars.githubusercontent.com/u/913567', commits: 7654, prs: 1876, issues: 743, contributors: 67, trend: 'same' },
	{ rank: 7, name: 'airbnb', avatarUrl: 'https://avatars.githubusercontent.com/u/698437', commits: 7123, prs: 1654, issues: 621, contributors: 54, trend: 'up' },
	{ rank: 8, name: 'stripe', avatarUrl: 'https://avatars.githubusercontent.com/u/856813', commits: 6987, prs: 1543, issues: 534, contributors: 48, trend: 'up' },
	{ rank: 9, name: 'uber', avatarUrl: 'https://avatars.githubusercontent.com/u/19107568', commits: 6543, prs: 1432, issues: 487, contributors: 76, trend: 'down' },
	{ rank: 10, name: 'twitter', avatarUrl: 'https://avatars.githubusercontent.com/u/50278', commits: 6234, prs: 1321, issues: 423, contributors: 61, trend: 'same' },
	{ rank: 11, name: 'shopify', avatarUrl: 'https://avatars.githubusercontent.com/u/8085', commits: 5987, prs: 1287, issues: 398, contributors: 89, trend: 'up' },
	{ rank: 12, name: 'spotify', avatarUrl: 'https://avatars.githubusercontent.com/u/251374', commits: 5654, prs: 1198, issues: 367, contributors: 72, trend: 'same' },
	{ rank: 13, name: 'linkedin', avatarUrl: 'https://avatars.githubusercontent.com/u/357098', commits: 5432, prs: 1123, issues: 334, contributors: 98, trend: 'up' },
	{ rank: 14, name: 'slack', avatarUrl: 'https://avatars.githubusercontent.com/u/6962987', commits: 5123, prs: 1034, issues: 298, contributors: 45, trend: 'down' },
	{ rank: 15, name: 'cloudflare', avatarUrl: 'https://avatars.githubusercontent.com/u/314135', commits: 4876, prs: 987, issues: 276, contributors: 67, trend: 'up' },
	{ rank: 16, name: 'digitalocean', avatarUrl: 'https://avatars.githubusercontent.com/u/4650108', commits: 4654, prs: 923, issues: 254, contributors: 43, trend: 'same' },
	{ rank: 17, name: 'hashicorp', avatarUrl: 'https://avatars.githubusercontent.com/u/761456', commits: 4432, prs: 876, issues: 234, contributors: 89, trend: 'up' },
	{ rank: 18, name: 'mozilla', avatarUrl: 'https://avatars.githubusercontent.com/u/131524', commits: 4234, prs: 834, issues: 456, contributors: 156, trend: 'same' },
	{ rank: 19, name: 'docker', avatarUrl: 'https://avatars.githubusercontent.com/u/5429470', commits: 4098, prs: 798, issues: 345, contributors: 78, trend: 'down' },
	{ rank: 20, name: 'github', avatarUrl: 'https://avatars.githubusercontent.com/u/9919', commits: 3987, prs: 765, issues: 234, contributors: 123, trend: 'up' },
]

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const limit = parseInt(searchParams.get('limit') || '20', 10)
	const offset = parseInt(searchParams.get('offset') || '0', 10)
	const sortBy = searchParams.get('sortBy') || 'commits'

	// Sort data
	const sortedData = [...leaderboardData].sort((a, b) => {
		const key = sortBy as keyof typeof a
		if (typeof a[key] === 'number' && typeof b[key] === 'number') {
			return (b[key] as number) - (a[key] as number)
		}
		return 0
	})

	// Re-rank after sorting
	const rankedData = sortedData.map((item, index) => ({
		...item,
		rank: index + 1,
	}))

	// Paginate
	const paginatedData = rankedData.slice(offset, offset + limit)

	return NextResponse.json({
		data: paginatedData,
		meta: {
			total: leaderboardData.length,
			limit,
			offset,
			sortBy,
		},
	})
}
