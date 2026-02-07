// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    push, 
    onValue,
    child 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { 
    getStorage, 
    ref as sRef, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDqrGDBtbzNjhUD9VXpqwZNAOfrIU9T8lY",
  authDomain: "pankaj-enterprises.firebaseapp.com",
  databaseURL: "https://pankaj-enterprises-default-rtdb.firebaseio.com",
  projectId: "pankaj-enterprises",
  storageBucket: "pankaj-enterprises.firebasestorage.app",
  messagingSenderId: "848043005564",
  appId: "1:848043005564:web:1303bc830075d102c65bf9",
  measurementId: "G-W6LWPJ7YEM"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Export everything needed
export { 
    auth, database, storage, 
    signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged,
    ref, set, get, push, onValue, child,
    sRef, uploadBytes, getDownloadURL
};
