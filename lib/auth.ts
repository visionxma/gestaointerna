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
    console.log("[Firebase Auth] Criando conta para:", email)
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    console.log("[Firebase Auth] Conta criada, atualizando perfil...")
    
    // Update user profile with name and photo
    let photoURL = null
    if (foto) {
      console.log("[Firebase Storage] Fazendo upload da foto...")
      const photoRef = ref(storage, `profile-photos/${user.uid}`)
      await uploadBytes(photoRef, foto)
      photoURL = await getDownloadURL(photoRef)
      console.log("[Firebase Storage] Foto enviada com sucesso")
    }

    await updateProfile(user, {
      displayName: nome || null,
      photoURL: photoURL,
    })

    console.log("[Firebase Auth] Perfil atualizado com sucesso")
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    console.error("[Firebase Auth] Erro ao criar conta:", error)
    return { user: null, error: error.message }
  }
}

export const fazerLogin = async (email: string, password: string) => {
  try {
    console.log("[Firebase Auth] Fazendo login para:", email)
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log("[Firebase Auth] Login realizado com sucesso")
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    console.error("[Firebase Auth] Erro no login:", error)
    return { user: null, error: error.message }
  }
}

export const fazerLogout = async () => {
  try {
    console.log("[Firebase Auth] Fazendo logout...")
    await signOut(auth)
    console.log("[Firebase Auth] Logout realizado com sucesso")
    return { error: null }
  } catch (error: any) {
    console.error("[Firebase Auth] Erro no logout:", error)
    return { error: error.message }
  }
}

export const observarEstadoAuth = (callback: (user: User | null) => void) => {
  console.log("[Firebase Auth] Iniciando observação do estado de autenticação")
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

    console.log("[Firebase Auth] Atualizando perfil do usuário")
    const user = auth.currentUser
    let photoURL = dados.photoURL

    // Se uma nova foto foi fornecida, fazer upload
    if (dados.foto) {
      console.log("[Firebase Storage] Fazendo upload da nova foto...")
      const photoRef = ref(storage, `profile-photos/${user.uid}`)
      await uploadBytes(photoRef, dados.foto)
      photoURL = await getDownloadURL(photoRef)
      console.log("[Firebase Storage] Nova foto enviada com sucesso")
    }

    // Atualizar perfil do usuário
    await updateProfile(user, {
      displayName: dados.displayName || user.displayName,
      photoURL: photoURL || user.photoURL,
    })

    console.log("[Firebase Auth] Perfil atualizado com sucesso")
    return { success: true, error: null }
  } catch (error: any) {
    console.error("[Firebase Auth] Erro ao atualizar perfil:", error)
    return { success: false, error: error.message }
  }
}

export const atualizarEmail = async (novoEmail: string) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    console.log("[Firebase Auth] Atualizando email...")
    await updateEmail(auth.currentUser, novoEmail)
    console.log("[Firebase Auth] Email atualizado com sucesso")
    return { success: true, error: null }
  } catch (error: any) {
    console.error("[Firebase Auth] Erro ao atualizar email:", error)
    return { success: false, error: error.message }
  }
}

export const atualizarSenha = async (novaSenha: string) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    console.log("[Firebase Auth] Atualizando senha...")
    await updatePassword(auth.currentUser, novaSenha)
    console.log("[Firebase Auth] Senha atualizada com sucesso")
    return { success: true, error: null }
  } catch (error: any) {
    console.error("[Firebase Auth] Erro ao atualizar senha:", error)
    return { success: false, error: error.message }
  }
}