/**
 * admin.js - Handles Authentication actions
 * Linked to login.html
 */

// We import the auth instance already initialized in main.js
import { auth } from './main.js';
import { 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorDiv = document.getElementById('error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Clear previous errors
            errorDiv.classList.add('d-none');
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            console.log("Attempting login for:", email);

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    console.log("Login Successful:", userCredential.user.email);
                    // Redirect to Home (main.js on home.html will handle the Welcome message)
                    window.location.href = "home.html";
                })
                .catch((error) => {
                    // Log specific error to console for debugging
                    console.error("Login Failed. Code:", error.code, "Message:", error.message);
                    
                    const lang = document.documentElement.lang;
                    let displayMsg;

                    // User-friendly error mapping
                    switch (error.code) {
                        case 'auth/user-not-found':
                        case 'auth/wrong-password':
                        case 'auth/invalid-credential':
                            displayMsg = (lang === 'ar') ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : "Invalid email or password";
                            break;
                        case 'auth/too-many-requests':
                            displayMsg = (lang === 'ar') ? "محاولات كثيرة خاطئة. يرجى المحاولة لاحقاً" : "Too many attempts. Try again later.";
                            break;
                        case 'auth/operation-not-allowed':
                            displayMsg = "Error: Email/Password provider not enabled in Firebase Console.";
                            break;
                        default:
                            displayMsg = (lang === 'ar') ? "حدث خطأ ما. يرجى المحاولة مرة أخرى" : "An error occurred. Please try again.";
                    }

                    errorDiv.innerText = displayMsg;
                    errorDiv.classList.remove('d-none');
                });
        });
    }

    /**
     * Password Reset Logic
     * Attached to window so the 'onclick' attribute in HTML can find it
     */
    window.handleForgotPassword = () => {
        const email = document.getElementById('email').value;
        const lang = document.documentElement.lang;

        if (!email) {
            const msg = (lang === 'ar') ? "يرجى كتابة البريد الإلكتروني أولاً في الخانة المخصصة" : "Please enter your email address first";
            alert(msg);
            return;
        }

        sendPasswordResetEmail(auth, email)
            .then(() => {
                const successMsg = (lang === 'ar') ? "تم إرسال رابط استعادة كلمة المرور إلى بريدك" : "Password reset link sent to your email!";
                alert(successMsg);
            })
            .catch((error) => {
                console.error("Reset Error:", error.code);
                alert("Error: " + error.message);
            });
    };
});