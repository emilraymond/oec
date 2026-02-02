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
const db = getFirestore(app);

// --- 1. Global Navbar Injection ---
function injectNavbar(lang, userEmail = null, userName = null) {
    const navPlaceholder = document.getElementById('navbar-placeholder');
    if (!navPlaceholder) return;

    const isAr = lang === 'ar';
    const brand = "OFEC";
    const homeText = isAr ? "الرئيسية" : "Home";
    const aboutText = isAr ? "من نحن" : "About";
    const contactText = isAr ? "اتصل بنا" : "Contact";
    const langLink = isAr ? "../en/home.html" : "../ar/home.html";
    const langText = isAr ? "English" : "العربية";

    let authHtml = "";
    if (userEmail) {
        const displayName = userName || userEmail;
        authHtml = `
            <span class="navbar-text mx-3 text-light small">${isAr ? 'أهلاً' : 'Hello'} ${displayName}</span>
            <button id="logout-btn" class="btn btn-sm btn-danger">${isAr ? 'خروج' : 'Logout'}</button>`;
    } else {
        authHtml = `<a class="nav-link" href="login.html">${isAr ? 'دخول المسئول' : 'Admin Login'}</a>`;
    }

    navPlaceholder.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow">
        <div class="container">
            <a class="navbar-brand fw-bold" href="home.html">${brand}</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-center">
                    <li class="nav-item"><a class="nav-link" href="home.html">${homeText}</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">${aboutText}</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">${contactText}</a></li>
                    <li class="nav-item d-flex align-items-center">${authHtml}</li>
                    <li class="nav-item ms-lg-3">
                        <a class="btn btn-sm btn-outline-light" href="${langLink}">${langText}</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>`;

    // Re-attach logout event
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => signOut(auth).then(() => window.location.reload());
    }
}

// Initial call to prevent "disappearing" navbar
document.addEventListener('DOMContentLoaded', () => {
    const lang = document.documentElement.lang || 'ar';
    injectNavbar(lang); 
});

// Auth State Listener for Dynamic Updates
onAuthStateChanged(auth, async (user) => {
    const lang = document.documentElement.lang || 'ar';
    let userName = null;

    if (user) {
        try {
            const userRef = doc(db, "users", user.email);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) userName = userSnap.data().name;
        } catch (e) { console.error("Firestore error:", e); }
        
        const welcomeHeader = document.getElementById('welcome-header');
        if (welcomeHeader) {
            welcomeHeader.innerText = (lang === 'ar' ? "أهلاً " : "Hello ") + (userName || user.email);
        }
    }
    // Re-inject with user data
    injectNavbar(lang, user?.email, userName);
});

export { auth, db };