/**
 * Activamente - Sanctuary Luxury Engine
 */

let __parallaxScrollBound = false;

// ====== VERCEL API HELPER ======
// Wraps fetch with JWT auth and base URL routing
async function apiFetch(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = localStorage.getItem('activamente_token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    // Auto-set Content-Type for JSON POST/PUT bodies
    if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, { ...options, headers });
    return res;
}

// ====== HTML ESCAPE ======
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const UI = {
    async renderHome() {
        document.getElementById('app-root').innerHTML = `
            <div class="page-home">
            <header class="hero-sanctuary">
                <div class="hero-bg hero-bg-anim"></div>
                <div class="hero-bg" style="background: radial-gradient(circle at center, transparent, rgba(2,31,30,0.6)); z-index: 3;"></div>
                <div class="hero-overlay"></div>
                <div class="container hero-content">
                    <div class="reveal-stagger">
                        <span class="tag-luxe">ACTIVAMENTE</span>
                        <h1 class="reveal-heavy hero-headline-index">Camina hacia una vida con <span>significado.</span></h1>
                        <p class="reveal-soft hero-subhead-index">Un espacio de excelencia clínica y calidez humana. Expertos comprometidos con tu bienestar mental. Tu equilibrio comienza hoy en <strong style="font-weight:600;letter-spacing:0.05em;">ACTIVAMENTE</strong>.</p>

                        <p class="hero-topic-hint reveal-up">Selecciona tu área de interés o síntoma:</p>
                        <div class="hero-topic-picker reveal-up">
                            <div class="hero-select-wrapper">
                                <div class="hero-select-display" id="s-topic-display">Elige un tema (ansiedad, estrés, relaciones…)</div>
                                <svg class="hero-select-arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8"><path fill="#c29a5b" d="M1 1l5 5 5-5" stroke="#c29a5b" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
                                <select id="s-topic" class="hero-topic-select" aria-label="Tema o síntoma" onchange="document.getElementById('s-topic-display').textContent = this.options[this.selectedIndex].text">
                                    <option value="">Elige un tema (ansiedad, estrés, relaciones…)</option>
                                    <option value="ansiedad">Ansiedad</option>
                                    <option value="estrés">Estrés</option>
                                    <option value="relaciones">Relaciones de pareja</option>
                                    <option value="familia">Familia</option>
                                    <option value="depresión">Depresión / ánimo bajo</option>
                                    <option value="duelo">Duelo y pérdidas</option>
                                    <option value="autoestima">Autoestima e identidad</option>
                                    <option value="trabajo">Trabajo y desempeño</option>
                                    <option value="TOC">TOC / pensamientos recurrentes</option>
                                    <option value="alimentación">Alimentación y cuerpo</option>
                                    <option value="adolescentes">Adolescentes</option>
                                    <option value="sexualidad">Sexualidad</option>
                                    <option value="trauma">Trauma</option>
                                </select>
                            </div>
                            <button type="button" class="hero-cta-specialist" onclick="Router.handleSearch()">Encuentra tu especialista</button>
                        </div>
                    </div>
                </div>
                <div class="hero-scroll-indicator">
                    <div class="mouse"></div>
                    <span>DESCUBRIR</span>
                </div>
            </header>

            <section class="stats-sanctuary home-stats">
                <div class="container home-stats-grid">
                    <div class="stat-item reveal">
                        <h4 class="counter-num" data-target="2500">0</h4>
                        <p>Pacientes acompañados</p>
                    </div>
                    <div class="stat-item reveal">
                        <h4 class="counter-num" data-target="120">0</h4>
                        <p>Psicoterapeutas</p>
                    </div>
                    <div class="stat-item reveal">
                        <h4 class="counter-num" data-target="100">0</h4>
                        <p>Profesionalismo total</p>
                    </div>
                </div>
            </section>

            <section class="news-ticker-sanctuary home-news">
                <div class="container">
                    <span class="tag home-section-tag">LO ÚLTIMO DE ACTIVAMENTE</span>
                    <div id="global-news-feed" class="home-news-grid">
                         <!-- Dynamically loaded news -->
                    </div>
                </div>
            </section>

            <section class="testimonials-site-section home-testimonials">
                <div class="container reveal">
                    <span class="tag home-section-tag" style="display:block;text-align:center;">VOZ DE LA COMUNIDAD</span>
                    <h2 class="home-testimonials-title">Testimonios que <span>Inspiran</span></h2>
                    <div id="site-testimonials-feed" class="site-testimonials-container">
                        <!-- Dynamically loaded site testimonials slideshow -->
                    </div>
                </div>
            </section>
            
            <section class="container home-split home-camino">
                <div class="home-split-inner">
                    <div class="reveal">
                        <span class="tag" style="color: var(--accent); letter-spacing: 3px; font-weight: 700;">EL CAMINO HACIA EL CAMBIO</span>
                        <h2 class="home-camino-title">Tu terapia, <span class="home-camino-accent">tu espacio seguro</span>.</h2>
                        <p class="home-camino-text">Más que un equipo de profesionales, en Activamente somos personas comprometidas con tu bienestar bajo los más altos estándares. Entendemos que buscas algo más que una consulta: buscas un espacio cálido para transformar tu camino en una terapia con propósito.</p>
                    </div>
                    <div class="reveal home-camino-visual">
                        <img src="assets/connection.png" alt="Conexión terapéutica" class="home-camino-img">
                    </div>
                </div>
            </section>
            
            <section class="sanctuary-title-block home-specialists-intro">
                <div class="container reveal">
                    <h2 class="reveal home-specialists-h2">Conoce a <span>tu especialista</span></h2>
                </div>
            </section>
            
            <section id="filter-bar" class="filter-bar-section">
                <div class="container">
                    <div class="filter-bar-inner">
                        <div class="filter-group">
                            <label class="filter-label">🔍 Especialidad</label>
                            <input type="text" id="f-specialty" class="filter-input" placeholder="ansiedad, pareja, estrés...">
                        </div>
                        <div class="filter-divider"></div>
                        <div class="filter-group filter-group--sm">
                            <label class="filter-label">🌐 Modalidad</label>
                            <select id="f-modality" class="filter-select">
                                <option value="">Todas</option>
                                <option value="online">Online</option>
                                <option value="presencial">Presencial</option>
                            </select>
                        </div>
                        <div class="filter-divider"></div>
                        <div class="filter-group filter-group--sm">
                            <label class="filter-label">💰 Precio máx: $<span id="f-price-display">5000</span> MXN</label>
                            <input type="range" id="f-price" class="filter-range" min="100" max="5000" value="5000" step="100" oninput="document.getElementById('f-price-display').textContent=this.value">
                        </div>
                        <div class="filter-actions">
                            <button class="filter-btn-search" onclick="UI.applyFilters()">Buscar</button>
                            <button class="filter-btn-clear" onclick="UI.clearFilters()">Limpiar</button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="results-list" class="specialist-list">
                <!-- Immersive Blocks Rendered Here -->
            </section>
            
            <section class="home-cta-pro">
                <div class="container reveal home-cta-pro-inner">
                    <h2 class="home-cta-pro-title">¿Te gustaría formar parte del <span>equipo</span>?</h2>
                    <p class="home-cta-pro-text">En Activamente reunimos profesionales que comparten el mismo propósito: acompañar el bienestar mental con rigor, ética y cercanía. Si es tu caso, aquí tienes tu espacio.</p>
                    <button class="btn-gold home-cta-pro-btn" onclick="Router.navigateTo('register')">Unirme al equipo</button>
                </div>
            </section>
            </div>`;

        this.initObserver();
        this.fetchAndRenderList();
        this.fetchAndRenderNews();
    },

    async fetchAndRenderNews() {
        const res = await apiFetch('/api/data?action=get_news');
        let news;
        try {
            news = await res.json();
        } catch {
            news = [];
        }
        const feed = document.getElementById('global-news-feed');
        if (!feed) return;

        if (!Array.isArray(news)) {
            feed.innerHTML = `<p style="opacity: 0.4; text-align: center; grid-column: 1/-1;">${escapeHtml(news.error || 'No se pudieron cargar las noticias.')}</p>`;
            this.fetchAndRenderSiteTestimonials();
            return;
        }

        feed.innerHTML = news.slice(0, 3).map(n => `
            <div class="reveal news-card">
                <div class="img-wrapper">
                    <img src="${n.image_url || 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=600'}">
                </div>
                <span class="tag" style="font-size: 0.7rem;">Noticia &middot; ${new Date(n.created_at).toLocaleDateString()}</span>
                <h4>${n.title}</h4>
                <p style="opacity: 0.6; font-size: 1rem; line-height: 1.8; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${n.content}</p>
                <div style="margin-top: auto; padding-top: 2rem;">
                    <button class="btn-gold" style="padding: 1rem 2rem; font-size: 0.7rem;" onclick="Router.navigateTo('home')">Leer Comunicado</button>
                </div>
            </div>
        `).join('') || '<p style="opacity: 0.3; text-align: center; grid-column: 1/-1;">Pronto habrá novedades por aquí.</p>';

        this.fetchAndRenderSiteTestimonials();
    },

    async fetchAndRenderSiteTestimonials() {
        const res = await apiFetch('/api/data?action=get_site_testimonials');
        let testimonials;
        try {
            testimonials = await res.json();
        } catch {
            testimonials = [];
        }
        const feed = document.getElementById('site-testimonials-feed');
        if (!feed) return;

        if (!Array.isArray(testimonials)) {
            feed.innerHTML = `<p style="opacity: 0.4; text-align: center; max-width: 32rem; margin: 0 auto; line-height: 1.6;">${escapeHtml(testimonials.error || 'No se pudieron cargar los testimonios.')}</p>`;
            return;
        }

        if (!testimonials.length) {
            feed.innerHTML = '<p style="opacity: 0.3; text-align: center;">Tu voz importa en Activamente. Déjanos tu testimonio.</p>';
            return;
        }

        feed.innerHTML = testimonials.map((t, i) => {
            const stars = Math.min(5, Math.max(0, parseInt(t.stars, 10) || 0));
            return `
            <div class="testimonial-slide ${i === 0 ? 'active' : ''}">
                <div class="testimonial-bubble">
                    <div class="star-rating">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</div>
                    <p style="font-style: italic; font-size: 1.5rem; margin-bottom: 3.5rem; color: var(--text-dark); line-height: 2;">"${t.content}"</p>
                    <div style="display: flex; align-items: center; gap: 2rem; justify-content: center;">
                        <div style="width: 50px; height: 1px; background: var(--accent);"></div>
                        <b style="font-size: 1rem; text-transform: uppercase; letter-spacing: 4px; color: var(--accent);">${t.name}</b>
                        <div style="width: 50px; height: 1px; background: var(--accent);"></div>
                    </div>
                </div>
            </div>
        `;
        }).join('');

        this.initObserver();
        this.startSiteSlideshow();
    },

    startSiteSlideshow() {
        const slides = document.querySelectorAll('.testimonial-slide');
        if (slides.length <= 1) return;

        let current = 0;
        setInterval(() => {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
        }, 7000);
    },

    initObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    if (entry.target.querySelector('.counter-num')) {
                        this.animateCounter(entry.target.querySelector('.counter-num'));
                    }
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal, .stat-item').forEach(el => observer.observe(el));

        // Immediate reveal force
        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => {
                el.classList.add('active');
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }, 500);
    },

    animateCounter(el) {
        if (el.classList.contains('counted')) return;
        el.classList.add('counted');
        const target = +el.getAttribute('data-target');
        let count = 0;
        const inc = target / 50;
        const update = () => {
            if (count < target) {
                count += inc;
                el.innerText = Math.ceil(count);
                setTimeout(update, 20);
            } else {
                el.innerText = target;
            }
        };
        update();
    },

    async fetchAndRenderList(query = '', specialty = '', modality = '', priceMax = '') {
        let url = `/api/data?action=get_psychologists&search=${encodeURIComponent(query)}`;
        if (specialty) url += `&specialty=${encodeURIComponent(specialty)}`;
        if (modality)  url += `&modality=${encodeURIComponent(modality)}`;
        const priceNum = Number(priceMax);
        if (priceMax !== '' && priceMax != null && !Number.isNaN(priceNum) && priceNum < 5000) {
            url += `&price_max=${encodeURIComponent(priceNum)}`;
        }
        const res = await fetch(url);
        let psychologists;
        try {
            psychologists = await res.json();
        } catch {
            psychologists = [];
        }
        const list = document.getElementById('results-list');
        if (!list) return;

        if (!Array.isArray(psychologists) || !psychologists.length) {
            const errMsg = Array.isArray(psychologists) ? '' : (psychologists && psychologists.error) ? psychologists.error : '';
            list.innerHTML = `<h3 style='text-align:center; opacity: 0.3; padding: 10rem; max-width: 36rem; margin: 0 auto; line-height: 1.5; font-weight: 400;'>${errMsg ? escapeHtml(errMsg) : 'Aún no hay resultados para esta búsqueda.'}</h3>`;
            return;
        }

        list.innerHTML = psychologists.map((p, i) => {
            const nameArr = (p.name || 'Especialista').split(' ');
            const firstName = nameArr[0];
            const lastName = nameArr.slice(1).join(' ');
            const uid = p.user_id ? p.user_id.toString().padStart(3, '0') : '000';

            return `
            <div class="masterpiece-block reveal">
                <div class="masterpiece-img-box">
                    <img src="${p.image || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1200'}"
                         class="parallax-img" alt="${p.name || 'Mentor'}">
                </div>
                <div class="masterpiece-info">
                    <span class="tag">Mentor Activamente &middot; ${uid}</span>
                    <h2>${firstName} <span>${lastName}</span></h2>
                    <div class="specialty">${p.specialty || 'Psicología'}</div>
                    <p class="bio">${p.bio ? (() => { const b = p.bio; if (b.length <= 120) return b; const cut = b.substring(0, 120); const dot = cut.lastIndexOf('.'); return dot > 40 ? b.substring(0, dot + 1) : cut.substring(0, cut.lastIndexOf(' ')) + '...'; })() : 'Dedicado a la excelencia en el proceso de transformación mental.'}</p>

                    <div class="masterpiece-footer">
                        <div class="masterpiece-price">$${p.price || '--'} <span>/ sesión</span></div>
                        <button class="btn-gold" style="padding: clamp(1rem, 1.5vw, 1.5rem) clamp(2rem, 4vw, 4rem); font-size: clamp(0.85rem, 1.2vw, 1.2rem);" onclick="Router.navigateTo('profile', ${p.user_id || 0})">Ver Perfil Maestro</button>
                    </div>
                </div>
            </div>`;
        }).join('');

        this.initObserver();
        this.initParallax();
    },

    initParallax() {
        if (__parallaxScrollBound) return;
        __parallaxScrollBound = true;
        window.addEventListener('scroll', () => {
            document.querySelectorAll('.parallax-img').forEach(img => {
                const speed = 0.2;
                const rect = img.parentElement.getBoundingClientRect();
                const offset = window.innerHeight - rect.top;
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    img.style.transform = `translateY(${offset * speed}px)`;
                }
            });
        });
    },

    async renderProfile(id) {
        const res = await apiFetch(`/api/data?action=get_psychologists`);
        let all;
        try {
            all = await res.json();
        } catch {
            all = [];
        }
        if (!Array.isArray(all)) return this.renderHome();
        const p = all.find(x => x.user_id == id);
        if (!p) return this.renderHome();

        // Fetch Blog and Testimonials
        const [blogRes, testRes] = await Promise.all([
            apiFetch(`/api/data?action=get_blog&user_id=${id}`),
            apiFetch(`/api/data?action=get_testimonials&user_id=${id}`)
        ]);
        let blogRaw, testimonialsRaw;
        try {
            blogRaw = await blogRes.json();
        } catch {
            blogRaw = [];
        }
        try {
            testimonialsRaw = await testRes.json();
        } catch {
            testimonialsRaw = [];
        }
        const blog = Array.isArray(blogRaw) ? blogRaw : [];
        const testimonials = Array.isArray(testimonialsRaw) ? testimonialsRaw : [];

        document.getElementById('app-root').innerHTML = `
            <div class="profile-lux-header">
                <div class="container reveal">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr)); gap: clamp(2rem, 5vw, 8rem); align-items: center;">
                        <div style="height: clamp(250px, 50vw, 600px); border-radius: clamp(20px, 5vw, 50px); overflow: hidden; box-shadow: var(--shadow-luxe);">
                            <img src="${p.image || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600'}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div>
                             <span class="tag" style="color: var(--accent); letter-spacing: 4px; font-weight: 700; font-size: clamp(0.6rem, 1.5vw, 0.8rem);">MAESTRÍA CLÍNICA</span>
                             <h1>${p.name}</h1>
                             <div style="font-size: clamp(1.4rem, 3vw, 2rem); opacity: 0.8; font-style: italic; margin-bottom: clamp(1rem, 2vw, 2rem);">${p.specialty}</div>
                             
                             ${p.audio_url ? `
                             <div class="audio-sanctuary reveal-up" style="margin-bottom: clamp(1.5rem, 3vw, 3rem);">
                                 <button class="audio-btn" onclick="UI.toggleAudio('${p.audio_url}')">▶</button>
                                 <div class="waveform">
                                     ${Array(15).fill(0).map(() => `<div class="wave-bar" style="animation-delay: ${Math.random() * 2}s"></div>`).join('')}
                                 </div>
                                 <small style="letter-spacing: 2px; opacity: 0.6;">VOZ DEL SANTUARIO</small>
                             </div>` : ''}

                             <div style="display: flex; gap: clamp(1.5rem, 4vw, 6rem); flex-wrap: wrap;">
                                 <div><b style="font-size: clamp(1.8rem, 4vw, 2.5rem); color: var(--accent);">★ ${p.rating}</b><br><small style="text-transform: uppercase; letter-spacing: 2px; opacity: 0.6;">Excelencia</small></div>
                                 <div><b style="font-size: clamp(1.8rem, 4vw, 2.5rem);">${p.reviews_count}</b><br><small style="text-transform: uppercase; letter-spacing: 2px; opacity: 0.6;">Testimonios</small></div>
                                 <div><b style="font-size: clamp(1.8rem, 4vw, 2.5rem);">$${p.price}</b><br><small style="text-transform: uppercase; letter-spacing: 2px; opacity: 0.6;">Inversión</small></div>
                             </div>
                             <div style="margin-top: clamp(3rem, 5vw, 5rem); display: flex; gap: clamp(1rem, 2vw, 2rem); flex-wrap: wrap;">
                                 <a href="https://wa.me/${p.whatsapp_number || ''}?text=Hola%20${encodeURIComponent(p.name)},%20vengo%20de%20Activamente..." target="_blank" class="btn-gold" style="background: #25D366; text-decoration: none; display: flex; align-items: center; gap: 1rem; flex: 1 1 auto; min-width: 200px; justify-content: center;">
                                     <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.148-1.758-.868-2.031-.967-.272-.099-.47-.148-.668.148-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.148-.174.198-.297.297-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                     WhatsApp
                                 </a>
                                 <button class="btn-gold" style="background: rgba(194,154,91,0.1); color: var(--accent); border: 1px solid var(--accent);" onclick="UI.renderZenSpace('${p.profile_vibe || 'zen'}')">𐓷 Digital Zen Space</button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="container" style="padding: clamp(3rem, 8vw, 15rem) 0; display: grid; grid-template-columns: 1.5fr 1fr; gap: clamp(3rem, 5vw, 12rem);">
                <div class="reveal">
                    <h2 style="font-size: clamp(2.2rem, 5vw, 4rem); margin-bottom: clamp(2rem, 4vw, 4rem);">Sobre el Mentor</h2>
                    <p style="font-size: clamp(1rem, 2vw, 1.5rem); color: var(--text-muted); line-height: 2.4; margin-bottom: clamp(3rem, 5vw, 6rem); font-weight: 300;">${p.bio}</p>
                    
                    <div style="background: white; padding: clamp(2rem, 5vw, 6rem); border-radius: clamp(30px, 5vw, 60px); border: 1px solid var(--border); box-shadow: var(--shadow-luxe); margin-bottom: clamp(4rem, 6vw, 8rem);">
                        <div style="margin-bottom: clamp(2.5rem, 4vw, 5rem); border-left: 5px solid var(--accent); padding-left: clamp(1.5rem, 3vw, 4rem);">
                            <h4 style="font-size: clamp(1.2rem, 2.5vw, 1.8rem); margin-bottom: 0.8rem;">Formación Académica</h4>
                            <p style="font-size: clamp(0.95rem, 1.5vw, 1.25rem); color: var(--text-muted);">${p.education}</p>
                        </div>
                        <div style="border-left: 5px solid var(--primary); padding-left: clamp(1.5rem, 3vw, 4rem);">
                            <h4 style="font-size: clamp(1.2rem, 2.5vw, 1.8rem); margin-bottom: 0.8rem;">Filosofía Terapéutica</h4>
                            <p style="font-size: clamp(0.95rem, 1.5vw, 1.25rem); color: var(--text-muted);">${p.approach}</p>
                        </div>
                    </div>

                    <h2 style="font-size: clamp(2rem, 4vw, 3rem); margin-bottom: clamp(2rem, 4vw, 4rem);">Mapa de Crecimiento</h2>
                    <div id="journey-visual" class="reveal">
                         <!-- Dynamically loaded journey -->
                    </div>

                    <h2 style="font-size: clamp(2rem, 4vw, 3rem); margin-bottom: clamp(2rem, 4vw, 4rem);">Bitácora de Sabiduría</h2>
                    <div class="blog-grid" style="display: grid; grid-template-columns: 1fr; gap: clamp(2rem, 4vw, 4rem); margin-bottom: clamp(4rem, 6vw, 8rem);">
                        ${blog.length ? blog.map(b => `
                            <div class="blog-card reveal" style="background: white; border-radius: clamp(20px, 4vw, 40px); overflow: hidden; border: 1px solid #eee; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
                                ${b.type === 'video' ? `<iframe width="100%" height="400" src="${String(b.media_url || '').replace('watch?v=', 'embed/')}" frameborder="0" allowfullscreen style="height: clamp(200px, 40vw, 400px);"></iframe>` : ''}
                                <div style="padding: clamp(1.5rem, 3vw, 4rem);">
                                    <span class="tag" style="font-size: 0.7rem;">${b.type.toUpperCase()}</span>
                                    <h3 style="font-size: clamp(1.5rem, 3vw, 2.5rem); margin-bottom: clamp(1rem, 2vw, 2rem);">${b.title}</h3>
                                    <p style="font-size: clamp(0.95rem, 1.5vw, 1.2rem); color: var(--text-muted); line-height: 2;">${b.content}</p>
                                </div>
                            </div>
                        `).join('') : '<p style="opacity: 0.5;">Aún no hay publicaciones en la bitácora.</p>'}
                    </div>

                    <h2 style="font-size: clamp(2rem, 4vw, 3rem); margin-bottom: clamp(2rem, 4vw, 4rem);">Testimonios</h2>
                    <div class="testimonials">
                        ${testimonials.map(t => {
                            const ts = Math.min(5, Math.max(0, parseInt(t.stars, 10) || 0));
                            return `
                            <div class="testimonial-bubble reveal" style="background:#fdfbf7;padding:clamp(1.5rem,3vw,4rem);border-radius:clamp(20px,4vw,40px);border:1px solid rgba(194,154,91,0.2);margin-bottom:clamp(1.5rem,3vw,3rem);">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:clamp(1rem,2vw,2rem);">
                                    <div style="color:var(--accent);font-size:clamp(1rem,2vw,1.5rem);">${'★'.repeat(ts)}${'☆'.repeat(5 - ts)}</div>
                                    ${t.is_verified=='1'||t.is_verified===1?`<span style="background:rgba(40,167,69,0.1);color:#28a745;padding:0.4rem 1.2rem;border-radius:20px;font-size:0.65rem;font-weight:700;letter-spacing:1px;">✓ VERIFICADO</span>`:''}
                                </div>
                                <p style="font-style:italic;font-size:clamp(0.95rem,1.5vw,1.3rem);margin-bottom:clamp(1rem,2vw,2rem);">"${t.content}"</p>
                                <b style="font-size:clamp(0.75rem,1vw,0.9rem);text-transform:uppercase;letter-spacing:2px;">— ${t.patient_name}</b>
                            </div>
                        `;
                        }).join('')}
                    </div>
                </div>
                <div>
                    <div class="reveal" style="background: white; padding: clamp(2rem, 4vw, 6rem); border-radius: clamp(30px, 5vw, 60px); position: sticky; top: 12rem; border: 1px solid var(--accent); box-shadow: var(--shadow-luxe);">
                        <h3 style="margin-bottom: clamp(1rem, 2vw, 2rem); font-size: clamp(1.8rem, 3.5vw, 2.5rem);">Cita Privada</h3>
                        <p style="color: var(--text-muted); margin-bottom: clamp(2rem, 4vw, 4rem); font-size: clamp(0.95rem, 1.5vw, 1.2rem);">Llena tus datos para que el especialista te contacte.</p>
                        
                            <div id="booking-form">
                            <input type="text" id="b-name" class="dashboard-input" style="font-size: 1.1rem; padding: 1.5rem 0;" placeholder="Nombre Completo">
                            <input type="email" id="b-email" class="dashboard-input" style="font-size: 1.1rem; padding: 1.5rem 0;" placeholder="Correo Electrónico">
                            <input type="text" id="b-phone" class="dashboard-input" style="font-size: 1.1rem; padding: 1.5rem 0;" placeholder="WhatsApp / Teléfono">
                            <select id="b-modality" class="dashboard-input" style="font-size:1rem;margin-top:1rem;">
                                <option value="online">Consulta Online</option>
                                <option value="presencial">Presencial</option>
                            </select>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: clamp(1rem, 2vw, 2rem); margin-top: clamp(1rem, 2vw, 2rem);">
                                <input type="date" id="b-date" class="dashboard-input" style="font-size: clamp(0.85rem, 1.2vw, 1rem);">
                                <input type="time" id="b-time" class="dashboard-input" style="font-size: clamp(0.85rem, 1.2vw, 1rem);">
                            </div>
                            <div style="font-size: clamp(2rem, 4vw, 3rem); font-weight: 300; margin: clamp(2rem, 4vw, 4rem) 0;">$${p.price} <span style="font-size: clamp(0.7rem, 1vw, 1rem); opacity: 0.5;">MXN</span></div>
                            <button class="btn-gold" style="width: 100%; border-radius: 30px; padding: clamp(1.5rem, 2.5vw, 2.2rem); font-size: clamp(1rem, 2vw, 1.4rem);" onclick="Router.handleBooking(${id})">Solicitar Agendamiento</button>
                        </div>
                        
                        <div style="margin-top: clamp(2rem, 4vw, 4rem); padding-top: clamp(2rem, 4vw, 4rem); border-top: 1px solid #f0f0f0;">
                            <h4 style="letter-spacing: 2px; font-size: clamp(0.6rem, 1vw, 0.8rem); margin-bottom: clamp(1rem, 2vw, 2rem);">RECURSOS EXCLUSIVOS</h4>
                            <button class="btn-gold" style="width: 100%; background: #fdfbf7; color: var(--primary); border: 1px solid var(--border);" onclick="UI.renderTests(${id})">Realizar Test de Evaluación</button>
                        </div>
                    </div>
                </div>
            </div>`;
        this.fetchAndRenderJourney(id);
        this.initObserver();
    },

    async fetchAndRenderJourney(uid) {
        const res = await apiFetch(`/api/data?action=get_journey&user_id=${uid}`);
        let steps;
        try {
            steps = await res.json();
        } catch {
            steps = [];
        }
        const container = document.getElementById('journey-visual');
        if (!container) return;

        if (!Array.isArray(steps) || !steps.length) {
            container.innerHTML = '<p style="opacity: 0.3;">El Maestro está trazando el camino del crecimiento...</p>';
            return;
        }

        container.innerHTML = `
            <div class="journey-container">
                ${steps.map(s => `
                    <div class="journey-step reveal">
                        <h4>${s.title}</h4>
                        <p>${s.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
        this.initObserver();
    },

    async renderForum() {
        const res = await apiFetch('/api/data?action=get_forum');
        let posts;
        try {
            posts = await res.json();
        } catch {
            posts = [];
        }
        if (!Array.isArray(posts)) posts = [];

        const postCards = posts.map((p) => {
            const isMaestro = p.author_role === 'psychologist';
            const anon = Number(p.is_anonymous) === 1 || p.is_anonymous === true;
            const rawEmail = String(p.author_email || '').trim();
            const displayName = anon ? 'Participante anónimo' : (rawEmail || 'Miembro');
            const initial = (displayName.charAt(0) || '?').toUpperCase();
            const avatarClass = anon ? 'forum-avatar forum-avatar--anon' : (isMaestro ? 'forum-avatar forum-avatar--pro' : 'forum-avatar forum-avatar--member');
            const roleLabel = anon ? 'Publicación anónima' : (isMaestro ? 'Especialista' : 'Comunidad');
            const safeTitle = escapeHtml(String(p.title || ''));
            const safeBody = escapeHtml(String(p.content || '')).replace(/\r\n|\r|\n/g, '<br>');
            let dateStr = '';
            try {
                dateStr = new Date(p.timestamp).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
            } catch (e) {
                dateStr = '';
            }
            return `
            <article class="reveal forum-post ${isMaestro ? 'forum-post--maestro' : ''}" aria-label="Publicación: ${safeTitle}">
                <header class="forum-post__head">
                    <div class="forum-post__author">
                        <div class="${avatarClass}" aria-hidden="true">${escapeHtml(initial)}</div>
                        <div>
                            <div class="forum-post__name">${escapeHtml(displayName)}</div>
                            <div class="forum-post__role">${escapeHtml(roleLabel)}</div>
                        </div>
                    </div>
                    ${isMaestro ? '<span class="maestro-badge">Especialista</span>' : ''}
                </header>
                <h3 class="forum-post__title">${safeTitle}</h3>
                <div class="forum-post__body">${safeBody}</div>
                <footer class="forum-post__meta">
                    <span class="forum-post__meta-label">Publicado</span>
                    <time datetime="${escapeHtml(String(p.timestamp || ''))}">${escapeHtml(dateStr)}</time>
                </footer>
            </article>`;
        }).join('');

        const emptyForum = !posts.length ? `
            <div class="forum-empty reveal" role="status">
                <p class="forum-empty__title">Aún no hay publicaciones</p>
                <p class="forum-empty__text">Sé quien abre la conversación: comparte una duda o reflexión con respeto. Los especialistas también participan aquí.</p>
            </div>` : '';

        document.getElementById('app-root').innerHTML = `
            <div class="page-forum">
                <section class="forum-hero">
                    <div class="container reveal">
                        <span class="tag-luxe forum-hero__tag">COMUNIDAD</span>
                        <h1 class="forum-hero__title">El Espacio</h1>
                        <p class="forum-hero__lead">Un lugar para compartir con calma: reflexiones, preguntas y aprendizajes, con la compañía de personas y especialistas de Activamente.</p>
                    </div>
                </section>

                <div class="container forum-layout">
                    <aside class="forum-aside reveal">
                        <div class="forum-aside-card">
                            <h2 class="forum-aside-card__title">Antes de publicar</h2>
                            <ul class="forum-aside-list">
                                <li>No compartas datos médicos identificables de terceros.</li>
                                <li>Este espacio no sustituye la terapia ni la emergencia; ante crisis, busca ayuda inmediata en tu localidad.</li>
                                <li>Mantén un tono respetuoso; el equipo puede moderar contenido.</li>
                            </ul>
                        </div>
                        <div class="forum-aside-card forum-aside-card--soft">
                            <p class="forum-aside-note">¿Primera vez? Escribe un título claro y en el cuerpo explica contexto sin prisa: así es más fácil que otros te lean con atención.</p>
                        </div>
                    </aside>

                    <div class="forum-main">
                        <section class="reveal forum-compose" aria-labelledby="forum-compose-title">
                            <h2 id="forum-compose-title" class="forum-compose__title">Nueva publicación</h2>
                            <p class="forum-compose__hint">Título breve y mensaje con el detalle que quieras compartir.</p>
                            <div class="forum-field">
                                <label class="forum-label" for="f-title">Título</label>
                                <input type="text" id="f-title" class="forum-input" placeholder="Ej. Ansiedad antes de exponer en el trabajo" maxlength="255" autocomplete="off">
                            </div>
                            <div class="forum-field">
                                <label class="forum-label" for="f-content">Mensaje</label>
                                <textarea id="f-content" class="forum-textarea" placeholder="Cuéntanos tu reflexión o pregunta…" maxlength="10000" rows="8"></textarea>
                            </div>
                            <div class="forum-anon">
                                <input type="checkbox" id="f-anon" class="forum-checkbox">
                                <label for="f-anon" class="forum-anon-label">Publicar de forma anónima <span class="forum-anon-sub">(no mostraremos tu correo en la tarjeta)</span></label>
                            </div>
                            <button type="button" class="btn-gold forum-submit" onclick="Router.postToForum()">Publicar en El Espacio</button>
                        </section>

                        <section class="forum-feed" aria-label="Publicaciones recientes">
                            <h2 class="forum-feed__heading">Lo que comparte la comunidad</h2>
                            <div id="forum-list" class="forum-list">
                                ${postCards}
                                ${emptyForum}
                            </div>
                        </section>
                    </div>
                </div>
            </div>`;
        this.initObserver();
    },

    async renderDashboard() {
        const [profileRes, apptsRes, blogRes] = await Promise.all([
            apiFetch('/api/data?action=get_my_profile'),
            apiFetch('/api/data?action=get_appointments'),
            apiFetch('/api/data?action=get_blog')
        ]);
        const p = await profileRes.json();
        const appointments = await apptsRes.json();
        const blogPayload = await blogRes.json();

        if (!p || p.error) {
            document.getElementById('app-root').innerHTML = `
            <div class="container" style="padding: 10rem 1rem; text-align: center;">
                <p style="color: var(--text-muted); margin-bottom: 2rem;">${(p && p.error) || 'Debes iniciar sesión como especialista.'}</p>
                <button class="btn-gold" onclick="Router.navigateTo('login')">Ingresar</button>
            </div>`;
            this.initObserver();
            return;
        }

        const apptsList = Array.isArray(appointments) ? appointments : [];
        const myBlog = Array.isArray(blogPayload) ? blogPayload.filter(b => b.user_id == p.user_id) : [];

        document.getElementById('app-root').innerHTML = `
            <div class="container dashboard-container" style="max-width: 1600px;">
                <input type="file" id="d-file" style="display:none" accept="image/*" onchange="UI.handleAvatarPreview(this)">
                <div class="dashboard-header reveal">
                    <span class="tag">Panel de Maestría</span>
                    <h1>Gestiona tu <span>Presencia</span></h1>
                </div>
                
                <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(min(100%, 350px), 1fr));">
                    <aside class="dashboard-sidebar reveal">
                        <div class="dashboard-avatar-edit" onclick="document.getElementById('d-file').click()" style="cursor: pointer; position: relative;">
                            <img id="avatar-preview" src="${p.image || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300'}">
                            <div class="avatar-overlay">SUBIR FOTO</div>
                        </div>
                        <h3 style="font-size: 2.2rem; font-weight: 400; margin-bottom: 1rem;">${p.name}</h3>
                        <p style="opacity: 0.4; font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase;">Gestión Profesional</p>
                        
                        <div style="margin-top: 4rem; text-align: left;">
                             <button class="btn-gold" style="width: 100%; padding: 2rem; margin-bottom: 2rem;" onclick="Router.handleSaveProfile()">Guardar Perfil</button>
                             <div style="background: #fdfbf7; padding: 3rem; border-radius: 30px; border: 1px solid #eee;">
                                 <h4 style="font-size: 1rem; margin-bottom: 2rem;">PUBLICAR EN BLOG</h4>
                                 <input type="text" id="nb-title" placeholder="Título" class="dashboard-input" style="font-size: 1rem; margin-bottom: 1rem; padding: 1rem 0;">
                                 <select id="nb-type" class="dashboard-input" style="font-size: 1rem; margin-bottom: 1rem; padding: 1rem 0;">
                                     <option value="article">Artículo</option>
                                     <option value="video">Video (Link)</option>
                                 </select>
                                 <input type="text" id="nb-media" placeholder="URL Video/Imagen" class="dashboard-input" style="font-size: 1rem; margin-bottom: 1rem; padding: 1rem 0;">
                                 <textarea id="nb-content" placeholder="Texto descriptivo" class="dashboard-input" style="height: 100px; font-size: 1rem; padding: 1rem; border-radius: 15px;"></textarea>
                                 <button class="btn-gold" style="width: 100%; padding: 1.5rem; margin-top: 2rem; font-size: 0.8rem;" onclick="Router.handlePostBlog()">Publicar Contenido</button>
                             </div>
                        </div>
                    </aside>

                    <div class="dashboard-form reveal">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;">
                            <div class="form-group">
                                <label>Nombre de Maestría</label>
                                <input type="text" id="d-name" class="dashboard-input" value="${p.name || ''}">
                            </div>
                            <div class="form-group">
                                <label>Especialidad</label>
                                <input type="text" id="d-specialty" class="dashboard-input" value="${p.specialty || ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Narrativa Bio</label>
                            <textarea id="d-bio" class="dashboard-input">${p.bio || ''}</textarea>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;">
                            <div class="form-group"><label>Educación</label><textarea id="d-education" class="dashboard-input" style="height: 120px;">${p.education || ''}</textarea></div>
                            <div class="form-group"><label>Enfoque</label><textarea id="d-approach" class="dashboard-input" style="height: 120px;">${p.approach || ''}</textarea></div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;">
                            <div class="form-group">
                                <label>WhatsApp (Formato Internacional)</label>
                                <input type="text" id="d-whatsapp" class="dashboard-input" value="${p.whatsapp_number || ''}" placeholder="+52...">
                            </div>
                            <div class="form-group">
                                <label>Vibración del Perfil</label>
                                <select id="d-vibe" class="dashboard-input">
                                    <option value="zen" ${p.profile_vibe === 'zen' ? 'selected' : ''}>Santuario Zen (Calma)</option>
                                    <option value="ocean" ${p.profile_vibe === 'ocean' ? 'selected' : ''}>Océano Profundo (Fluidez)</option>
                                    <option value="forest" ${p.profile_vibe === 'forest' ? 'selected' : ''}>Bosque Ancestral (Raíces)</option>
                                    <option value="mountain" ${p.profile_vibe === 'mountain' ? 'selected' : ''}>Cumbre Nevada (Claridad)</option>
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;">
                             <div class="form-group">
                                <label>Instagram (URL)</label>
                                <input type="text" id="d-insta" class="dashboard-input" value="${p.instagram || ''}">
                            </div>
                            <div class="form-group">
                                <label>LinkedIn (URL)</label>
                                <input type="text" id="d-linkedin" class="dashboard-input" value="${p.linkedin || ''}">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Mensaje de Voz (Bienvenida)</label>
                            <input type="file" id="d-audio" class="dashboard-input" accept="audio/*">
                            ${p.audio_url ? `<p style="font-size: 0.8rem; margin-top: 0.5rem; color: var(--accent);">✓ Audio actual cargado</p>` : ''}
                        </div>

                        <div class="form-group">
                            <label>Inversión por Sesión</label>
                            <input type="number" id="d-price" class="dashboard-input" value="${p.price || ''}">
                        </div>
                        <input type="hidden" id="d-image" value="${p.image || ''}">

                        <div style="margin-top: 6rem; padding-top: 6rem; border-top: 1px solid #eee;">
                            <h3 style="font-size: 2rem; margin-bottom: 3rem;">Mapa de Crecimiento (Journey)</h3>
                            <div id="d-journey-list" style="margin-bottom: 3rem;">
                                <!-- Loaded via JS -->
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                                <input type="text" id="nj-title" placeholder="Título del Paso" class="dashboard-input">
                                <input type="text" id="nj-desc" placeholder="Descripción breve" class="dashboard-input">
                            </div>
                            <button class="btn-gold" style="margin-top: 2rem; padding: 1.5rem 3rem;" onclick="Router.handleAddJourneyStep()">Añadir Hito al Camino</button>
                        </div>

                        <div style="margin-top: 6rem; padding-top: 6rem; border-top: 1px solid #eee;">
                            <h3 style="font-size: 2rem; margin-bottom: 3rem;">Evaluaciones (Tests)</h3>
                            <div id="d-tests-list" style="margin-bottom: 3rem;">
                                <!-- Loaded via JS -->
                            </div>
                            <div class="form-group">
                                <input type="text" id="nt-title" placeholder="Título del Test" class="dashboard-input">
                                <textarea id="nt-desc" placeholder="Instrucciones para el paciente" class="dashboard-input" style="height: 100px;"></textarea>
                            </div>
                            <button class="btn-gold" style="margin-top: 2rem; padding: 1.5rem 3rem;" onclick="Router.handleCreateTest()">Crear Nueva Evaluación</button>
                        </div>
                    </div>

                    <div class="reveal" style="background: white; border-radius: 60px; padding: 5rem; box-shadow: var(--shadow-luxe); border: 1px solid #f0f0f0;">
                         <h3 style="font-size: 2rem; margin-bottom: 4rem;">Citas Solicitadas</h3>
                         <div style="display: flex; flex-direction: column; gap: 2rem; margin-bottom: 6rem;">
                            ${apptsList.length ? apptsList.map(a => {
                                const gcal = Router.buildGoogleCalendarApptUrl(a, 'Sesión · ' + (a.patient_name || 'Paciente'));
                                return `
                                <div style="background:#fafafa;padding:2.5rem;border-radius:30px;border-left:5px solid ${a.status==='confirmada'?'#28a745':(a.status==='cancelada'||a.status==='completada'?'#999':'var(--accent)')};opacity:${a.status==='cancelada'?'0.6':'1'}">
                                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.8rem;">
                                        <div style="font-weight:700;">${a.patient_name}</div>
                                        <span class="status-pill ${a.status==='confirmada'||a.status==='completada'?'status-active':(a.status==='cancelada'?'status-hidden':'')}" style="${a.status==='pendiente'?'background:rgba(194,154,91,0.1);color:var(--accent);':''}">${a.status}</span>
                                    </div>
                                    <div style="font-size:0.8rem;opacity:0.5;margin-bottom:1rem;">${a.date} | ${a.time}${a.modality?' · '+a.modality:''}</div>
                                    <a href="mailto:${a.patient_email}" style="display:block;font-size:0.85rem;color:var(--accent);margin-bottom:0.5rem;">${a.patient_email}</a>
                                    <a href="https://wa.me/${String(a.patient_phone || '').replace(/\D/g,'')}" target="_blank" style="font-size:0.85rem;color:#25D366;font-weight:600;display:block;margin-bottom:1rem;">WhatsApp →</a>
                                    ${a.status !== 'cancelada' ? `<div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:1rem;align-items:center;">
                                        <a href="/api/ics?id=${a.id}&token=${localStorage.getItem('activamente_token') || ''}" class="btn-admin btn-admin-edit" style="text-decoration:none;display:inline-block;padding:0.75rem 1.25rem;font-size:0.85rem;">Calendario (.ics)</a>
                                        <a href="${gcal}" target="_blank" rel="noopener noreferrer" class="btn-admin btn-admin-edit" style="text-decoration:none;display:inline-block;padding:0.75rem 1.25rem;font-size:0.85rem;">Google Calendar</a>
                                    </div>` : ''}
                                    ${a.status==='pendiente'?`<div style="display:flex;gap:1rem;margin-top:1rem;"><button class="btn-admin btn-admin-edit" onclick="Router.updateAppointmentStatus(${a.id},'confirmada')">Confirmar</button><button class="btn-admin btn-admin-delete" onclick="Router.updateAppointmentStatus(${a.id},'cancelada')">Cancelar</button></div>`:''}
                                    ${a.status==='confirmada'?`<button class="btn-admin btn-admin-edit" style="margin-top:1rem;" onclick="Router.updateAppointmentStatus(${a.id},'completada')">Marcar Completada</button>`:''}
                                </div>
                            `;
                            }).join('') : '<p style="opacity: 0.4;">No hay citas registradas.</p>'}
                         </div>

                         <h3 style="font-size: 2rem; margin-bottom: 4rem;">Bóveda del Paciente</h3>
                         <div style="background: #fdfbf7; padding: 3rem; border-radius: 40px; border: 1px solid #f0f0f0;">
                             <p style="font-size: 0.9rem; opacity: 0.6; margin-bottom: 3rem;">Expedientes y documentos compartidos con seguridad de grado clínico.</p>
                             <div id="d-vault-list">
                                 <!-- Loaded via JS -->
                             </div>
                             <input type="file" id="v-upload" style="display:none" onchange="Router.handleVaultUpload()">
                             <button class="btn-gold" style="width: 100%; padding: 1.5rem; background: var(--primary); color: white;" onclick="document.getElementById('v-upload').click()">Subir Documento Seguro</button>
                         </div>
                    </div>
                </div>
            </div>`;
        this.initObserver();
        this.fetchDashboardExtras();
    },

    async fetchDashboardExtras() {
        const [jRes, tRes, vRes] = await Promise.all([
            apiFetch('/api/data?action=get_journey'),
            apiFetch('/api/data?action=get_tests'),
            apiFetch('/api/data?action=get_vault_docs')
        ]);
        const journeys = await jRes.json();
        const tests = await tRes.json();
        const docs = await vRes.json();

        document.getElementById('d-journey-list').innerHTML = journeys.map(j => `
            <div class="vault-card" style="padding: 1.5rem; margin-bottom: 1rem;">
                <div style="flex: 1;">
                    <b style="font-size: 1.1rem;">${j.title}</b>
                    <p style="font-size: 0.8rem; opacity: 0.5;">${j.description}</p>
                </div>
                <button class="btn-admin btn-admin-delete" onclick="Router.handleDeleteJourney(${j.id})">×</button>
            </div>
        `).join('') || '<p style="opacity: 0.3">Sin hitos registrados.</p>';

        document.getElementById('d-tests-list').innerHTML = tests.map(t => `
            <div class="vault-card" style="padding: 1.5rem; margin-bottom: 1rem;">
                <div style="flex: 1;">
                    <b style="font-size: 1.1rem;">${t.title}</b>
                    <p style="font-size: 0.8rem; opacity: 0.5;">${t.description}</p>
                </div>
                <button class="btn-gold" style="padding: 0.5rem 1.5rem; font-size: 0.7rem;" onclick="UI.renderTests(${t.user_id})">Ver</button>
            </div>
        `).join('') || '<p style="opacity: 0.3">Sin evaluaciones creadas.</p>';

        document.getElementById('d-vault-list').innerHTML = docs.map(d => `
            <div class="vault-card" style="padding: 1.5rem; margin-bottom: 1rem;">
                <div class="vault-icon">📁</div>
                <div style="flex: 1;">
                    <b style="font-size: 0.9rem;">${d.doc_name}</b>
                    <p style="font-size: 0.7rem; opacity: 0.5;">${new Date(d.created_at).toLocaleDateString()}</p>
                </div>
                <a href="${d.doc_url}" target="_blank" class="btn-gold" style="padding: 0.5rem 1.5rem; font-size: 0.7rem; text-decoration: none;">Descargar</a>
            </div>
        `).join('') || '<p style="opacity: 0.3; margin-bottom: 2rem;">Bóveda vacía.</p>';
    },

    handleAvatarPreview(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('avatar-preview').src = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    async startFloatingTestimonials() {
        const res = await apiFetch('/api/data?action=get_site_testimonials');
        let testimonials;
        try {
            testimonials = await res.json();
        } catch {
            return;
        }
        if (!Array.isArray(testimonials) || !testimonials.length) return;

        let bubble = document.createElement('div');
        bubble.className = 'floating-testimonial';
        document.body.appendChild(bubble);

        setInterval(() => {
            const t = testimonials[Math.floor(Math.random() * testimonials.length)];
            const ts = Math.min(5, Math.max(0, parseInt(t.stars, 10) || 0));
            const c = String(t.content || '');
            bubble.innerHTML = `
                <div style="font-size: 0.8rem; color: var(--accent); margin-bottom: 0.5rem;">${'★'.repeat(ts)}${'☆'.repeat(5 - ts)}</div>
                <p style="font-size: 0.95rem; font-style: italic; margin-bottom: 1rem;">"${c.substring(0, 100)}${c.length > 100 ? '...' : ''}"</p>
                <b style="font-size: 0.75rem; opacity: 0.6;">— ${t.name || 'Anónimo'}</b>
            `;
            bubble.classList.add('active');
            setTimeout(() => bubble.classList.remove('active'), 6000);
        }, 15000);
    },

    async renderSuperAdmin(subView = 'users') {
        console.log(`UI: Rendering SuperAdmin view: ${subView}`);
        const root = document.getElementById('app-root');
        if (!root) return;

        root.innerHTML = `
            <section class="admin-sanctuary" style="padding: 12rem 0; background: #fafafa; min-height: 100vh;">
                <div class="container">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6rem;">
                        <div>
                            <span class="tag-luxe" style="letter-spacing: 8px;">AUDITORÍA SUPREMA</span>
                            <h2 style="font-size: 5rem; line-height: 1;">Centro de <span>Control</span></h2>
                        </div>
                        <div class="admin-tab-group" style="display: flex; background: rgba(0,0,0,0.03); padding: 0.5rem; border-radius: 100px; flex-wrap: wrap; gap: 0.3rem;">
                            <button class="admin-tab ${subView === 'users' ? 'active' : ''}" onclick="UI.renderSuperAdmin('users')">Pacientes y cuentas</button>
                            <button class="admin-tab ${subView === 'psychologists' ? 'active' : ''}" onclick="UI.renderSuperAdmin('psychologists')">Psicólogos</button>
                            <button class="admin-tab ${subView === 'testimonials' ? 'active' : ''}" onclick="UI.renderSuperAdmin('testimonials')">Testimonios</button>
                            <button class="admin-tab ${subView === 'forum' ? 'active' : ''}" onclick="UI.renderSuperAdmin('forum')">Foro</button>
                            <button class="admin-tab ${subView === 'news' ? 'active' : ''}" onclick="UI.renderSuperAdmin('news')">Noticias</button>
                            <button class="admin-tab ${subView === 'contacts' ? 'active' : ''}" onclick="UI.renderSuperAdmin('contacts')" style="${subView !== 'contacts' ? '' : ''}">Contactos</button>
                        </div>
                    </div>
                    
                    <div id="admin-view-content" class="reveal active" style="min-height: 400px;">
                        <div style="display: flex; justify-content: center; padding: 10rem;">
                            <div class="lux-spinner"></div>
                        </div>
                    </div>
                </div>
            </section>
        `;

        if (subView === 'psychologists')    await this.renderAdminPsychologists();
        else if (subView === 'testimonials') await this.renderAdminTestimonials();
        else if (subView === 'forum')        await this.renderAdminForum();
        else if (subView === 'news')         await this.renderAdminNews();
        else if (subView === 'contacts')     await this.renderAdminContacts();
        else                                 await this.renderAdminUsers();
    },

    async renderAdminUsers() {
        try {
            const res = await apiFetch('/api/admin?action=admin_get_users');
            const users = await res.json();
            const content = document.getElementById('admin-view-content');
            content.innerHTML = `
                <div class="admin-card-luxe">
                    <table class="admin-table-luxe">
                        <thead>
                            <tr>
                                <th>Email de Usuario</th>
                                <th>Jerarquía</th>
                                <th style="text-align: right;">Operaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(u => `
                                <tr>
                                    <td style="font-weight: 600;">${u.email}</td>
                                    <td><span class="status-pill status-active" style="background: rgba(194,154,91,0.1); color: var(--accent);">${u.role}</span></td>
                                    <td style="text-align: right;">
                                        <button class="btn-admin btn-admin-delete" onclick="UI.handleAdminDelete('user', ${u.id})">Expulsar</button>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="3" style="text-align:center; padding: 5rem; opacity: 0.5;">No hay registros disponibles.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (e) {
            console.error("Error loading users:", e);
        }
    },

    async renderAdminPsychologists() {
        try {
            const res = await apiFetch('/api/admin?action=admin_get_psychologists');
            const items = await res.json();
            const content = document.getElementById('admin-view-content');
            content.innerHTML = `
                <div class="admin-card-luxe">
                    <table class="admin-table-luxe">
                        <thead>
                            <tr>
                                <th>Nombre Maestro</th>
                                <th>Maestría</th>
                                <th>Estado Publicación</th>
                                <th style="text-align: right;">Acciones de Élite</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(p => `
                                <tr style="opacity: ${p.is_active ? '1' : '0.6'}">
                                    <td><b style="font-size: 1.1rem;">${p.name}</b></td>
                                    <td><span style="font-style: italic; opacity: 0.7;">${p.specialty}</span></td>
                                    <td><span class="status-pill ${p.is_active ? 'status-active' : 'status-hidden'}">${p.is_active ? 'Visible' : 'Oculto'}</span></td>
                                    <td style="text-align: right;">
                                        <div class="admin-action-bundle" style="justify-content: flex-end;">
                                            <button class="btn-admin btn-admin-edit" onclick="UI.handleAdminEdit('psychologist', ${JSON.stringify(p).replace(/"/g, '&quot;')})">Editar</button>
                                            <button class="btn-admin btn-admin-toggle" onclick="UI.handleAdminToggleVisibility('psychologist', ${p.user_id})">${p.is_active ? 'Ocultar' : 'Mostrar'}</button>
                                            <button class="btn-admin btn-admin-delete" onclick="UI.handleAdminDelete('psychologist', ${p.user_id})">Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" style="text-align:center; padding: 5rem; opacity: 0.5;">No hay psicólogos registrados.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (e) {
            console.error("Error loading psychologists:", e);
        }
    },

    async renderAdminTestimonials() {
        try {
            const res = await apiFetch('/api/admin?action=admin_get_testimonials');
            const items = await res.json();
            const content = document.getElementById('admin-view-content');
            if (!Array.isArray(items)) {
                content.innerHTML = `<p style="opacity:0.5;text-align:center;padding:4rem;">${escapeHtml(items.error || 'No se pudieron cargar los testimonios.')}</p>`;
                return;
            }
            content.innerHTML = `
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap:3rem;">
                    ${items.map(t => {
                        const ts = Math.min(5, Math.max(0, parseInt(t.stars, 10) || 0));
                        return `
                        <div class="admin-card-luxe" style="opacity: ${t.is_active ? '1' : '0.6'}">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                                <div class="status-pill ${t.is_active ? 'status-active' : 'status-hidden'}">${t.is_active ? 'Activo' : 'Oculto'}</div>
                                <div style="color: var(--accent);">${'★'.repeat(ts)}${'☆'.repeat(5 - ts)}</div>
                            </div>
                            <p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 2rem; font-style: italic;">"${t.content}"</p>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <b style="letter-spacing: 1px; text-transform: uppercase; font-size: 0.8rem;">— ${t.name}</b>
                                <div class="admin-action-bundle">
                                    <button class="btn-admin btn-admin-edit" onclick="UI.handleAdminEdit('testimonial', ${JSON.stringify(t).replace(/"/g, '&quot;')})">Editar</button>
                                    <button class="btn-admin btn-admin-toggle" onclick="UI.handleAdminToggleVisibility('testimonial', ${t.id})">${t.is_active ? 'Ocultar' : 'Mostrar'}</button>
                                    <button class="btn-admin btn-admin-delete" onclick="UI.handleAdminDelete('testimonial', ${t.id})">Borrar</button>
                                </div>
                            </div>
                        </div>
                    `;
                    }).join('') || '<p style="opacity:0.3; text-align: center; padding: 5rem; grid-column: 1/-1;">Sin testimonios.</p>'}
                </div>
            `;
        } catch (e) {
            console.error("Error loading testimonials:", e);
        }
    },

    async renderAdminForum() {
        try {
            const res = await apiFetch('/api/admin?action=admin_get_forum');
            const items = await res.json();
            const content = document.getElementById('admin-view-content');
            content.innerHTML = `
                <div class="admin-card-luxe">
                     <table class="admin-table-luxe">
                        <thead>
                            <tr>
                                <th>Discusión</th>
                                <th>Extracto</th>
                                <th>Visibilidad</th>
                                <th style="text-align: right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(f => `
                                <tr style="opacity: ${f.is_active ? '1' : '0.6'}">
                                    <td><b style="font-size: 1.1rem; color: var(--primary);">${f.title}</b></td>
                                    <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.6;">${f.content}</td>
                                    <td><span class="status-pill ${f.is_active ? 'status-active' : 'status-hidden'}">${f.is_active ? 'Público' : 'Privado'}</span></td>
                                    <td style="text-align: right;">
                                        <div class="admin-action-bundle" style="justify-content: flex-end;">
                                            <button class="btn-admin btn-admin-toggle" onclick="UI.handleAdminToggleVisibility('forum_post', ${f.id})">${f.is_active ? 'Ocultar' : 'Mostrar'}</button>
                                            <button class="btn-admin btn-admin-delete" onclick="UI.handleAdminDelete('forum_post', ${f.id})">Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" style="text-align:center; padding: 5rem; opacity: 0.5;">El foro está vacío.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (e) {
            console.error("Error loading forum:", e);
        }
    },

    async renderAdminNews() {
        try {
            const res   = await apiFetch('/api/data?action=get_news');
            const items = await res.json();
            const content = document.getElementById('admin-view-content');
            content.innerHTML = `
                <div class="admin-card-luxe" style="margin-bottom:4rem;padding:5rem;">
                    <h3 style="font-size:2rem;margin-bottom:3rem;">Publicar Nueva Noticia</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;margin-bottom:2rem;">
                        <div class="form-group"><label>Título</label><input type="text" id="an-title" class="dashboard-input" placeholder="Título de la noticia"></div>
                        <div class="form-group"><label>URL de Imagen</label><input type="text" id="an-image" class="dashboard-input" placeholder="https://..."></div>
                    </div>
                    <div class="form-group"><label>Contenido</label><textarea id="an-content" class="dashboard-input">Descripción de la noticia...</textarea></div>
                    <button class="btn-gold" style="padding:1.5rem 4rem;" onclick="Router.handleAdminPostNews()">Publicar Noticia</button>
                </div>
                <div class="admin-card-luxe">
                    <table class="admin-table-luxe">
                        <thead><tr><th>Título</th><th>Extracto</th><th>Fecha</th><th style="text-align:right;">Acciones</th></tr></thead>
                        <tbody>
                            ${items.map(n => `
                                <tr>
                                    <td><b>${n.title}</b></td>
                                    <td style="max-width:300px;opacity:0.6;font-size:0.9rem;">${n.content.substring(0,60)}...</td>
                                    <td style="opacity:0.6;font-size:0.85rem;">${new Date(n.created_at).toLocaleDateString()}</td>
                                    <td style="text-align:right;"><button class="btn-admin btn-admin-delete" onclick="UI.handleAdminDelete('news', ${n.id})">Eliminar</button></td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" style="text-align:center;padding:4rem;opacity:0.5;">Sin noticias publicadas.</td></tr>'}
                        </tbody>
                    </table>
                </div>`;
        } catch(e) { console.error("Error loading news:", e); }
    },

    async renderAdminContacts() {
        try {
            const res   = await apiFetch('/api/admin?action=admin_get_contacts');
            const items = await res.json();
            const content = document.getElementById('admin-view-content');
            content.innerHTML = `
                <div class="admin-card-luxe">
                    <table class="admin-table-luxe">
                        <thead><tr><th>Remitente</th><th>Tipo</th><th>Asunto / Mensaje</th><th>Fecha</th><th style="text-align:right;">Acciones</th></tr></thead>
                        <tbody>
                            ${items.map(c => `
                                <tr>
                                    <td>
                                        <b style="display:block;">${c.name}</b>
                                        <a href="mailto:${c.email}" style="font-size:0.85rem;color:var(--accent);">${c.email}</a>
                                    </td>
                                    <td><span class="status-pill" style="background:rgba(194,154,91,0.1);color:var(--accent);">${c.type}</span></td>
                                    <td style="max-width:280px;">
                                        <b style="display:block;font-size:0.9rem;margin-bottom:0.3rem;">${c.subject || '—'}</b>
                                        <span style="opacity:0.6;font-size:0.85rem;">${c.message.substring(0,70)}${c.message.length > 70 ? '...' : ''}</span>
                                    </td>
                                    <td style="opacity:0.6;font-size:0.85rem;">${new Date(c.created_at).toLocaleDateString()}</td>
                                    <td style="text-align:right;">
                                        <div class="admin-action-bundle" style="justify-content:flex-end;">
                                            <a href="mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || 'Activamente')}" class="btn-admin btn-admin-edit">Responder</a>
                                            <button class="btn-admin btn-admin-delete" onclick="UI.handleAdminDelete('contact', ${c.id})">Archivar</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="5" style="text-align:center;padding:5rem;opacity:0.5;">No hay mensajes de contacto.</td></tr>'}
                        </tbody>
                    </table>
                </div>`;
        } catch(e) { console.error("Error loading contacts:", e); }
    },

    async handleAdminToggleVisibility(type, id) {
        const res = await apiFetch(`/api/admin?action=admin_toggle_visibility&type=${type}&id=${id}`);
        const data = await res.json();
        if (data.success) {
            const viewMap = { psychologist: 'psychologists', testimonial: 'testimonials', forum_post: 'forum' };
            this.renderSuperAdmin(viewMap[type] || 'users');
        }
    },

    handleAdminEdit(type, item) {
        let html = '';
        if (type === 'psychologist') {
            html = `
                <div id="admin-edit-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(4,47,46,0.9); backdrop-filter: blur(10px); display:flex; align-items:center; justify-content:center; z-index:10000;">
                    <div class="admin-card-luxe" style="width:600px; max-width:90%; padding: 5rem;">
                        <button onclick="this.parentElement.parentElement.remove()" style="position:absolute; top:2rem; right:2rem; background:none; border:none; font-size:2rem; cursor:pointer; color: #ccc;">×</button>
                        <span class="tag-luxe" style="margin-bottom: 1rem;">EDICIÓN DE MAESTRO</span>
                        <h3 style="font-size: 3rem; margin-bottom: 3rem;">Refinar Perfil</h3>
                        <div class="form-group"><label>Nombre Completo</label><input type="text" id="edit-p-name" class="dashboard-input" value="${item.name}"></div>
                        <div class="form-group"><label>Especialidad Clínica</label><input type="text" id="edit-p-specialty" class="dashboard-input" value="${item.specialty}"></div>
                        <div class="form-group"><label>Honorarios (USD)</label><input type="number" id="edit-p-price" class="dashboard-input" value="${item.price}"></div>
                        <button class="btn-gold" style="width:100%; padding:2.5rem; margin-top:2rem;" onclick="UI.handleAdminUpdate('psychologist', ${item.user_id})">Sellar Cambios</button>
                    </div>
                </div>
            `;
        } else if (type === 'testimonial') {
            html = `
                <div id="admin-edit-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(4,47,46,0.9); backdrop-filter: blur(10px); display:flex; align-items:center; justify-content:center; z-index:10000;">
                    <div class="admin-card-luxe" style="width:600px; max-width:90%; padding: 5rem;">
                        <button onclick="this.parentElement.parentElement.remove()" style="position:absolute; top:2rem; right:2rem; background:none; border:none; font-size:2rem; cursor:pointer; color: #ccc;">×</button>
                        <span class="tag-luxe" style="margin-bottom: 1rem;">EDICIÓN DE TESTIMONIO</span>
                        <h3 style="font-size: 3rem; margin-bottom: 3rem;">Refinar Experiencia</h3>
                        <div class="form-group"><label>Autor del Relato</label><input type="text" id="edit-t-name" class="dashboard-input" value="${item.name}"></div>
                        <div class="form-group"><label>Relato de Vida</label><textarea id="edit-t-content" class="dashboard-input" style="height:150px;">${item.content}</textarea></div>
                        <div class="form-group"><label>Puntuación de Estrellas (1-5)</label><input type="number" id="edit-t-stars" class="dashboard-input" value="${item.stars}" min="1" max="5"></div>
                        <button class="btn-gold" style="width:100%; padding:2.5rem; margin-top:2rem;" onclick="UI.handleAdminUpdate('testimonial', ${item.id})">Sellar Cambios</button>
                    </div>
                </div>
            `;
        }
        document.body.insertAdjacentHTML('beforeend', html);
    },

    async handleAdminUpdate(type, id) {
        let data = {};
        let action = '';
        if (type === 'psychologist') {
            data = {
                user_id: id,
                name: document.getElementById('edit-p-name').value,
                specialty: document.getElementById('edit-p-specialty').value,
                price: document.getElementById('edit-p-price').value
            };
            action = 'admin_update_psychologist';
        } else if (type === 'testimonial') {
            data = {
                id: id,
                name: document.getElementById('edit-t-name').value,
                content: document.getElementById('edit-t-content').value,
                stars: document.getElementById('edit-t-stars').value
            };
            action = 'admin_update_testimonial';
        }

        const res = await apiFetch(`/api/data?action=${action}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            document.getElementById('admin-edit-modal').remove();
            this.renderSuperAdmin(type === 'psychologist' ? 'psychologists' : 'testimonials');
        }
    },

    async handleAdminDelete(type, id) {
        if (!confirm('¿Seguro que deseas eliminar este registro permanentemente?')) return;
        const res = await apiFetch(`/api/admin?action=admin_delete_${type}&id=${id}`);
        const data = await res.json();
        if (data.success) {
            const viewMap = { user: 'users', psychologist: 'psychologists', testimonial: 'testimonials', forum_post: 'forum', news: 'news', contact: 'contacts' };
            this.renderSuperAdmin(viewMap[type] || 'users');
        }
    },

    toggleAudio(url) {
        if (this.currentAudio && !this.currentAudio.paused) {
            this.currentAudio.pause();
            document.querySelectorAll('.audio-btn').forEach(b => b.innerText = '▶');
            return;
        }
        this.currentAudio = new Audio(url);
        this.currentAudio.play();
        document.querySelectorAll('.audio-btn').forEach(b => b.innerText = 'II');
    },

    renderZenSpace(vibe = 'zen') {
        const modal = document.createElement('div');
        modal.className = 'zen-overlay';
        modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; z-index:20000; display:flex; align-items:center; justify-content:center; background: rgba(10,10,10,0.35); backdrop-filter: blur(8px); padding: 1.5rem;";
        modal.innerHTML = `
            <div class="zen-widget reveal active" style="max-width: 640px; width: min(92vw, 640px); position: relative; border: 1px solid rgba(194,154,91,0.25); box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
                <button aria-label="Cerrar" onclick="this.closest('.zen-overlay').remove()" style="position:absolute; top:1rem; right:1rem; width:38px; height:38px; background:white; border:1px solid #ddd; border-radius:50%; font-size:1.6rem; line-height:1; cursor:pointer; color:#555; z-index:2;">×</button>
                <div class="mandala-container">
                    <svg class="mandala-svg" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" stroke-width="0.5" opacity="0.2" />
                        <g class="mandala-layer">
                            <path d="M50 5 Q55 35 85 45 Q55 55 50 85 Q45 55 15 45 Q45 35 50 5" fill="none" stroke="var(--accent)" stroke-width="1" />
                            <circle cx="50" cy="50" r="10" fill="var(--accent)" opacity="0.1" />
                        </g>
                        <g class="mandala-layer" style="animation-delay: -4s">
                            <path d="M50 15 Q53 38 75 45 Q53 52 50 75 Q47 52 25 45 Q47 38 50 15" fill="none" stroke="var(--accent)" stroke-width="0.5" />
                        </g>
                    </svg>
                </div>
                <h3 style="font-size: 2.5rem; margin-bottom: 1rem;">Santuario Digital Zen</h3>
                <p class="breathing-text">Inhala... Exhala...</p>
                <p style="margin-top: 3rem; opacity: 0.5; font-size: 0.9rem;">Sincroniza tu aliento con el latido visual del Santuario.</p>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.remove();
        }, { once: true });
    },

    async renderTests(uid) {
        const res = await apiFetch(`/api/data?action=get_tests&user_id=${uid}&full=1`);
        const tests = await res.json();
        
        const modal = document.createElement('div');
        modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; z-index:20000; display:flex; align-items:center; justify-content:center; background: rgba(4,47,46,0.95); backdrop-filter: blur(20px); color: white;";
        
        if (!tests.length) {
            modal.innerHTML = `<div class="reveal active" style="text-align:center"><h3>El Maestro aún no ha habilitado evaluaciones exclusivas.</h3><button onclick="this.parentElement.parentElement.remove()" class="btn-gold" style="margin-top:2rem">Volver</button></div>`;
        } else {
            const t = tests[0]; // Take the first one for now
            modal.innerHTML = `
                <div class="reveal active" style="max-width: 700px; width: 90%; background: white; color: var(--text-dark); padding: 6rem; border-radius: 60px;">
                    <span class="tag">EVALUACIÓN CLÍNICA</span>
                    <h2 style="font-size: 3.5rem; margin: 2rem 0;">${t.title}</h2>
                    <p style="opacity: 0.6; margin-bottom: 4rem;">${t.description}</p>
                    <div id="test-questions-flow">
                        ${t.questions.map((q, i) => `
                            <div class="form-group" style="margin-bottom: 4rem;">
                                <label style="font-size: 1.2rem; color: var(--primary);">${i+1}. ${q.question_text}</label>
                                <textarea class="dashboard-input test-ans" data-qid="${q.id}" placeholder="Tu reflexión..." style="height: 100px; margin-top: 1rem;"></textarea>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-gold" style="width: 100%; padding: 2rem; font-size: 1.2rem;" onclick="UI.submitTest(${t.id})">Enviar al Especialista</button>
                    <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; margin-top:3rem; color: #999; width:100%">Cancelar y volver</button>
                </div>
            `;
        }
        document.body.appendChild(modal);
    },

    async submitTest(testId) {
        const answers = Array.from(document.querySelectorAll('.test-ans')).map(ta => ({
            question_id: ta.dataset.qid,
            answer: ta.value
        }));
        const res = await apiFetch('/api/data?action=submit_test', {
            method: 'POST',
            body: JSON.stringify({
                test_id: testId,
                name: 'Anónimo (Sesión Actual)',
                email: 'anon@paciente.com',
                answers: answers
            })
        });
        const data = await res.json();
        if (data.success) {
            alert('✓ Test enviado. Tu Maestro revisará estas reflexiones en tu próxima sesión.');
            location.reload();
        }
    },

    renderIntuitiveMatcher() {
        const modal = document.createElement('div');
        modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; z-index:20000; display:flex; align-items:center; justify-content:center; background: radial-gradient(circle at center, #5d1021, #1a0509); color: white;";
        modal.innerHTML = `
            <div class="reveal active" style="max-width: 800px; text-align: center; padding: 4rem;">
                <span class="tag-luxe" style="color: var(--accent);">VIBRATIONAL MATCHING</span>
                <h2 style="font-size: 5rem; line-height: 1; margin: 3rem 0; color: white;">¿Para qué buscas <span>espacio</span> hoy?</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-top: 5rem;">
                    <button class="btn-gold" style="padding: 3rem; font-size: 1.5rem;" onclick="UI.handleMatch('paz')">Encontrar Paz</button>
                    <button class="btn-gold" style="padding: 3rem; font-size: 1.5rem;" onclick="UI.handleMatch('proposito')">Encontrar Propósito</button>
                    <button class="btn-gold" style="padding: 3rem; font-size: 1.5rem;" onclick="UI.handleMatch('fuerza')">Encontrar Fuerza</button>
                    <button class="btn-gold" style="padding: 3rem; font-size: 1.5rem;" onclick="UI.handleMatch('claridad')">Encontrar Claridad</button>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; margin-top:8rem; color: rgba(255,255,255,0.3); font-size: 1.2rem;">Volver al Inicio</button>
            </div>
        `;
        document.body.appendChild(modal);
    },

    handleMatch(vibe) {
        // Simple mock matching for now, search psychologists by vibe in bio/specialty
        document.body.lastChild.remove();
        if (vibe === 'paz') UI.updateMood('calm');
        if (vibe === 'fuerza') UI.updateMood('strength');
        if (vibe === 'proposito') UI.updateMood('energy');
        
        const q = vibe === 'paz' ? 'ansiedad' : (vibe === 'fuerza' ? 'depresion' : 'pareja');
        UI.fetchAndRenderList(q);
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    },

    updateMood(mood) {
        document.body.classList.remove('mood-calm', 'mood-energy', 'mood-strength');
        if (mood) document.body.classList.add(`mood-${mood}`);
    },

    applyFilters() {
        const specialty = document.getElementById('f-specialty')?.value || '';
        const modality  = document.getElementById('f-modality')?.value  || '';
        const priceMax  = document.getElementById('f-price')?.value     || '';
        this.fetchAndRenderList('', specialty, modality, priceMax);
        document.getElementById('results-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    clearFilters() {
        const s = document.getElementById('f-specialty');
        const m = document.getElementById('f-modality');
        const p = document.getElementById('f-price');
        const pd = document.getElementById('f-price-display');
        if (s)  s.value = '';
        if (m)  m.value = '';
        if (p)  p.value = 5000;
        if (pd) pd.textContent = '5000';
        this.fetchAndRenderList();
    },

    switchRegTab(btn) {
        document.querySelectorAll('.reg-tab').forEach(t => {
            t.classList.remove('reg-tab--active');
            t.style.background = 'transparent';
            t.style.color = 'var(--text-muted)';
            t.style.boxShadow = 'none';
        });
        btn.classList.add('reg-tab--active');
        btn.style.background = 'white';
        btn.style.color = 'var(--primary)';
        btn.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
        const role = btn.dataset.role;
        document.getElementById('reg-patient-desc').style.display = role === 'patient' ? '' : 'none';
        document.getElementById('reg-psy-desc').style.display = role === 'psychologist' ? '' : 'none';
    },

    async renderPatientDashboard() {
        const res = await apiFetch('/api/data?action=get_patient_appointments');
        let appointments;
        try {
            appointments = await res.json();
        } catch {
            appointments = [];
        }
        if (!Array.isArray(appointments)) {
            const err = appointments.error || 'No se pudieron cargar tus citas.';
            document.getElementById('app-root').innerHTML = `
            <div class="container" style="padding: 10rem 1rem; text-align: center;">
                <p style="color: var(--text-muted); margin-bottom: 2rem;">${err}</p>
                <button class="btn-gold" onclick="Router.navigateTo('login')">Ingresar</button>
            </div>`;
            this.initObserver();
            return;
        }
        const upcoming = appointments.filter(a => a.status === 'confirmada' || a.status === 'pendiente');
        const reviewed  = appointments.filter(a => a.has_review);

        document.getElementById('app-root').innerHTML = `
            <div class="container dashboard-container" style="max-width:1400px;">
                <div class="dashboard-header reveal">
                    <span class="tag">Portal del Paciente</span>
                    <h1>Mi <span>Santuario</span></h1>
                </div>

                <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:4rem; margin-bottom:8rem;">
                    <div class="admin-card-luxe reveal" style="text-align:center; padding:4rem;">
                        <b style="font-size:3.5rem; color:var(--accent); display:block; font-weight:200;">${appointments.length}</b>
                        <p style="text-transform:uppercase; letter-spacing:2px; font-size:0.8rem; opacity:0.6; margin-top:1rem;">Citas Totales</p>
                    </div>
                    <div class="admin-card-luxe reveal" style="text-align:center; padding:4rem;">
                        <b style="font-size:3.5rem; color:var(--accent); display:block; font-weight:200;">${upcoming.length}</b>
                        <p style="text-transform:uppercase; letter-spacing:2px; font-size:0.8rem; opacity:0.6; margin-top:1rem;">Próximas Citas</p>
                    </div>
                    <div class="admin-card-luxe reveal" style="text-align:center; padding:4rem;">
                        <b style="font-size:3.5rem; color:var(--accent); display:block; font-weight:200;">${reviewed.length}</b>
                        <p style="text-transform:uppercase; letter-spacing:2px; font-size:0.8rem; opacity:0.6; margin-top:1rem;">Reseñas Dadas</p>
                    </div>
                </div>

                <h2 style="font-size:3rem; margin-bottom:5rem;">Mis Citas</h2>
                ${appointments.length ? `
                    <div style="display:flex; flex-direction:column; gap:3rem;">
                        ${appointments.map(a => `
                            <div class="admin-card-luxe reveal" style="display:grid; grid-template-columns:90px 1fr auto; gap:3rem; align-items:center; padding:3rem 4rem; opacity:${a.status === 'cancelada' ? '0.6' : '1'};">
                                <div style="width:90px; height:90px; border-radius:25px; overflow:hidden; background:#f0f0f0; flex-shrink:0;">
                                    <img src="${a.image || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200'}" style="width:100%; height:100%; object-fit:cover;">
                                </div>
                                <div>
                                    <div style="font-size:1.4rem; font-weight:700; margin-bottom:0.5rem;">${a.psychologist_name}</div>
                                    <div style="font-style:italic; color:var(--text-muted); margin-bottom:1rem; font-family:'Playfair Display';">${a.specialty}</div>
                                    <div style="font-size:0.9rem; opacity:0.6; display:flex; gap:2rem; flex-wrap:wrap;">
                                        <span>📅 ${a.date}</span>
                                        <span>⏰ ${a.time}</span>
                                        <span>💰 $${a.price} MXN</span>
                                        ${a.modality ? `<span>🖥 ${a.modality}</span>` : ''}
                                    </div>
                                    ${a.status !== 'cancelada' ? `
                                    <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:1.25rem;">
                                        <a href="/api/ics?id=${a.id}&token=${localStorage.getItem('activamente_token') || ''}" class="btn-admin btn-admin-edit" style="text-decoration:none; font-size:0.8rem; padding:0.65rem 1.2rem;">Calendario (.ics)</a>
                                        <a href="${Router.buildGoogleCalendarApptUrl(a, 'Cita · ' + (a.psychologist_name || 'Especialista'))}" target="_blank" rel="noopener noreferrer" class="btn-admin btn-admin-edit" style="text-decoration:none; font-size:0.8rem; padding:0.65rem 1.2rem;">Google Calendar</a>
                                    </div>` : ''}
                                </div>
                                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:1.5rem;">
                                    <span class="status-pill ${a.status === 'confirmada' || a.status === 'completada' ? 'status-active' : (a.status === 'cancelada' ? 'status-hidden' : '')}" style="${a.status === 'pendiente' ? 'background:rgba(194,154,91,0.1);color:var(--accent);' : ''}">${a.status}</span>
                                    ${a.status === 'pendiente' ? `<button class="btn-admin btn-admin-delete" onclick="UI.cancelPatientAppointment(${a.id})">Cancelar</button>` : ''}
                                    ${(a.status === 'confirmada' || a.status === 'completada') && !a.has_review ? `<button class="btn-admin btn-admin-edit" onclick="UI.renderVerifiedReview(${a.id}, '${a.psychologist_name.replace(/'/g, "\\'")}')">Dejar Reseña ✓</button>` : ''}
                                    ${a.has_review ? `<span style="font-size:0.8rem; color:var(--accent); font-weight:600;">★ Reseña enviada</span>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align:center; padding:10rem; background:white; border-radius:60px; border:1px solid var(--border);">
                        <div style="font-size:5rem; margin-bottom:2rem; opacity:0.2;">📅</div>
                        <h3 style="font-size:2rem; opacity:0.4; font-weight:300;">Aún no tienes citas agendadas</h3>
                        <p style="opacity:0.3; margin:2rem 0 4rem; font-size:1.1rem;">Encuentra a tu especialista y comienza tu camino.</p>
                        <button class="btn-gold" style="padding:1.5rem 4rem;" onclick="Router.navigateTo('home')">Explorar Especialistas</button>
                    </div>
                `}
            </div>`;
        this.initObserver();
    },

    async cancelPatientAppointment(id) {
        if (!confirm('¿Deseas cancelar esta cita?')) return;
        const res = await apiFetch(`/api/data?action=cancel_appointment&id=${id}`);
        const data = await res.json();
        if (data.success) this.renderPatientDashboard();
    },

    renderVerifiedReview(appointmentId, doctorName) {
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:20000;display:flex;align-items:center;justify-content:center;background:rgba(4,47,46,0.95);backdrop-filter:blur(20px);';
        modal.innerHTML = `
            <div style="max-width:650px;width:90%;background:white;padding:6rem;border-radius:60px;text-align:center;position:relative;">
                <button onclick="this.parentElement.parentElement.remove()" style="position:absolute;top:2rem;right:2.5rem;background:none;border:none;font-size:2.5rem;cursor:pointer;opacity:0.3;line-height:1;">×</button>
                <span class="tag">RESEÑA VERIFICADA</span>
                <div style="font-size:1.2rem;color:var(--accent);font-weight:700;margin:1rem 0 0.5rem;">✓ Paciente con cita confirmada</div>
                <h2 style="font-size:2.8rem;margin-bottom:4rem;">${doctorName}</h2>
                <div class="star-rating-input" style="margin-bottom:4rem;display:flex;justify-content:center;">
                    <input type="radio" id="rv5" name="rv-stars" value="5" checked><label for="rv5">★</label>
                    <input type="radio" id="rv4" name="rv-stars" value="4"><label for="rv4">★</label>
                    <input type="radio" id="rv3" name="rv-stars" value="3"><label for="rv3">★</label>
                    <input type="radio" id="rv2" name="rv-stars" value="2"><label for="rv2">★</label>
                    <input type="radio" id="rv1" name="rv-stars" value="1"><label for="rv1">★</label>
                </div>
                <input type="text" id="rv-name" placeholder="Tu nombre (o Anónimo)" style="width:100%;padding:1.8rem;border-radius:25px;border:1px solid var(--border);margin-bottom:2rem;font-size:1.1rem;outline:none;background:#fafafa;font-family:inherit;">
                <textarea id="rv-content" placeholder="Comparte tu experiencia con este especialista..." style="width:100%;padding:1.8rem;border-radius:25px;border:1px solid var(--border);height:160px;margin-bottom:3rem;font-size:1.1rem;outline:none;background:#fafafa;resize:none;font-family:inherit;"></textarea>
                <button class="btn-gold" style="width:100%;padding:2rem;font-size:1.2rem;" onclick="UI.submitVerifiedReview(${appointmentId})">Publicar Reseña Verificada</button>
                <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;margin-top:2rem;color:#999;width:100%;cursor:pointer;font-size:1rem;">Cancelar</button>
            </div>`;
        document.body.appendChild(modal);
    },

    async submitVerifiedReview(appointmentId) {
        const stars = document.querySelector('input[name="rv-stars"]:checked').value;
        const data  = {
            appointment_id: appointmentId,
            name: document.getElementById('rv-name').value || 'Paciente Verificado',
            content: document.getElementById('rv-content').value,
            stars: parseInt(stars)
        };
        if (!data.content) return alert('Por favor escribe tu experiencia.');
        const res = await apiFetch('/api/data?action=post_verified_testimonial', { method: 'POST', body: JSON.stringify(data) });
        const result = await res.json();
        if (result.success) {
            document.querySelector('[style*="z-index:20000"]')?.remove();
            alert('¡Gracias! Tu reseña verificada ha sido publicada.');
            this.renderPatientDashboard();
        } else {
            alert(result.error || 'Error al publicar.');
        }
    },

    renderAbout() {
        document.getElementById('app-root').innerHTML = `
            <div class="page-about">
            <section class="about-hero">
                <div class="container reveal">
                    <span class="tag-luxe about-hero__tag">NUESTRA HISTORIA</span>
                    <h1 class="about-hero__title">Bienvenido al cambio<br><span class="about-hero__accent">con Activamente</span>.</h1>
                    <p class="about-hero__lead">Activamente surgió con el propósito de elevar el estándar de la psicoterapia. Creemos que el bienestar emocional no es un lujo, sino un proceso que debe ser guiado por la evidencia científica y un acompañamiento profundamente humano.</p>
                </div>
            </section>

            <section class="about-band about-band--silk">
                <div class="container about-mission-row">
                    <div class="reveal about-mission-copy">
                        <span class="tag about-mission-copy__tag">NUESTRA MISIÓN</span>
                        <p class="about-mission-copy__text">
                            <strong>Misión:</strong> Empoderar a las personas para transformar su relación con sus pensamientos y emociones, facilitando el desarrollo de su máximo potencial hacia una vida con significado. A través de la Terapia Cognitivo Conductual (TCC) y un enfoque profundamente humanista, brindamos herramientas científicas que permiten al consultante convertirse en su propio terapeuta, logrando un equilibrio sostenible fuera del consultorio.
                        </p>
                    </div>
                    <div class="reveal about-stats-grid" aria-label="Datos destacados">
                        <div class="about-stat-card about-stat-card--light">
                            <div class="about-stat-card__num">2020</div>
                            <p class="about-stat-card__lbl">Fundación</p>
                        </div>
                        <div class="about-stat-card about-stat-card--dark">
                            <div class="about-stat-card__num">120+</div>
                            <p class="about-stat-card__lbl">Especialistas</p>
                        </div>
                        <div class="about-stat-card about-stat-card--dark">
                            <div class="about-stat-card__num">2.5K</div>
                            <p class="about-stat-card__lbl">Vidas transformadas</p>
                        </div>
                        <div class="about-stat-card about-stat-card--light">
                            <div class="about-stat-card__num">3</div>
                            <p class="about-stat-card__lbl">Países</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="about-vision-values" aria-labelledby="about-vision-heading">
                <div class="container">
                    <div class="reveal about-vision-card">
                        <h2 id="about-vision-heading" class="visually-hidden">Visión</h2>
                        <span class="tag-luxe about-vision-card__eyebrow">VISIÓN</span>
                        <p class="about-vision-card__body">Consolidarnos como el ecosistema de salud mental líder en México y el referente nacional en formación clínica especializada. Aspiramos a ser una red robusta que democratice el bienestar mediante contenido educativo de alta calidad y una comunidad de apoyo sólida, demostrando que la psicoterapia basada en evidencia, practicada con ética y disciplina, es la llave para transformar positivamente miles de historias de vida.</p>
                    </div>
                    <div class="reveal about-values-intro">
                        <span class="tag about-values-intro__tag">VALORES</span>
                    </div>
                    <div class="about-values-grid">
                        <article class="reveal about-value-card">
                            <h3 class="about-value-card__title">I. Calidad sobre cantidad <span class="about-value-card__subtitle">(Atención de excelencia)</span></h3>
                            <p class="about-value-card__text">Entendemos que la salud mental requiere tiempo y presencia absoluta. Limitamos el número de consultantes por especialista para garantizar que cada proceso reciba el rigor ético y la dedicación que merece. Aquí, el paciente es una prioridad, no un número.</p>
                        </article>
                        <article class="reveal about-value-card">
                            <h3 class="about-value-card__title">II. Superación y rigor académico <span class="about-value-card__subtitle">(Evolución constante)</span></h3>
                            <p class="about-value-card__text">La disciplina es el puente entre la meta y el logro. Nuestro equipo mantiene una formación de élite en instituciones de renombre mundial como el Instituto Beck, Instituto Gottman, IETPC y especializaciones en ACT y posgrados. La actualización constante no es opcional; es nuestra garantía de excelencia.</p>
                        </article>
                        <article class="reveal about-value-card">
                            <h3 class="about-value-card__title">III. Empatía flexible <span class="about-value-card__subtitle">(Humanismo colaborativo)</span></h3>
                            <p class="about-value-card__text">Creemos que el protocolo debe servir al humano, y no al revés. Trabajamos codo a codo con el consultante, priorizando el cuidado de la relación terapéutica y las necesidades emocionales individuales sobre la rigidez técnica. Ciencia y calidez caminan siempre de la mano.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section class="about-cta">
                <div class="container reveal">
                    <h2 class="about-cta__title">¿Listo para comenzar?</h2>
                    <p class="about-cta__lead">Tu proceso de transformación comienza con una sola decisión.</p>
                    <div class="about-cta__actions">
                        <button type="button" class="btn-gold about-cta__btn" onclick="Router.navigateTo('home')">Encontrar Especialista</button>
                        <button type="button" class="btn-gold about-cta__btn about-cta__btn--outline" onclick="Router.navigateTo('contact')">Contáctanos</button>
                    </div>
                </div>
            </section>
            </div>`;
        this.initObserver();
    },

    renderContact() {
        document.getElementById('app-root').innerHTML = `
            <!-- Hero compacto -->
            <section class="contact-hero" style="padding:12rem 0 8rem;background:linear-gradient(135deg,#5d1021 0%,#2a0a12 45%,#1a0509 100%);color:#fff;text-align:center;">
                <div class="container reveal">
                    <span style="font-size:0.7rem;letter-spacing:8px;text-transform:uppercase;color:var(--accent);font-weight:700;">ESTAMOS AQUÍ</span>
                    <h1 style="font-size:clamp(3rem,6vw,5.5rem);color:#fff;margin:2rem 0 1.5rem;font-family:'Playfair Display',serif;">Contáctanos</h1>
                    <p style="font-size:1.15rem;color:rgba(255,255,255,0.75);font-weight:300;max-width:500px;margin:0 auto;">Respondemos en menos de 24 horas hábiles.</p>
                </div>
            </section>

            <!-- Cuerpo principal -->
            <section style="padding:6rem 0 10rem;background:var(--bg-silk);">
                <div class="container contact-grid">

                    <!-- FORMULARIO -->
                    <div class="reveal contact-form-card">
                        <h2 style="font-size:clamp(1.8rem,3vw,2.8rem);margin-bottom:3rem;font-family:'Playfair Display',serif;">Envíanos un mensaje</h2>

                        <div class="contact-row-2">
                            <div class="contact-field">
                                <label class="contact-label">Tu Nombre</label>
                                <input type="text" id="ct-name" class="contact-input" placeholder="Nombre completo">
                            </div>
                            <div class="contact-field">
                                <label class="contact-label">Correo Electrónico</label>
                                <input type="email" id="ct-email" class="contact-input" placeholder="tu@correo.com">
                            </div>
                        </div>

                        <div class="contact-field">
                            <label class="contact-label">Tipo de Consulta</label>
                            <select id="ct-type" class="contact-input">
                                <option value="general">Consulta General</option>
                                <option value="psychologist">Quiero unirme como Especialista</option>
                                <option value="patient">Soy paciente y necesito orientación</option>
                                <option value="media">Prensa y Medios</option>
                                <option value="technical">Soporte Técnico</option>
                            </select>
                        </div>

                        <div class="contact-field">
                            <label class="contact-label">Asunto</label>
                            <input type="text" id="ct-subject" class="contact-input" placeholder="¿Sobre qué quieres hablar?">
                        </div>

                        <div class="contact-field">
                            <label class="contact-label">Tu Mensaje</label>
                            <textarea id="ct-message" class="contact-input contact-textarea" placeholder="Cuéntanos en qué podemos ayudarte..."></textarea>
                        </div>

                        <button id="ct-btn" class="btn-gold" style="width:100%;padding:1.6rem;font-size:1.1rem;border-radius:16px;margin-top:0.5rem;" onclick="Router.handleContact()">
                            Enviar Mensaje
                        </button>

                        <div id="ct-success" style="display:none;text-align:center;padding:3rem;background:rgba(194,154,91,0.08);border-radius:20px;margin-top:2rem;border:1px solid rgba(194,154,91,0.3);">
                            <div style="font-size:2.5rem;color:var(--accent);">✓</div>
                            <p style="margin-top:1rem;font-weight:600;color:var(--primary);">Mensaje enviado. ¡Te responderemos pronto!</p>
                        </div>
                    </div>

                    <!-- SIDEBAR INFO -->
                    <div class="reveal contact-sidebar">

                        <!-- Info de contacto -->
                        <div style="background:var(--primary);padding:3.5rem;border-radius:28px;color:white;margin-bottom:2.5rem;">
                            <h3 style="font-size:1.4rem;color:white;margin-bottom:2.5rem;font-family:'Playfair Display',serif;">Información de Contacto</h3>
                            <div style="display:flex;flex-direction:column;gap:2rem;">
                                <div style="display:flex;align-items:center;gap:1.5rem;">
                                    <div style="width:44px;height:44px;background:rgba(194,154,91,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;">✉</div>
                                    <div>
                                        <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:2px;opacity:0.5;margin-bottom:0.2rem;">Email</div>
                                        <a href="mailto:activamentecorreo2026@gmail.com" style="font-size:0.95rem;color:#fff;text-decoration:underline;text-underline-offset:3px;">activamentecorreo2026@gmail.com</a>
                                    </div>
                                </div>
                                <div style="display:flex;align-items:center;gap:1.5rem;">
                                    <div style="width:44px;height:44px;background:rgba(194,154,91,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;">🌎</div>
                                    <div>
                                        <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:2px;opacity:0.5;margin-bottom:0.2rem;">Presencia</div>
                                        <div style="font-size:0.95rem;">México</div>
                                    </div>
                                </div>
                                <div style="display:flex;align-items:center;gap:1.5rem;">
                                    <div style="width:44px;height:44px;background:rgba(194,154,91,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;">⚡</div>
                                    <div>
                                        <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:2px;opacity:0.5;margin-bottom:0.2rem;">Respuesta</div>
                                        <div style="font-size:0.95rem;">Menos de 24 hrs hábiles</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- FAQ -->
                        <div style="background:white;padding:3.5rem;border-radius:28px;box-shadow:0 8px 30px rgba(0,0,0,0.05);border:1px solid var(--border);">
                            <h4 style="font-size:1.2rem;margin-bottom:2rem;font-family:'Playfair Display',serif;">Preguntas frecuentes</h4>
                            <div style="display:flex;flex-direction:column;gap:1.2rem;">
                                <details style="background:var(--bg-silk);border-radius:16px;padding:1.5rem 2rem;cursor:pointer;">
                                    <summary style="font-weight:600;font-size:0.95rem;list-style:none;display:flex;justify-content:space-between;">
                                        ¿Cómo me registro como especialista? <span style="color:var(--accent);">+</span>
                                    </summary>
                                    <p style="font-size:0.88rem;color:var(--text-muted);line-height:1.8;margin-top:1rem;">Haz clic en "Unirme", selecciona Especialista y completa tu perfil. Lo revisaremos en 48 horas.</p>
                                </details>
                                <details style="background:var(--bg-silk);border-radius:16px;padding:1.5rem 2rem;cursor:pointer;">
                                    <summary style="font-weight:600;font-size:0.95rem;list-style:none;display:flex;justify-content:space-between;">
                                        ¿Los datos son confidenciales? <span style="color:var(--accent);">+</span>
                                    </summary>
                                    <p style="font-size:0.88rem;color:var(--text-muted);line-height:1.8;margin-top:1rem;">100%. Tu información está protegida con estándares de privacidad de grado clínico.</p>
                                </details>
                                <details style="background:var(--bg-silk);border-radius:16px;padding:1.5rem 2rem;cursor:pointer;">
                                    <summary style="font-weight:600;font-size:0.95rem;list-style:none;display:flex;justify-content:space-between;">
                                        ¿Cómo funciona el sistema de citas? <span style="color:var(--accent);">+</span>
                                    </summary>
                                    <p style="font-size:0.88rem;color:var(--text-muted);line-height:1.8;margin-top:1rem;">Agendas tu cita en el perfil del especialista y él te contacta para confirmarla.</p>
                                </details>
                            </div>
                        </div>
                    </div>

                </div>
            </section>`;
        this.initObserver();
    }
};

window.Router = {
    async navigateTo(view, id = null) {
        document.querySelectorAll('.zen-overlay').forEach(el => el.remove());
        const root = document.getElementById('app-root');
        root.style.opacity = '0';
        root.style.transform = 'translateY(20px)';
        root.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

        setTimeout(async () => {
            try {
                const role = window.__activamenteRole || '';
                let v = view;
                if (v === 'superadmin' && role !== 'superadmin') {
                    v = 'home';
                }
                if (v === 'dashboard') {
                    if (role === 'superadmin') v = 'superadmin';
                    else if (role === 'patient') v = 'patient-dashboard';
                }
                if (v === 'patient-dashboard') {
                    if (role === 'psychologist') v = 'dashboard';
                    else if (role === 'superadmin') v = 'superadmin';
                }
                if (v === 'forum' && role === 'patient') {
                    v = 'patient-dashboard';
                }
                console.log(`Router: Navigating to ${v}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (v === 'profile')                await UI.renderProfile(id);
                else if (v === 'forum')             await UI.renderForum();
                else if (v === 'superadmin')        await UI.renderSuperAdmin();
                else if (v === 'dashboard')         await UI.renderDashboard();
                else if (v === 'patient-dashboard') await UI.renderPatientDashboard();
                else if (v === 'testimonials')      this.renderTestimonialsSubmit();
                else if (v === 'login')             this.renderLogin();
                else if (v === 'register')          this.renderRegister();
                else if (v === 'about')             UI.renderAbout();
                else if (v === 'contact')           UI.renderContact();
                else                                await UI.renderHome();
            } catch (e) {
                console.error('Navigation failed:', e);
                root.innerHTML = `
                    <div style="padding: 8rem 2rem; text-align: center;">
                        <h2 style="font-family:'Playfair Display',serif; color: var(--primary); margin-bottom: 1rem;">No pudimos cargar esta sección</h2>
                        <p style="color: var(--text-muted); margin-bottom: 2rem;">Error: ${e.message}</p>
                        <button class="btn-gold" onclick="Router.navigateTo('home')">Volver al inicio</button>
                    </div>
                `;
            } finally {
                root.style.opacity = '1';
                root.style.transform = 'translateY(0)';
                if (typeof window.syncNavBar === 'function') {
                    requestAnimationFrame(() => window.syncNavBar());
                }
            }
        }, 600);
    },

    buildGoogleCalendarApptUrl(appt, eventTitle) {
        const date = appt.date;
        const timeStr = (appt.time || '09:00:00').slice(0, 8);
        const [y, mo, d] = date.split('-').map(Number);
        const tp = timeStr.split(':');
        const h = parseInt(tp[0] ?? 9, 10);
        const mi = parseInt(tp[1] ?? 0, 10);
        const se = parseInt(tp[2] ?? 0, 10);
        const start = new Date(y, mo - 1, d, h, mi, se);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        const fmt = (dt) => {
            const p = (n) => String(n).padStart(2, '0');
            return dt.getFullYear() + p(dt.getMonth() + 1) + p(dt.getDate()) + 'T' + p(dt.getHours()) + p(dt.getMinutes()) + '00';
        };
        const text = encodeURIComponent(eventTitle || 'Cita Activamente');
        const details = encodeURIComponent(`Modalidad: ${appt.modality || 'online'}`);
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${fmt(start)}/${fmt(end)}&details=${details}`;
    },

    handleSearch() {
        const topic = document.getElementById('s-topic');
        const query = (topic && topic.value) ? topic.value.trim() : '';
        if (!query) {
            alert('Por favor elige un tema en el menú para encontrar especialistas afines.');
            return;
        }
        UI.fetchAndRenderList(query);
        document.getElementById('filter-bar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    async handleBooking(psycId) {
        const data = {
            psychologist_id: psycId,
            name:     document.getElementById('b-name').value,
            email:    document.getElementById('b-email').value,
            phone:    document.getElementById('b-phone').value,
            modality: document.getElementById('b-modality')?.value || 'online',
            date:     document.getElementById('b-date').value,
            time:     document.getElementById('b-time').value
        };
        if (!data.name || !data.email) return alert('Por favor llena los datos obligatorios.');

        const res = await apiFetch('/api/data?action=book_appointment', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        let result;
        try {
            result = await res.json();
        } catch {
            alert('El servidor no respondió correctamente. Comprueba que estés en http://localhost/activamente/');
            return;
        }
        if (result.success) {
            document.getElementById('booking-form').innerHTML = `
                <div style="text-align: center; padding: 4rem 0;">
                    <div style="font-size: 5rem; color: var(--accent);">✓</div>
                    <h4 style="margin-top: 2rem;">¡Solicitud Enviada!</h4>
                    <p style="opacity: 0.6; font-size: 0.9rem;">El especialista revisará tu solicitud y te contactará a la brevedad.</p>
                </div>`;
        } else {
            alert(result.error || 'No se pudo registrar la cita. Revisa fecha, hora y datos.');
        }
    },

    async handlePostBlog() {
        const data = {
            title: document.getElementById('nb-title').value,
            type: document.getElementById('nb-type').value,
            media_url: document.getElementById('nb-media').value,
            content: document.getElementById('nb-content').value
        };
        const res = await apiFetch('/api/data?action=post_blog', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            alert('Publicado con éxito en tu bitácora.');
            this.navigateTo('dashboard');
        }
    },


    async postToForum() {
        const titleEl = document.getElementById('f-title');
        const contentEl = document.getElementById('f-content');
        const anonEl = document.getElementById('f-anon');
        if (!titleEl || !contentEl || !anonEl) return;
        const title = titleEl.value.trim();
        const content = contentEl.value.trim();
        const isAnon = anonEl.checked;
        if (!title || !content) {
            alert('Escribe un título y un mensaje antes de publicar.');
            return;
        }
        if (content.length < 10) {
            alert('El mensaje es muy corto; añade un poco más de contexto (mínimo unas dos frases).');
            return;
        }

        const res = await apiFetch('/api/data?action=post_forum', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                author_email: isAnon ? 'Anónimo' : 'Miembro Conectado',
                title,
                content,
                is_anonymous: isAnon
            })
        });
        let data = {};
        try {
            data = await res.json();
        } catch (e) {
            alert('No se pudo leer la respuesta del servidor.');
            return;
        }
        if (data.success) {
            this.navigateTo('forum');
        } else {
            alert(data.error || 'No se pudo publicar. Inténtalo de nuevo.');
        }
    },

    renderLogin() {
        document.getElementById('app-root').innerHTML = `
            <div class="container" style="padding: clamp(8rem, 20vw, 20rem) 1rem; display: flex; justify-content: center;">
                <div class="reveal page-auth-card" style="background: white; padding: clamp(2rem, 5vw, 8rem); border-radius: clamp(30px, 5vw, 80px); box-shadow: var(--shadow-luxe); max-width: 650px; width:100%; text-align: center; border: 1px solid #f0f0f0;">
                    <span class="tag">ACCESO RESTRINGIDO</span>
                    <h2 style="font-size: clamp(2rem, 6vw, 4rem); margin: clamp(1rem, 2vw, 2rem) 0;">Bienvenido de vuelta</h2>
                    <p style="color: var(--text-muted); margin-bottom: clamp(2rem, 4vw, 5rem); font-size: clamp(0.9rem, 2vw, 1.25rem); font-weight: 300;">Pacientes, especialistas y equipo interno: usa el correo con el que te registraste.</p>
                    <input type="email" id="l-email" placeholder="Correo electrónico" style="width:100%; padding: clamp(1rem, 2vw, 2rem); border-radius: clamp(15px, 2vw, 30px); border: 1px solid var(--border); margin-bottom: 2rem; outline: none; font-size: clamp(0.95rem, 1.8vw, 1.3rem); background: #fafafa;">
                    <input type="password" id="l-pass" placeholder="Contraseña" style="width:100%; padding: clamp(1rem, 2vw, 2rem); border-radius: clamp(15px, 2vw, 30px); border: 1px solid var(--border); margin-bottom: clamp(2rem, 3vw, 4rem); outline: none; font-size: clamp(0.95rem, 1.8vw, 1.3rem); background: #fafafa;">
                    <button class="btn-gold" style="width: 100%; padding: clamp(1rem, 2vw, 2rem); font-size: clamp(0.95rem, 1.8vw, 1.4rem);" onclick="Router.handleLogin()">Entrar al Sistema</button>
                    <p style="margin-top: clamp(2rem, 3vw, 4rem);">¿Aún no tienes cuenta? <a href="#" onclick="Router.navigateTo('register')" style="color: var(--primary); font-weight: 600;">Regístrate como paciente o especialista</a></p>
                </div>
            </div>`;
        UI.initObserver();
    },

    async handleLogin() {
        const email = document.getElementById('l-email').value;
        const password = document.getElementById('l-pass').value;
        const res = await apiFetch('/api/auth?action=login', { method: 'POST', body: JSON.stringify({ email, password }) });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('activamente_token', data.token);
            location.reload();
        } else alert(data.error);
    },

    renderRegister() {
        document.getElementById('app-root').innerHTML = `
            <div class="container" style="padding: clamp(8rem, 20vw, 18rem) 1rem; display: flex; justify-content: center;">
                <div class="reveal page-auth-card" style="background: white; padding: clamp(2rem, 5vw, 8rem); border-radius: clamp(30px, 5vw, 80px); box-shadow: var(--shadow-luxe); max-width: 700px; width:100%; text-align: center; border: 1px solid #f0f0f0;">
                    <span class="tag">ACCESO AL SANTUARIO</span>
                    <h2 style="font-size: clamp(2rem, 6vw, 4rem); margin: clamp(1rem, 2vw, 2rem) 0;">Únete</h2>

                    <div class="reg-tabs-mobile" style="display:flex; background:#f5f5f5; border-radius:clamp(20px, 3vw, 50px); padding:0.5rem; margin-bottom:clamp(2rem, 3vw, 4rem); gap:0.5rem; flex-wrap:wrap;">
                        <button type="button" class="reg-tab reg-tab--active" data-role="patient" onclick="UI.switchRegTab(this)" style="flex:1;padding:clamp(0.8rem, 1.5vw, 1.5rem);border-radius:clamp(15px, 2.5vw, 40px);border:none;font-weight:700;font-size:clamp(0.8rem, 1.5vw, 1.1rem);cursor:pointer;background:white;color:var(--primary);box-shadow:0 5px 15px rgba(0,0,0,0.08);transition:all 0.3s;font-family:inherit;">
                            Soy Paciente
                        </button>
                        <button type="button" class="reg-tab" data-role="psychologist" onclick="UI.switchRegTab(this)" style="flex:1;padding:clamp(0.8rem, 1.5vw, 1.5rem);border-radius:clamp(15px, 2.5vw, 40px);border:none;font-weight:700;font-size:clamp(0.8rem, 1.5vw, 1.1rem);cursor:pointer;background:transparent;color:var(--text-muted);transition:all 0.3s;font-family:inherit;">
                            Soy Especialista
                        </button>
                    </div>

                    <div id="reg-patient-desc" style="margin-bottom:clamp(1.5rem, 2.5vw, 3rem);">
                        <p style="color:var(--text-muted);font-size:clamp(0.85rem, 1.5vw, 1.2rem);font-weight:300;">Cuenta de <strong>paciente</strong>: citas, reseñas y tu portal. El rol <strong>superadmin</strong> es interno y no se registra aquí.</p>
                    </div>
                    <div id="reg-psy-desc" style="margin-bottom:clamp(1.5rem, 2.5vw, 3rem);display:none;">
                        <p style="color:var(--text-muted);font-size:clamp(0.85rem, 1.5vw, 1.2rem);font-weight:300;">Cuenta de <strong>especialista</strong>: perfil público, citas, foro y bóveda de pacientes.</p>
                    </div>

                    <input type="text" id="r-name" placeholder="Nombre completo" style="width:100%;padding:clamp(1rem, 2vw, 2rem);border-radius:clamp(15px, 2vw, 30px);border:1px solid var(--border);margin-bottom:2rem;outline:none;font-size:clamp(0.95rem, 1.8vw, 1.3rem);background:#fafafa;font-family:inherit;">
                    <input type="email" id="r-email" placeholder="Correo electrónico" style="width:100%;padding:clamp(1rem, 2vw, 2rem);border-radius:clamp(15px, 2vw, 30px);border:1px solid var(--border);margin-bottom:2rem;outline:none;font-size:clamp(0.95rem, 1.8vw, 1.3rem);background:#fafafa;font-family:inherit;">
                    <input type="password" id="r-pass" placeholder="Contraseña" style="width:100%;padding:clamp(1rem, 2vw, 2rem);border-radius:clamp(15px, 2vw, 30px);border:1px solid var(--border);margin-bottom:clamp(2rem, 3vw, 4rem);outline:none;font-size:clamp(0.95rem, 1.8vw, 1.3rem);background:#fafafa;font-family:inherit;">
                    <button class="btn-gold" style="width:100%;padding:clamp(1rem, 2vw, 2rem);font-size:clamp(0.95rem, 1.8vw, 1.4rem);" onclick="Router.handleRegister()">Crear Cuenta</button>
                    <p style="margin-top:clamp(2rem, 3vw, 4rem);color:var(--text-muted);">¿Ya tienes cuenta? <a href="#" onclick="Router.navigateTo('login')" style="color:var(--primary);font-weight:600;">Inicia sesión</a></p>
                </div>
            </div>`;
        UI.initObserver();
    },

    async handleRegister() {
        const name     = document.getElementById('r-name').value;
        const email    = document.getElementById('r-email').value;
        const password = document.getElementById('r-pass').value;
        const role     = document.querySelector('.reg-tab--active')?.dataset.role || 'patient';
        if (!name || !email || !password) return alert('Por favor completa todos los campos.');
        const res = await apiFetch('/api/auth?action=register', { method: 'POST', body: JSON.stringify({ name, email, password, role }) });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('activamente_token', data.token);
            location.reload();
        } else alert(data.error);
    },

    async handleLogout() {
        localStorage.removeItem('activamente_token');
        location.reload();
    },

    async handleSaveProfile() {
        const formData = new FormData();
        formData.append('name', document.getElementById('d-name').value);
        formData.append('specialty', document.getElementById('d-specialty').value);
        formData.append('bio', document.getElementById('d-bio').value);
        formData.append('education', document.getElementById('d-education').value);
        formData.append('approach', document.getElementById('d-approach').value);
        formData.append('price', document.getElementById('d-price').value);
        formData.append('image', document.getElementById('d-image').value);

        const fileInput = document.getElementById('d-file');
        if (fileInput && fileInput.files[0]) {
            formData.append('image_file', fileInput.files[0]);
        }

        const audioInput = document.getElementById('d-audio');
        if (audioInput && audioInput.files[0]) {
            formData.append('audio_file', audioInput.files[0]);
        }

        formData.append('whatsapp_number', document.getElementById('d-whatsapp').value);
        formData.append('profile_vibe', document.getElementById('d-vibe').value);
        formData.append('instagram', document.getElementById('d-insta').value);
        formData.append('linkedin', document.getElementById('d-linkedin').value);

        const res = await apiFetch('/api/upload?action=update_profile', {
            method: 'POST',
            body: formData
        });
        const result = await res.json();
        if (result.success) {
            alert('Perfil maestro actualizado con éxito.');
            location.reload();
        }
    },

    async handleAdminPostNews() {
        const data = {
            title: document.getElementById('an-title').value,
            image_url: document.getElementById('an-image').value,
            content: document.getElementById('an-content').value
        };
        const res = await apiFetch('/api/data?action=post_news', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            alert('Noticia publicada con éxito.');
            this.navigateTo('home');
        } else alert(result.error);
    },

    async handleAddJourneyStep() {
        const title = document.getElementById('nj-title').value;
        const description = document.getElementById('nj-desc').value;
        if (!title) return;

        const res = await apiFetch('/api/data?action=post_journey', {
            method: 'POST',
            body: JSON.stringify({ title, description })
        });
        const result = await res.json();
        if (result.success) UI.renderDashboard();
    },

    async handleDeleteJourney(id) {
        if (!confirm('¿Eliminar este hito del camino?')) return;
        await apiFetch(`/api/data?action=delete_journey&id=${id}`);
        UI.renderDashboard();
    },

    async handleCreateTest() {
        const title = document.getElementById('nt-title').value;
        const description = document.getElementById('nt-desc').value;
        if (!title) return;

        const res = await apiFetch('/api/data?action=create_test', {
            method: 'POST',
            body: JSON.stringify({ title, description, questions: [] }) // For now, basic test creation
        });
        const result = await res.json();
        if (result.success) UI.renderDashboard();
    },

    async handleVaultUpload() {
        const fileInput = document.getElementById('v-upload');
        if (!fileInput.files[0]) return;

        const formData = new FormData();
        formData.append('doc_file', fileInput.files[0]);

        const res = await apiFetch('/api/upload?action=upload_vault_doc', {
            method: 'POST',
            body: formData
        });
        const result = await res.json();
        if (result.success) UI.renderDashboard();
    },

    renderTestimonialsSubmit() {
        document.getElementById('app-root').innerHTML = `
            <div class="container" style="padding: clamp(8rem, 20vw, 20rem) 1rem; display: flex; justify-content: center;">
                <div class="reveal" style="background: white; padding: clamp(2rem, 5vw, 8rem); border-radius: clamp(30px, 5vw, 80px); box-shadow: var(--shadow-luxe); max-width: 800px; width:100%; text-align: center; border: 1px solid #f0f0f0;">
                    <span class="tag">TU EXPERIENCIA</span>
                    <h2 style="font-size: clamp(2rem, 6vw, 4rem); margin: clamp(1rem, 2vw, 2rem) 0;">Déjanos tu Testimonio</h2>
                    <p style="color: var(--text-muted); margin-bottom: clamp(2rem, 4vw, 5rem); font-size: clamp(0.9rem, 2vw, 1.25rem); font-weight: 300;">Comparte cómo ha sido tu camino en Activamente.</p>

                    <div class="star-rating-input" style="margin-bottom: clamp(2rem, 3vw, 4rem); display: flex; justify-content: center;">
                        <input type="radio" id="st5" name="stars" value="5" checked><label for="st5">★</label>
                        <input type="radio" id="st4" name="stars" value="4"><label for="st4">★</label>
                        <input type="radio" id="st3" name="stars" value="3"><label for="st3">★</label>
                        <input type="radio" id="st2" name="stars" value="2"><label for="st2">★</label>
                        <input type="radio" id="st1" name="stars" value="1"><label for="st1">★</label>
                    </div>

                    <input type="text" id="t-name" placeholder="Tu Nombre (o Anónimo)" style="width:100%; padding: clamp(1rem, 2vw, 2rem); border-radius: clamp(15px, 2vw, 30px); border: 1px solid var(--border); margin-bottom: 2rem; outline: none; font-size: clamp(0.95rem, 1.8vw, 1.3rem); background: #fafafa;">
                    <textarea id="t-content" placeholder="Escribe tu mensaje aquí..." style="width:100%; padding: clamp(1rem, 2vw, 2rem); border-radius: clamp(15px, 2vw, 30px); border: 1px solid var(--border); margin-bottom: clamp(2rem, 3vw, 4rem); outline: none; font-size: clamp(0.95rem, 1.8vw, 1.3rem); background: #fafafa; height: clamp(120px, 20vw, 200px);"></textarea>

                    <button class="btn-gold" style="width: 100%; padding: clamp(1rem, 2vw, 2.2rem); font-size: clamp(0.95rem, 1.8vw, 1.4rem);" onclick="Router.handlePostSiteTestimonial()">Enviar testimonio</button>
                </div>
            </div>`;
        UI.initObserver();
    },

    async handleContact() {
        const data = {
            name:    document.getElementById('ct-name').value,
            email:   document.getElementById('ct-email').value,
            type:    document.getElementById('ct-type').value,
            subject: document.getElementById('ct-subject').value,
            message: document.getElementById('ct-message').value
        };
        if (!data.name || !data.email || !data.message) return alert('Por favor completa los campos obligatorios.');
        const res    = await apiFetch('/api/data?action=post_contact', { method: 'POST', body: JSON.stringify(data) });
        const result = await res.json();
        if (result.success) {
            document.getElementById('ct-success').style.display = 'block';
            document.getElementById('ct-btn').style.display = 'none';
        } else {
            alert(result.error || 'Error al enviar el mensaje.');
        }
    },

    async updateAppointmentStatus(id, status) {
        const res  = await apiFetch(`/api/data?action=confirm_appointment&id=${id}&status=${status}`);
        const data = await res.json();
        if (data.success) UI.renderDashboard();
    },

    async handlePostSiteTestimonial() {
        const starEl = document.querySelector('input[name="stars"]:checked');
        if (!starEl) {
            alert('Selecciona una calificación con estrellas.');
            return;
        }
        const stars = starEl.value;
        const data = {
            name: document.getElementById('t-name').value || 'Anónimo',
            content: document.getElementById('t-content').value,
            stars: stars
        };
        const res = await apiFetch('/api/data?action=post_site_testimonial', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            alert('¡Gracias por tu testimonio!');
            this.navigateTo('home');
        }
    }
};

async function init() {
    // If user opens the HTML file directly, force localhost mode (PHP + API required)
    if (window.location.protocol === 'file:') {
        const target = 'http://localhost/activamente/';
        window.location.replace(target);
        return;
    }

    console.log("Activamente Lux Engine: Initializing...");
    const appRoot = document.getElementById('app-root');
    if (!appRoot) {
        console.error("CRITICAL: #app-root not found in DOM");
        return;
    }

    try {
        const res = await apiFetch('/api/auth?action=status');
        let data = {};
        try {
            data = await res.json();
        } catch (parseErr) {
            throw new Error('No se pudo leer la respuesta del servidor. Comprueba la conexión a Internet o inténtalo más tarde.');
        }

        if (data.error) {
            appRoot.innerHTML = `
            <div style="padding: clamp(4rem, 12vw, 10rem) 1.5rem; text-align: center; font-family: 'Inter', sans-serif; max-width: 36rem; margin: 0 auto;">
                <h2 style="font-family:'Playfair Display',serif; color: var(--primary, #5d1021); margin-bottom: 1rem; font-size: clamp(1.5rem, 4vw, 2rem);">No pudimos iniciar Activamente</h2>
                <p style="color: var(--text-muted, #71717a); line-height: 1.65; margin-bottom: 2rem;">${escapeHtml(String(data.error))}</p>
                <button type="button" onclick="location.reload()" class="btn-gold" style="padding: 1rem 2.5rem; border: none; cursor: pointer;">Recargar página</button>
            </div>`;
            return;
        }

        if (!res.ok) {
            throw new Error(`El servidor respondió con el código ${res.status}.`);
        }

        const nav = document.getElementById('nav-links');

        window.__activamenteRole = data.logged_in ? (data.role || '') : null;

        if (nav) {
            if (data.logged_in) {
                const role = data.role || '';
                const isPatient = role === 'patient';
                const isPsychologist = role === 'psychologist';
                const isSuperAdmin = role === 'superadmin';
                const commonNav = `
                    <a href="javascript:void(0)" onclick="Router.navigateTo('home')">Inicio</a>
                    <a href="javascript:void(0)" onclick="Router.navigateTo('about')">Nosotros</a>
                    <a href="javascript:void(0)" onclick="Router.navigateTo('contact')">Contacto</a>`;
                if (isSuperAdmin) {
                    nav.innerHTML = commonNav + `
                    <a href="javascript:void(0)" onclick="Router.navigateTo('superadmin')" style="color:var(--accent);font-weight:700;">Panel Superadmin</a>
                    <a href="javascript:void(0)" onclick="Router.handleLogout()">Salir</a>`;
                } else if (isPatient) {
                    nav.innerHTML = commonNav + `
                    <a href="javascript:void(0)" onclick="Router.navigateTo('patient-dashboard')" style="color:var(--accent);font-weight:700;">Mi portal (paciente)</a>
                    <a href="javascript:void(0)" onclick="Router.handleLogout()">Salir</a>`;
                } else if (isPsychologist) {
                    nav.innerHTML = commonNav + `
                    <a href="javascript:void(0)" onclick="Router.navigateTo('forum')">El Espacio</a>
                    <a href="javascript:void(0)" onclick="Router.navigateTo('dashboard')" style="color:var(--accent);font-weight:700;">Panel especialista</a>
                    <a href="javascript:void(0)" onclick="Router.handleLogout()">Salir</a>`;
                } else {
                    nav.innerHTML = commonNav + `
                    <a href="javascript:void(0)" onclick="Router.navigateTo('home')" style="color:var(--accent);font-weight:700;">Mi cuenta</a>
                    <a href="javascript:void(0)" onclick="Router.handleLogout()">Salir</a>`;
                }
            } else {
                nav.innerHTML = `
                    <a href="javascript:void(0)" onclick="Router.navigateTo('home')">Inicio</a>
                    <a href="javascript:void(0)" onclick="Router.navigateTo('forum')">El Espacio</a>
                    <a href="javascript:void(0)" onclick="Router.navigateTo('about')">Nosotros</a>
                    <a href="javascript:void(0)" onclick="Router.navigateTo('contact')">Contacto</a>
                    <a href="javascript:void(0)" onclick="Router.navigateTo('login')">Ingresar</a>
                    <a href="javascript:void(0)" onclick="Router.navigateTo('register')" class="btn-gold" style="padding:1rem 3rem;">Unirme</a>
                `;
            }
        }

        await UI.renderHome();
        UI.startFloatingTestimonials();
    } catch (e) {
        console.error("Initialization failed:", e);
        appRoot.innerHTML = `
            <div style="padding: clamp(4rem, 12vw, 10rem) 1.5rem; text-align: center; font-family: 'Inter', sans-serif; max-width: 36rem; margin: 0 auto;">
                <h2 style="font-family:'Playfair Display',serif; color: var(--primary, #5d1021); margin-bottom: 1rem;">No pudimos iniciar Activamente</h2>
                <p style="color: var(--text-muted, #71717a); line-height: 1.65; margin-bottom: 1.5rem;">Hubo un inconveniente al conectar con el servidor.</p>
                <div style="padding: 1rem 1.25rem; background: #f4f4f5; border-radius: 12px; font-size: 0.85rem; color: #52525b; text-align: left;">
                    ${escapeHtml(e.message || 'Error desconocido')}
                </div>
                <button type="button" onclick="location.reload()" class="btn-gold" style="margin-top: 2rem; padding: 1rem 2.5rem; border: none; cursor: pointer;">Intentar de nuevo</button>
            </div>`;
    }
}

init();
