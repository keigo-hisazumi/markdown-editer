import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCnKO59rdLDpDbXmbIgY8Fd97Dg6peOKAg',
  authDomain: 'markdown-editer.firebaseapp.com',
  projectId: 'markdown-editer',
  storageBucket: 'markdown-editer.firebasestorage.app',
  messagingSenderId: '171321933510',
  appId: '1:171321933510:web:5b78e93644042e13fc21c7',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
// browserLocalPersistence は Firebase Auth のデフォルトのため setPersistence 不要
export const db = getFirestore(app)
