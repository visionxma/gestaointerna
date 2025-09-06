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

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})
