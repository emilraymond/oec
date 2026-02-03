document.addEventListener('DOMContentLoaded', () => {
    // Initial load of the navbar and footer
    loadLayout();
});

async function loadLayout() {
    try {
        const [navRes, footRes] = await Promise.all([
            fetch('/assets/navbar.html'),
            fetch('/assets/footer.html')
        ]);

        document.getElementById('navbar-placeholder').innerHTML = await navRes.text();
        document.getElementById('footer-placeholder').innerHTML = await footRes.text();

        // 1. Highlight the active page link
        highlightActiveLink();

        // 2. Apply language
        const savedLang = localStorage.getItem('church_lang') || 'ar';
        await applyLanguage(savedLang);
    } catch (err) {
        console.error("Error loading layout:", err);
    }
}

function highlightActiveLink() {
    // Get the current URL path
    const currentPath = window.location.pathname;

    // Find all links in the navbar
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');

        // Reset state first
        link.classList.remove('active');

        // Logic for Home Page (Exact match for / or /index.html)
        if (linkPath === '/') {
            if (currentPath === '/' || currentPath.endsWith('index.html') && !currentPath.includes('/about') && !currentPath.includes('/contact')) {
                link.classList.add('active');
            }
        }
        // Logic for other pages (Check if the URL contains the link path)
        else if (currentPath.includes(linkPath)) {
            link.classList.add('active');
        }
    });
}

async function applyLanguage(lang) {
    const isAr = lang === 'ar';

    // 1. Update HTML attributes for layout
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    // 2. Update Bootstrap CSS
    const bootstrapLink = document.getElementById('bootstrap-css');
    bootstrapLink.href = isAr
        ? "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css"
        : "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";

    // 3. Fetch the dictionary and translate
    try {
        const response = await fetch(`/assets/lang/${lang}.json`);
        const dictionary = await response.json();

        // Translate every element with a [data-i18n] attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (dictionary[key]) {
                element.innerText = dictionary[key];
            }
        });
    } catch (err) {
        console.error("Could not load dictionary:", err);
    }
}

function toggleLanguage() {
    const currentLang = localStorage.getItem('church_lang') || 'ar';
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('church_lang', newLang);
    applyLanguage(newLang);
}