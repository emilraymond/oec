// Add this helper at the top of main.js to determine the base path
const getBasePath = () => {
    // If hosted on GitHub Pages, this handles the /project-name/ part
    const path = window.location.pathname;
    if (path.includes('/oec')) {
        return '/oec';
    }
    return '';
};

document.addEventListener('DOMContentLoaded', () => {
    // Initial load of the navbar and footer
    loadLayout();
});

async function loadLayout() {
    const base = getBasePath();
    try {
        const [navRes, footRes] = await Promise.all([
            fetch(`${base}/assets/navbar.html`),
            fetch(`${base}/assets/footer.html`)
        ]);

        document.getElementById('navbar-placeholder').innerHTML = await navRes.text();
        document.getElementById('footer-placeholder').innerHTML = await footRes.text();

        // --- FIXED: Fix links in both Navbar and Footer ---
        if (base !== '') {
            const images = document.querySelectorAll('#navbar-placeholder img, #footer-placeholder img');
            images.forEach(img => {
                const src = img.getAttribute('src');
                // If src starts with / and doesn't have the base (e.g., /oec) yet, add it
                if (src && src.startsWith('/') && !src.startsWith(base)) {
                    img.setAttribute('src', base + src);
                }
            });

            // Target all links inside our dynamic placeholders
            const links = document.querySelectorAll('#navbar-placeholder a, #footer-placeholder a');
            links.forEach(link => {
                const href = link.getAttribute('href');
                // If it's an internal link starting with / and doesn't have the base yet
                if (href && href.startsWith('/') && !href.startsWith(base)) {
                    link.setAttribute('href', base + href);
                }
            });
        }

        // 1. Highlight the active page link
        highlightActiveLink();

        // 2. Apply language
        const savedLang = localStorage.getItem('church_lang') || 'ar';
        await applyLanguage(savedLang);
    } catch (err) {
        console.error("Error loading layout:", err);
    }
}

async function applyLanguage(lang) {
    const base = getBasePath();
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
        const response = await fetch(`${base}/assets/lang/${lang}.json`);
        const dictionary = await response.json();

        // Translate every element with a [data-i18n] attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (dictionary[key]) {
                element.innerText = dictionary[key];
            }
        });
    } catch (err) { console.error(err); }
}

function toggleLanguage() {
    const currentLang = localStorage.getItem('church_lang') || 'ar';
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('church_lang', newLang);
    applyLanguage(newLang);
}

function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const base = getBasePath(); // Ensure this matches your repo name (e.g., '/oec')
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');

        // Normalize paths for comparison
        // This removes the base and trailing slashes so we compare clean names
        const cleanPath = currentPath.replace(base, '').replace(/\/$/, '') || '/';
        const cleanHref = href.replace(base, '').replace(/\/$/, '') || '/';

        if (cleanPath === cleanHref || (cleanPath === '/index.html' && cleanHref === '/')) {
            link.classList.add('active');
        }
    });
}