import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sistema VisionX",
  description: "Sistema de Gestão Interno VisionX",
  generator: "v0.app",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VisionX",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/images/visionx-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/images/visionx-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/images/visionx-logo.png", sizes: "180x180", type: "image/png" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" type="image/png" href="/images/visionx-logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VisionX" />
        <link rel="apple-touch-icon" href="/images/visionx-logo.png" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/images/visionx-logo.png" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              // iOS Safari compatibility fixes
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', function() {
                  // Verificar se o SW existe antes de tentar registrar
                  fetch('/sw.js', { method: 'HEAD' })
                    .then(() => {
                      return navigator.serviceWorker.register('/sw.js', {
                        scope: '/'
                      });
                    })
                    .then(function(registration) {
                      console.log('[App] SW registered successfully:', registration.scope);
                      
                      // Handle updates
                      registration.addEventListener('updatefound', () => {
                        console.log('[App] SW update found');
                      });
                    })
                    .catch(function(error) {
                      console.log('[App] SW registration failed or SW not found:', error);
                      // Continue without SW - não é crítico
                    });
                });
              }

              // iOS Safari specific fixes
              if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                // Prevent zoom on input focus
                document.addEventListener('touchstart', function() {}, true);
                
                // Fix viewport issues
                const viewport = document.querySelector('meta[name=viewport]');
                if (viewport) {
                  viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover');
                }
              }

              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('Hydration')) {
                  console.warn('[App] Hydration error detected, but continuing:', e.message);
                  e.preventDefault();
                }
              });
            `,
          }}
        />

        <style>{`
/* Reverted to system default fonts */
html {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  /* Otimizações para mobile */
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* iOS Safari specific fixes */
body {
  /* Fix iOS Safari bounce */
  position: fixed;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

#__next, [data-reactroot] {
  height: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

/* Melhorar performance de scroll em mobile */
* {
  -webkit-overflow-scrolling: touch;
}

/* iOS Safari input fixes */
input, textarea, select {
  -webkit-appearance: none;
  border-radius: 0;
}

/* Reduzir animações em dispositivos com pouca bateria */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster />
          <PWAInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  )
}
