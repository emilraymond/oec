/* ================= General ================= */

const getBasePath = () => {
    const path = window.location.pathname;
    if (path.includes('/oec')) {
        return '/oec';
    }
    return '';
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadLayout();
    if (document.getElementById('meetings-wrapper')) {
        await loadMeetings();
    }
    if (document.getElementById('news-wrapper')) {
        await loadContactData();
        await loadNews();
    }
    if (document.getElementById('contact-info-wrapper')) {
        await loadContactData();
    }
});

// document.addEventListener('mouseout', function (event) {
//     alert(event);
// });

// document.addEventListener('click', function (event) {
//     const navbarToggler = document.querySelector('.navbar-toggler');
//     const navbarCollapse = document.querySelector('.navbar-collapse');

//     // Check if the navbar is currently open and the click is outside the navbar and toggler
//     const isNavbarOpen = navbarCollapse.classList.contains('show');
//     const isClickInsideNavbar = navbarCollapse.contains(event.target);
//     const isClickOnToggler = navbarToggler.contains(event.target);

//     if (isNavbarOpen && !isClickInsideNavbar && !isClickOnToggler) {
//         // Hide the navbar using Bootstrap's native JS method
//         const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
//             toggle: false
//         });
//         bsCollapse.hide();
//     }
// });

/* ================= Language ================= */

async function applyLanguage(lang) {
    const base = getBasePath();
    const isAr = lang === 'ar';

    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    const bootstrapLink = document.getElementById('bootstrap-css');
    bootstrapLink.href = isAr
        ? "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css"
        : "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";

    try {
        const response = await fetch(`${base}/assets/lang/${lang}.json`);
        const dictionary = await response.json();

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (dictionary[key]) {
                element.innerText = dictionary[key];
            }
        });
    } catch (err) { console.error(err); }
}

async function toggleLanguage() {
    const currentLang = localStorage.getItem('church_lang') || 'ar';
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('church_lang', newLang);
    await applyLanguage(newLang);
    if (document.getElementById('meetings-wrapper')) {
        await loadMeetings();
    }
    if (document.getElementById('news-wrapper')) {
        await loadNews();
    }
    if (document.getElementById('contact-info-wrapper')) {
        await loadContactData();
    }
}

/* ================= Layout/Navbar/Footer ================= */

async function loadLayout() {
    const base = getBasePath();
    try {
        const [navRes, footRes] = await Promise.all([
            fetch(`${base}/assets/navbar.html`),
            fetch(`${base}/assets/footer.html`)
        ]);

        document.getElementById('navbar-placeholder').innerHTML = await navRes.text();
        document.getElementById('footer-placeholder').innerHTML = await footRes.text();

        if (base !== '') {
            const images = document.querySelectorAll('#navbar-placeholder img, #footer-placeholder img');
            images.forEach(img => {
                const src = img.getAttribute('src');
                if (src && src.startsWith('/') && !src.startsWith(base)) {
                    img.setAttribute('src', base + src);
                }
            });

            const links = document.querySelectorAll('#navbar-placeholder a, #footer-placeholder a');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('/') && !href.startsWith(base)) {
                    link.setAttribute('href', base + href);
                }
            });
        }

        highlightActiveLink();

        const savedLang = localStorage.getItem('church_lang') || 'ar';
        await applyLanguage(savedLang);
    } catch (err) {
        console.error("Error loading layout:", err);
    }
}

function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const base = getBasePath();
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');

        const cleanPath = currentPath.replace(base, '').replace(/\/$/, '') || '/';
        const cleanHref = href.replace(base, '').replace(/\/$/, '') || '/';

        if (cleanPath === cleanHref || (cleanPath === '/index.html' && cleanHref === '/')) {
            link.classList.add('active');
        }
    });
}

/* ================= Contact ================= */

async function loadContactData() {
    const contactContainer = document.getElementById('contact-info-wrapper');
    const newsContainer = document.getElementById('news-wrapper');
    if (!newsContainer && !contactContainer) return; // Only runs on the contact page

    const base = getBasePath();
    try {
        const response = await fetch(`${base}/assets/data/contact.json`);
        const data = await response.json();
        const currentLang = localStorage.getItem('church_lang') || 'ar';

        // Populate Text Fields
        const infoPhone = document.getElementById('info-phone');
        if (infoPhone) {
            infoPhone.innerText = data.number_phone;
            infoPhone.href = `tel:${data.number_phone}`;
        }
        const infoWhatsApp = document.getElementById('info-whatsapp');
        if (infoWhatsApp) {
            infoWhatsApp.innerText = data.number_whatsapp; // Displayed number
            infoWhatsApp.href = `https://wa.me/${data.number_whatsapp}`; // Displayed number
        }
        const infoEmail = document.getElementById('info-email');
        if (infoEmail) {
            infoEmail.innerText = data.address_email;
            infoEmail.href = `mailto:${data.address_email}`;
        }
        const infoAddress = document.getElementById('info-address');
        if (infoPhone) {
            infoAddress.innerText = (currentLang === 'ar') ? data.address_location_ar : data.address_location_en
            infoAddress.href = data.address_URL
        }

        // Populate Social Links
        const linkFB = document.getElementById('link-fb');
        if (linkFB) { linkFB.href = data.link_facebook; }
        const linkYT = document.getElementById('link-yt');
        if (linkYT) { linkYT.href = data.link_youtube; }
        const linkIG = document.getElementById('link-ig');
        if (linkIG) { linkIG.href = data.link_instagram; }

        // Populate Google Maps (using coordinates from JSON)
        const mapIframe = document.getElementById('info-map');
        if (mapIframe && data.address_coordinates) {
            // Standard Google Maps Embed URL using coordinates
            mapIframe.src = `https://maps.google.com/maps?q=${data.address_coordinates}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        }

    } catch (err) {
        console.error("Error loading contact data:", err);
    }
}

/* ================= Meetings ================= */

async function loadMeetings() {
    const grid = document.getElementById('meetings-grid');
    if (!grid) return;

    const base = getBasePath();
    const lang = localStorage.getItem('church_lang') || 'ar';

    try {
        const res = await fetch(`${base}/assets/data/meetings.json`);
        const meetings = await res.json();

        grid.innerHTML = meetings.map(service => `
            <div class="col">
                <!-- <a href="service-details.html?id=${service.id}" class="text-decoration-none"> -->
                <!-- <a class="text-decoration-none" onclick="alert('${lang === 'ar' ? service.title_ar : service.title_en}');"> -->
                    <div class="card h-100 border-0 shadow-sm theme-card">
                        <!-- <img src="${service.image}" class="card-img-top" alt="${service.id}" 
                             style="height: 200px; object-fit: cover;"> -->
                        <img src="https://placehold.co/1920x1080/212529/ffffff?text=${service.id}+Image+Placeholder" class="card-img-top" alt="${service.id}" 
                             style="height: 200px; object-fit: cover;">
                        <div class="card-body text-center">
                            <h4 class="card-title fw-bold text-dark">
                                ${lang === 'ar' ? service.title_ar : service.title_en}
                            </h4>
                            <h6 class="card-title fw-bold text-dark">
                                ${lang === 'ar' ? service.time_ar : service.time_en}
                            </h6>
                            <p class="card-text text-muted small">
                                ${lang === 'ar' ? service.brief_ar : service.brief_en}
                            </p>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');
    } catch (err) {
        console.error("Failed to load meetings:", err);
    }
}

/* ================= News ================= */

async function loadNews() {
    const grid = document.getElementById('news-grid');
    if (!grid) return;

    const base = getBasePath();
    const lang = localStorage.getItem('church_lang') || 'ar';

    try {
        const res = await fetch(`${base}/assets/data/news.json`);
        const meetings = await res.json();

        grid.innerHTML = meetings.map(service => `
            <div class="col">
                <!-- <a href="service-details.html?id=${service.id}" class="text-decoration-none"> -->
                <!-- <a class="text-decoration-none" onclick="alert('${lang === 'ar' ? service.title_ar : service.title_en}');"> -->
                    <div class="card h-100 border-0 shadow-sm theme-card">
                        <!-- <img src="${service.image}" class="card-img-top" alt="${service.id}" 
                             style="height: 200px; object-fit: cover;"> -->
                        <!-- <img src="https://placehold.co/1920x1080/212529/ffffff?text=${service.id}+Image+Placeholder" class="card-img-top" alt="${service.id}" 
                             style="height: 200px; object-fit: cover;"> -->
                        <div class="card-body text-center">
                            <h4 class="card-title fw-bold text-dark">
                                ${lang === 'ar' ? service.title_ar : service.title_en}
                            </h4>
                            <p class="card-text text-muted small">
                                ${lang === 'ar' ? service.brief_ar : service.brief_en}
                            </p>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');
    } catch (err) {
        console.error("Failed to load meetings:", err);
    }
}

/* ================= Tasbe7na ================= */

function goTo_tasbe7na() {
    const lang = localStorage.getItem('church_lang') || 'ar';
    const ask = lang === 'ar' ? "انتقل الى تسبيحنا؟" : "Go to Tasbe7na?";

    if (confirm(ask)) {
        window.location.href = "https://tasbe7na.com/web/";
    } else {

    }
}