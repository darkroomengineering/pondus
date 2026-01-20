import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboardData, LEADERBOARD_CATEGORIES, type LeaderboardCategory } from '@/lib/github'

// Enable ISR with 30 minute revalidation
export const revalidate = 1800

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams
	const category = searchParams.get('category') as LeaderboardCategory | null

	// Validate category
	const validCategory = LEADERBOARD_CATEGORIES.find(c => c.value === category)?.value || 'developer-favorites'

	try {
		const data = await getLeaderboardData(validCategory)
		return NextResponse.json(
			{ data, category: validCategory },
			{
				headers: {
					// CDN cache for 1 hour, allow stale for 24 hours while revalidating
					'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
				},
			}
		)
	} catch (error) {
		console.error('Leaderboard API error:', error)
		return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
	}
}
