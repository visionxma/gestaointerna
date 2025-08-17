import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

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

// Analytics removido para evitar problemas em produção estática
