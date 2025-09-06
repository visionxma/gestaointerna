const CACHE_NAME = "visionx-v1"
const urlsToCache = [
  "/",
  "/login",
  "/clientes",
  "/despesas",
  "/receitas",
  "/orcamentos",
  "/projetos",
  "/recibos",
  "/senhas",
  "/kanban",
  "/images/visionx-logo.png",
]

// iOS Safari compatibility: Add error handling and skip opaque responses
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching files...")
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.error("[SW] Cache failed:", error)
      }),
  )
  // Force activation immediately
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  // Take control immediately
  self.clients.claim()
})

// iOS Safari compatibility: Better fetch handling
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== "GET" || event.request.url.startsWith("chrome-extension://")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log("[SW] Serving from cache:", event.request.url)
        return response
      }

      console.log("[SW] Fetching from network:", event.request.url)
      return fetch(event.request)
        .then((response) => {
          // Don't cache opaque responses (CORS issues)
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response for caching
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch((error) => {
          console.error("[SW] Fetch failed:", error)
          // Return a basic offline page or cached version
          return caches.match("/") || new Response("Offline", { status: 503 })
        })
    }),
  )
})
