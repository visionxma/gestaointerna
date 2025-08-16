import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  type User,
} from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { auth, storage } from "./firebase"

export const criarConta = async (email: string, password: string, nome?: string, foto?: File | null) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update user profile with name and photo
    let photoURL = null
    if (foto) {
      const photoRef = ref(storage, `profile-photos/${user.uid}`)
      await uploadBytes(photoRef, foto)
      photoURL = await getDownloadURL(photoRef)
    }

    await updateProfile(user, {
      displayName: nome || null,
      photoURL: photoURL,
    })

    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const fazerLogin = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const fazerLogout = async () => {
  try {
    await signOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const observarEstadoAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

export const atualizarPerfil = async (dados: {
  displayName?: string
  photoURL?: string
  foto?: File | null
}) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const user = auth.currentUser
    let photoURL = dados.photoURL

    // Se uma nova foto foi fornecida, fazer upload
    if (dados.foto) {
      const photoRef = ref(storage, `profile-photos/${user.uid}`)
      await uploadBytes(photoRef, dados.foto)
      photoURL = await getDownloadURL(photoRef)
    }

    // Atualizar perfil do usuário
    await updateProfile(user, {
      displayName: dados.displayName || user.displayName,
      photoURL: photoURL || user.photoURL,
    })

    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const atualizarEmail = async (novoEmail: string) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    await updateEmail(auth.currentUser, novoEmail)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const atualizarSenha = async (novaSenha: string) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    await updatePassword(auth.currentUser, novaSenha)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}