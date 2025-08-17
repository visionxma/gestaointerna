import { initializeApp } from "firebase/app"
import { getFirestore, connectFirestoreEmulator, enableNetwork } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDBPRwam-s7G9TvyRdbfTyj31jP6nfL8Vw",
  authDomain: "gestaovision-eabff.firebaseapp.com",
  projectId: "gestaovision-eabff",
  storageBucket: "gestaovision-eabff.firebasestorage.app",
  messagingSenderId: "372178187682",
  appId: "1:372178187682:web:a9aa4e3e7bbb4ec0e86efb",
  measurementId: "G-D9RXKBJRK4",
}

const app = initializeApp(firebaseConfig)

// Configurar Firestore com otimizações
export const db = getFirestore(app)

// Habilitar persistência offline para melhor performance
if (typeof window !== "undefined") {
  enableNetwork(db).catch(console.error)
}

export const auth = getAuth(app)
export const storage = getStorage(app)

let analytics: any = null
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}
export { analytics }
