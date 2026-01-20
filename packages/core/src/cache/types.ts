/**
 * Cache configuration options
 */
export interface CacheOptions {
	/** Time-to-live in milliseconds (default: 5 minutes) */
	ttl?: number
	/** Allow serving stale data while revalidating in background (milliseconds) */
	staleWhileRevalidate?: number
	/** Maximum number of entries (for memory cache) */
	maxEntries?: number
}

/**
 * A cached entry with metadata
 */
export interface CacheEntry<T> {
	data: T
	timestamp: number
	etag?: string
	expiresAt: number
}

/**
 * Cache store interface - implement this for different storage backends
 */
export interface CacheStore {
	/** Get an entry from the cache */
	get<T>(key: string): Promise<CacheEntry<T> | null>

	/** Set an entry in the cache */
	set<T>(key: string, entry: CacheEntry<T>): Promise<void>

	/** Delete an entry from the cache */
	delete(key: string): Promise<void>

	/** Clear all entries from the cache */
	clear(): Promise<void>

	/** Check if an entry exists and is not expired */
	has(key: string): Promise<boolean>

	/** Get cache statistics */
	stats(): Promise<CacheStats>
}

/**
 * Cache statistics
 */
export interface CacheStats {
	hits: number
	misses: number
	entries: number
	size?: number // bytes, if available
}

/**
 * Options for cached fetch operations
 */
export interface CachedFetchOptions extends CacheOptions {
	/** Skip cache and fetch fresh data */
	skipCache?: boolean
	/** Force revalidation even if cache is fresh */
	forceRevalidate?: boolean
	/** Use ETag for conditional requests */
	useEtag?: boolean
}

/**
 * Result of a cached fetch operation
 */
export interface CachedFetchResult<T> {
	data: T
	fromCache: boolean
	stale: boolean
	etag?: string
}
