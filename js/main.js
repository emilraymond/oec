import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDuKjlMyF_yguCmTZAPKWjyFB5Mh5CEIUA",
    authDomain: "ofec-church.firebaseapp.com",
    projectId: "ofec-church",
    storageBucket: "ofec-church.firebasestorage.app",
    messagingSenderId: "457371590528",
    appId: "1:457371590528:web:b668e3fbf926cec268ab65",
    measurementId: "G-Q606ZZ38Y3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

onAuthStateChanged(auth, async (user) => {
    const lang = document.documentElement.lang;
    const authSection = document.getElementById('nav-auth-section');
    const welcomeHeader = document.getElementById('welcome-header');

    if (user) {
        // 1. Fetch the user's name from Firestore
        const userDocRef = doc(db, "users", user.email);
        const userDoc = await getDoc(userDocRef);
        
        let displayName = user.email; // Default to email
        if (userDoc.exists()) {
            displayName = userDoc.data().name; // Use the name from DB
        }

        // 2. Update UI
        const logoutText = lang === 'ar' ? "خروج" : "Logout";
        authSection.innerHTML = `<button id="logout-btn" class="btn btn-sm btn-danger">${logoutText}</button>`;
        
        const helloPrefix = lang === 'ar' ? "أهلاً" : "Hello";
        if (welcomeHeader) welcomeHeader.innerText = `${helloPrefix} ${displayName}`;

        document.getElementById('logout-btn').addEventListener('click', () => {
            signOut(auth).then(() => window.location.reload());
        });
    } else {
        const loginText = lang === 'ar' ? "دخول المسؤول" : "Admin Login";
        authSection.innerHTML = `<a class="nav-link" href="login.html">${loginText}</a>`;
    }
});

export { auth };