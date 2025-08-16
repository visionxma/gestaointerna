import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
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
