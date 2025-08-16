import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  type User,
  AuthError,
} from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { auth, storage } from "./firebase"

// Função para traduzir erros do Firebase
const translateFirebaseError = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Este email já está cadastrado. Tente fazer login ou use outro email.',
    'auth/weak-password': 'A senha é muito fraca. Use pelo menos 6 caracteres com letras e números.',
    'auth/invalid-email': 'Email inválido. Verifique o formato do email.',
    'auth/user-disabled': 'Esta conta foi desabilitada. Entre em contato com o suporte.',
    'auth/user-not-found': 'Usuário não encontrado. Verifique o email ou crie uma nova conta.',
    'auth/wrong-password': 'Senha incorreta. Tente novamente.',
    'auth/invalid-credential': 'Email ou senha incorretos. Verifique suas credenciais.',
    'auth/too-many-requests': 'Muitas tentativas de login. Tente novamente em alguns minutos.',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet e tente novamente.',
    'auth/operation-not-allowed': 'Operação não permitida. Entre em contato com o suporte.',
    'auth/requires-recent-login': 'Esta operação requer login recente. Faça login novamente.',
    'storage/unauthorized': 'Erro ao fazer upload da foto. Tente novamente.',
    'storage/canceled': 'Upload cancelado.',
    'storage/unknown': 'Erro desconhecido no upload da foto.',
  }

  return errorMessages[errorCode] || 'Erro inesperado. Tente novamente.'
}

export const criarConta = async (email: string, password: string, nome?: string, foto?: File | null) => {
  try {
    // Validações básicas
    if (!email || !email.trim()) {
      return { user: null, error: 'Email é obrigatório' }
    }

    if (!password || password.length < 6) {
      return { user: null, error: 'A senha deve ter pelo menos 6 caracteres' }
    }

    if (!nome || !nome.trim()) {
      return { user: null, error: 'Nome é obrigatório' }
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { user: null, error: 'Formato de email inválido' }
    }

    console.log("[Firebase Auth] Criando conta para:", email)
    
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)
    const user = userCredential.user

    console.log("[Firebase Auth] Conta criada, atualizando perfil...")
    
    // Update user profile with name and photo
    let photoURL = null
    if (foto) {
      try {
        console.log("[Firebase Storage] Fazendo upload da foto...")
        
        // Validar tamanho do arquivo (máximo 5MB)
        if (foto.size > 5 * 1024 * 1024) {
          return { user: null, error: 'A foto deve ter no máximo 5MB' }
        }

        // Validar tipo do arquivo
        if (!foto.type.startsWith('image/')) {
          return { user: null, error: 'Apenas arquivos de imagem são permitidos' }
        }

        const photoRef = ref(storage, `profile-photos/${user.uid}`)
        await uploadBytes(photoRef, foto)
        photoURL = await getDownloadURL(photoRef)
        console.log("[Firebase Storage] Foto enviada com sucesso")
      } catch (uploadError: any) {
        console.error("[Firebase Storage] Erro no upload:", uploadError)
        // Não falha a criação da conta por causa da foto
        console.log("[Firebase Auth] Continuando sem foto devido ao erro no upload")
      }
    }

    await updateProfile(user, {
      displayName: nome.trim(),
      photoURL: photoURL,
    })

    console.log("[Firebase Auth] Perfil atualizado com sucesso")
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    console.error("[Firebase Auth] Erro ao criar conta:", error)
    
    const errorCode = error.code || 'unknown'
    const errorMessage = translateFirebaseError(errorCode)
    
    return { user: null, error: errorMessage }
  }
}

export const fazerLogin = async (email: string, password: string) => {
  try {
    // Validações básicas
    if (!email || !email.trim()) {
      return { user: null, error: 'Email é obrigatório' }
    }

    if (!password || !password.trim()) {
      return { user: null, error: 'Senha é obrigatória' }
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { user: null, error: 'Formato de email inválido' }
    }

    console.log("[Firebase Auth] Fazendo login para:", email)
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password)
    console.log("[Firebase Auth] Login realizado com sucesso")
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    console.error("[Firebase Auth] Erro no login:", error)
    
    const errorCode = error.code || 'unknown'
    const errorMessage = translateFirebaseError(errorCode)
    
    return { user: null, error: errorMessage }
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
    
    const errorCode = error.code || 'unknown'
    const errorMessage = translateFirebaseError(errorCode)
    
    return { error: errorMessage }
  }
}

export const observarEstadoAuth = (callback: (user: User | null) => void) => {
  console.log("[Firebase Auth] Iniciando observação do estado de autenticação")
  return onAuthStateChanged(auth, (user) => {
    console.log("[Firebase Auth] Estado alterado:", user ? `Logado como ${user.email}` : "Deslogado")
    callback(user)
  })
}

export const atualizarPerfil = async (dados: {
  displayName?: string
  photoURL?: string
  foto?: File | null
}) => {
  try {
    if (!auth.currentUser) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    console.log("[Firebase Auth] Atualizando perfil do usuário")
    const user = auth.currentUser
    let photoURL = dados.photoURL

    // Se uma nova foto foi fornecida, fazer upload
    if (dados.foto) {
      try {
        // Validar tamanho do arquivo (máximo 5MB)
        if (dados.foto.size > 5 * 1024 * 1024) {
          return { success: false, error: 'A foto deve ter no máximo 5MB' }
        }

        // Validar tipo do arquivo
        if (!dados.foto.type.startsWith('image/')) {
          return { success: false, error: 'Apenas arquivos de imagem são permitidos' }
        }

        console.log("[Firebase Storage] Fazendo upload da nova foto...")
        const photoRef = ref(storage, `profile-photos/${user.uid}`)
        await uploadBytes(photoRef, dados.foto)
        photoURL = await getDownloadURL(photoRef)
        console.log("[Firebase Storage] Nova foto enviada com sucesso")
      } catch (uploadError: any) {
        console.error("[Firebase Storage] Erro no upload:", uploadError)
        const errorCode = uploadError.code || 'unknown'
        const errorMessage = translateFirebaseError(errorCode)
        return { success: false, error: errorMessage }
      }
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
    
    const errorCode = error.code || 'unknown'
    const errorMessage = translateFirebaseError(errorCode)
    
    return { success: false, error: errorMessage }
  }
}

export const atualizarEmail = async (novoEmail: string) => {
  try {
    if (!auth.currentUser) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    if (!novoEmail || !novoEmail.trim()) {
      return { success: false, error: 'Email é obrigatório' }
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(novoEmail)) {
      return { success: false, error: 'Formato de email inválido' }
    }

    console.log("[Firebase Auth] Atualizando email...")
    await updateEmail(auth.currentUser, novoEmail.trim())
    console.log("[Firebase Auth] Email atualizado com sucesso")
    return { success: true, error: null }
  } catch (error: any) {
    console.error("[Firebase Auth] Erro ao atualizar email:", error)
    
    const errorCode = error.code || 'unknown'
    const errorMessage = translateFirebaseError(errorCode)
    
    return { success: false, error: errorMessage }
  }
}

export const atualizarSenha = async (novaSenha: string) => {
  try {
    if (!auth.currentUser) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    if (!novaSenha || novaSenha.length < 6) {
      return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' }
    }

    console.log("[Firebase Auth] Atualizando senha...")
    await updatePassword(auth.currentUser, novaSenha)
    console.log("[Firebase Auth] Senha atualizada com sucesso")
    return { success: true, error: null }
  } catch (error: any) {
    console.error("[Firebase Auth] Erro ao atualizar senha:", error)
    
    const errorCode = error.code || 'unknown'
    const errorMessage = translateFirebaseError(errorCode)
    
    return { success: false, error: errorMessage }
  }
}