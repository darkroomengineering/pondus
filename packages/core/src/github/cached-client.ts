import { getToken } from './auth'
import type { CacheStore } from '../cache/types'
import { getMemoryCache } from '../cache/memory'
import { deduplicatedFetch, cachedFetch } from '../cache'
import { GitHubError, RateLimitError } from './client'
import type { Organization, Repository, Member, Team, Commit } from '../types'

const BASE_URL = 'https://api.github.com'

// Store ETags for conditional requests
const etagStore = new Map<string, string>()

interface CachedFetchOptions {
	method?: string
	body?: string
	params?: Record<string, string | number | undefined>
	cache?: CacheStore
	ttl?: number
	skipCache?: boolean
	useEtag?: boolean
}

interface FetchResult<T> {
	data: T
	etag?: string
	fromCache: boolean
	notModified?: boolean
}

/**
 * Enhanced GitHub fetch with caching and ETag support
 */
async function githubFetchCached<T>(
	endpoint: string,
	options: CachedFetchOptions = {}
): Promise<FetchResult<T>> {
	const token = await getToken()
	const {
		method = 'GET',
		body,
		params,
		cache = getMemoryCache(),
		ttl = 5 * 60 * 1000,
		skipCache = false,
		useEtag = true,
	} = options

	const url = new URL(`${BASE_URL}${endpoint}`)
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				url.searchParams.set(key, String(value))
			}
		}
	}

	const cacheKey = `github:${url.toString()}`

	// Check cache first (for GET requests only)
	if (method === 'GET' && !skipCache) {
		const cached = await cache.get<T>(cacheKey)
		if (cached && Date.now() < cached.expiresAt) {
			return { data: cached.data, fromCache: true, etag: cached.etag }
		}
	}

	// Build headers
	const headers: Record<string, string> = {
		Authorization: `Bearer ${token}`,
		Accept: 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28',
	}

	if (body) {
		headers['Content-Type'] = 'application/json'
	}

	// Add ETag for conditional request
	const storedEtag = useEtag ? etagStore.get(cacheKey) : undefined
	if (storedEtag && method === 'GET') {
		headers['If-None-Match'] = storedEtag
	}

	const response = await fetch(url.toString(), { method, headers, body })

	// Handle 304 Not Modified - return cached data
	if (response.status === 304) {
		const cached = await cache.get<T>(cacheKey)
		if (cached) {
			// Refresh the cache entry's expiration
			await cache.set(cacheKey, {
				...cached,
				expiresAt: Date.now() + ttl,
			})
			return { data: cached.data, fromCache: true, notModified: true, etag: storedEtag }
		}
	}

	// Handle errors
	if (!response.ok) {
		const resetHeader = response.headers.get('x-ratelimit-reset')
		if (response.status === 403 && resetHeader) {
			const resetAt = new Date(Number.parseInt(resetHeader) * 1000)
			throw new RateLimitError(resetAt, await response.text())
		}
		throw new GitHubError(response.status, response.statusText, await response.text())
	}

	const data = (await response.json()) as T

	// Store ETag for future conditional requests
	const etag = response.headers.get('etag')
	if (etag && method === 'GET') {
		etagStore.set(cacheKey, etag)
	}

	// Cache the response
	if (method === 'GET') {
		await cache.set(cacheKey, {
			data,
			timestamp: Date.now(),
			etag: etag ?? undefined,
			expiresAt: Date.now() + ttl,
		})
	}

	return { data, fromCache: false, etag: etag ?? undefined }
}

/**
 * Batch processor for concurrent operations with rate limit awareness
 */
export async function batchProcess<T, R>(
	items: T[],
	processor: (item: T) => Promise<R>,
	options: {
		concurrency?: number
		onProgress?: (completed: number, total: number) => void
		signal?: AbortSignal
	} = {}
): Promise<R[]> {
	const { concurrency = 10, onProgress, signal } = options
	const results: R[] = []
	let completed = 0

	// Process in batches
	for (let i = 0; i < items.length; i += concurrency) {
		if (signal?.aborted) {
			throw new Error('Batch processing aborted')
		}

		const batch = items.slice(i, i + concurrency)
		const batchResults = await Promise.all(
			batch.map(async (item) => {
				const result = await processor(item)
				completed++
				onProgress?.(completed, items.length)
				return result
			})
		)
		results.push(...batchResults)
	}

	return results
}

/**
 * Retry with exponential backoff
 */
export async function withRetry<T>(
	fn: () => Promise<T>,
	options: {
		maxRetries?: number
		baseDelay?: number
		maxDelay?: number
		onRetry?: (error: Error, attempt: number) => void
	} = {}
): Promise<T> {
	const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000, onRetry } = options

	let lastError: Error | undefined
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn()
		} catch (error) {
			lastError = error as Error

			// Don't retry on non-retryable errors
			if (error instanceof GitHubError && error.status < 500 && error.status !== 429) {
				throw error
			}

			if (attempt < maxRetries) {
				// Exponential backoff with jitter
				const delay = Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 1000, maxDelay)
				onRetry?.(lastError, attempt + 1)
				await new Promise((resolve) => setTimeout(resolve, delay))
			}
		}
	}

	throw lastError
}

// ============================================================================
// Cached API Functions
// ============================================================================

export interface CachedClientOptions {
	cache?: CacheStore
	ttl?: number
	skipCache?: boolean
}

/**
 * Get organization with caching
 */
export async function getOrganizationCached(
	org: string,
	options: CachedClientOptions = {}
): Promise<{ data: Organization; fromCache: boolean }> {
	const { cache = getMemoryCache(), ttl = 10 * 60 * 1000, skipCache = false } = options

	return cachedFetch(cache, `org:${org}`, async () => {
		const result = await githubFetchCached<Organization>(`/orgs/${org}`, { cache, ttl, skipCache })
		return result.data
	}, { ttl, skipCache })
}

/**
 * Get organization repositories with caching
 */
export async function getOrgReposCached(
	org: string,
	options: CachedClientOptions & { maxPages?: number } = {}
): Promise<{ data: Repository[]; fromCache: boolean }> {
	const { cache = getMemoryCache(), ttl = 5 * 60 * 1000, skipCache = false, maxPages } = options

	return cachedFetch(cache, `repos:${org}`, async () => {
		const repos: Repository[] = []
		let page = 1
		const perPage = 100

		while (true) {
			if (maxPages && page > maxPages) break

			const result = await githubFetchCached<Repository[]>(`/orgs/${org}/repos`, {
				cache,
				ttl,
				skipCache: true, // Don't cache individual pages
				params: { type: 'all', sort: 'pushed', page, per_page: perPage },
			})

			repos.push(...result.data)
			if (result.data.length < perPage) break
			page++
		}

		return repos
	}, { ttl, skipCache })
}

/**
 * Get organization members with caching
 */
export async function getOrgMembersCached(
	org: string,
	options: CachedClientOptions = {}
): Promise<{ data: Member[]; fromCache: boolean }> {
	const { cache = getMemoryCache(), ttl = 10 * 60 * 1000, skipCache = false } = options

	return cachedFetch(cache, `members:${org}`, async () => {
		const members: Member[] = []
		let page = 1
		const perPage = 100

		while (true) {
			const result = await githubFetchCached<Member[]>(`/orgs/${org}/members`, {
				cache,
				ttl,
				skipCache: true,
				params: { page, per_page: perPage },
			})

			members.push(...result.data)
			if (result.data.length < perPage) break
			page++
		}

		return members
	}, { ttl, skipCache })
}

/**
 * Get organization teams with caching
 */
export async function getOrgTeamsCached(
	org: string,
	options: CachedClientOptions = {}
): Promise<{ data: Team[]; fromCache: boolean }> {
	const { cache = getMemoryCache(), ttl = 10 * 60 * 1000, skipCache = false } = options

	return cachedFetch(cache, `teams:${org}`, async () => {
		const teams: Team[] = []
		let page = 1
		const perPage = 100

		while (true) {
			const result = await githubFetchCached<Team[]>(`/orgs/${org}/teams`, {
				cache,
				ttl,
				skipCache: true,
				params: { page, per_page: perPage },
			})

			teams.push(...result.data)
			if (result.data.length < perPage) break
			page++
		}

		return teams
	}, { ttl, skipCache })
}

/**
 * Get commits for multiple repos in parallel with caching
 */
export async function getCommitsForReposCached(
	repos: Repository[],
	options: CachedClientOptions & {
		since?: string
		until?: string
		concurrency?: number
		onProgress?: (completed: number, total: number) => void
	} = {}
): Promise<Map<string, Commit[]>> {
	const {
		cache = getMemoryCache(),
		ttl = 5 * 60 * 1000,
		skipCache = false,
		since,
		until,
		concurrency = 10,
		onProgress,
	} = options

	const results = new Map<string, Commit[]>()

	await batchProcess(
		repos,
		async (repo) => {
			const cacheKey = `commits:${repo.full_name}:${since ?? 'all'}:${until ?? 'now'}`

			const { data: commits } = await cachedFetch(cache, cacheKey, async () => {
				const repoCommits: Commit[] = []
				let page = 1
				const perPage = 100

				while (true) {
					try {
						const result = await githubFetchCached<Commit[]>(
							`/repos/${repo.full_name}/commits`,
							{
								cache,
								ttl,
								skipCache: true,
								params: { since, until, page, per_page: perPage },
							}
						)

						repoCommits.push(...result.data)
						if (result.data.length < perPage) break
						page++
					} catch (error) {
						// Skip repos with no commits or access issues
						if (error instanceof GitHubError && (error.status === 409 || error.status === 404)) {
							break
						}
						throw error
					}
				}

				return repoCommits
			}, { ttl, skipCache })

			results.set(repo.full_name, commits)
		},
		{ concurrency, onProgress }
	)

	return results
}

/**
 * Clear all GitHub-related caches
 */
export function clearGitHubCache(cache?: CacheStore): Promise<void> {
	etagStore.clear()
	return (cache ?? getMemoryCache()).clear()
}
