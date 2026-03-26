import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDXhARnXoCnGWDBrBR_xBoZxTEjjFv9XWI",
  authDomain: "webapps-51eea.firebaseapp.com",
  projectId: "webapps-51eea",
  storageBucket: "webapps-51eea.firebasestorage.app",
  messagingSenderId: "19986102561",
  appId: "1:19986102561:web:6f4ed119c891c9db686660",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
