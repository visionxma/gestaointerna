// Utilitários específicos para dispositivos móveis

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export const isLowEndDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  // Detectar dispositivos com pouca memória
  const memory = (navigator as any).deviceMemory
  if (memory && memory < 4) return true
  
  // Detectar conexão lenta
  const connection = (navigator as any).connection
  if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
    return true
  }
  
  return false
}

export const optimizeForMobile = () => {
  if (typeof window === 'undefined') return
  
  // Reduzir animações em dispositivos lentos
  if (isLowEndDevice()) {
    document.documentElement.style.setProperty('--animation-duration', '0.1s')
    document.documentElement.style.setProperty('--transition-duration', '0.1s')
  }
  
  // Configurar viewport para mobile
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
  }
}

export const handleMobileMemory = () => {
  if (typeof window === 'undefined') return
  
  // Limpar cache quando a memória estiver baixa
  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory
    const usedMemory = memory.usedJSHeapSize / memory.jsHeapSizeLimit
    
    if (usedMemory > 0.8) {
      console.warn('Memória baixa detectada - limpando cache')
      // Limpar caches se necessário
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name)
          })
        })
      }
    }
  }
}

// Debounce para otimizar eventos em mobile
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle para scroll events em mobile
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Detectar quando o app vai para background (mobile)
export const onAppBackground = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {}
  
  const handleVisibilityChange = () => {
    if (document.hidden) {
      callback()
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('pagehide', callback)
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('pagehide', callback)
  }
}

// Preload crítico para mobile
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return
  
  // Preload da logo
  const logoLink = document.createElement('link')
  logoLink.rel = 'preload'
  logoLink.href = 'https://i.imgur.com/nVflzaY.png'
  logoLink.as = 'image'
  document.head.appendChild(logoLink)
}