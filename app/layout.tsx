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
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', function() {
                  // Verificar se o SW existe antes de tentar registrar
                  fetch('/sw.js', { method: 'HEAD' })
                    .then(response => {
                      if (response.ok) {
                        return navigator.serviceWorker.register('/sw.js', {
                          scope: '/'
                        });
                      } else {
                        throw new Error('Service worker não encontrado');
                      }
                    })
                    .then(function(registration) {
                      console.log('[App] SW registered successfully:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('[App] SW não disponível, continuando sem PWA features');
                    });
                });
              }

              window.addEventListener('error', function(e) {
                if (e.message && (e.message.includes('Hydration') || e.message.includes('Minified React error'))) {
                  console.warn('[App] React hydration/render error suppressed:', e.message);
                  e.preventDefault();
                  return false;
                }
              });

              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.message && e.reason.message.includes('Minified React error')) {
                  console.warn('[App] React error suppressed:', e.reason.message);
                  e.preventDefault();
                }
              });
            `,
          }}
        />

        <style>{`
/* Simplificar CSS para evitar problemas de hidratação */
html {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  -webkit-overflow-scrolling: touch;
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
