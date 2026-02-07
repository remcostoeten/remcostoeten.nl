const CACHE_NAME = 'app-cache-v1'
const SPOTIFY_CACHE = 'spotify-api-v1'
const GITHUB_CACHE = 'github-api-v1'

// Cache strategy for API calls
self.addEventListener('fetch', event => {
	const { request } = event
	const url = new URL(request.url)

	// Cache Spotify API responses (stale-while-revalidate)
	if (url.pathname.includes('/api/spotify/')) {
		event.respondWith(
			caches.open(SPOTIFY_CACHE).then(cache => {
				return cache.match(request).then(cachedResponse => {
					// Return cached response immediately if available
					if (cachedResponse) {
						// Fetch in background to update cache
						fetch(request)
							.then(freshResponse => {
								if (freshResponse.ok) {
									cache.put(request, freshResponse.clone())
								}
							})
							.catch(() => {
								// Ignore fetch errors when updating cache
							})
						return cachedResponse
					}

					// Fetch and cache if not in cache
					return fetch(request).then(response => {
						if (response.ok) {
							const responseClone = response.clone()
							cache.put(request, responseClone)
						}
						return response
					})
				})
			})
		)
		return
	}

	// Cache GitHub API responses (cache-first)
	if (url.pathname.includes('/api/github/')) {
		event.respondWith(
			caches.open(GITHUB_CACHE).then(cache => {
				return cache.match(request).then(cachedResponse => {
					if (cachedResponse) {
						return cachedResponse
					}
					return fetch(request).then(response => {
						if (response.ok) {
							const responseClone = response.clone()
							cache.put(request, responseClone)
						}
						return response
					})
				})
			})
		)
		return
	}

	// Let other requests pass through
	event.respondWith(fetch(request))
})

// Clean up old caches
self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cacheName => {
					if (
						cacheName !== CACHE_NAME &&
						cacheName !== SPOTIFY_CACHE &&
						cacheName !== GITHUB_CACHE
					) {
						return caches.delete(cacheName)
					}
				})
			)
		})
	)
})
