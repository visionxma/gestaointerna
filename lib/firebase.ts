import { initializeApp } from "firebase/app"
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getStorage, connectStorageEmulator } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDBPRwam-s7G9TvyRdbfTyj31jP6nfL8Vw",
  authDomain: "gestaovision-eabff.firebaseapp.com",
  projectId: "gestaovision-eabff",
  storageBucket: "gestaovision-eabff.appspot.com", // ✅ corrigido
  messagingSenderId: "372178187682",
  appId: "1:372178187682:web:a9aa4e3e7bbb4ec0e86efb",
  measurementId: "G-D9RXKBJRK4",
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// Configurações para melhorar performance em mobile
if (typeof window !== 'undefined') {
  // Detectar se é mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (isMobile) {
    // Configurações específicas para mobile
    console.log('Dispositivo móvel detectado - aplicando otimizações')
    
    // Gerenciar conexão de rede para economizar recursos
    let isOnline = navigator.onLine
    
    const handleOnline = async () => {
      if (!isOnline) {
        try {
          await enableNetwork(db)
          isOnline = true
          console.log('Conexão Firestore reativada')
        } catch (error) {
          console.error('Erro ao reativar conexão:', error)
        }
      }
    }
    
    const handleOffline = async () => {
      if (isOnline) {
        try {
          await disableNetwork(db)
          isOnline = false
          console.log('Conexão Firestore pausada para economizar recursos')
        } catch (error) {
          console.error('Erro ao pausar conexão:', error)
        }
      }
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Pausar conexão quando a página não está visível (mobile background)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        handleOffline()
      } else {
        handleOnline()
      }
    })
  }
}
// Analytics removido para evitar problemas em produção estática
