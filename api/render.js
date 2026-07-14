// /api/render - SSR entry point: always serves SEO-friendly content with SPA shell
// The SPA (app.js) replaces #app-root content when it loads
const fs = require('fs');
const path = require('path');
const { query } = require('../lib/db');

const SITE_URL = 'https://activamente.vercel.app';
let htmlTemplate = null;

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function starsHtml(rating) {
    const n = Math.round(parseFloat(rating) || 0);
    return '<span style="color:#c29a5b;">' + '★'.repeat(Math.min(5, n)) + '☆'.repeat(Math.max(0, 5 - n)) + '</span>';
}

function loadTemplate() {
    if (htmlTemplate) return htmlTemplate;
    const htmlPath = path.join(process.cwd(), 'private', 'template.html');
    htmlTemplate = fs.readFileSync(htmlPath, 'utf-8');
    return htmlTemplate;
}

/**
 * Injects SEO metadata + content into the SPA shell HTML template.
 * Strips the loading screen entirely so Googlebot sees real content immediately.
 */
function injectSEO(html, seo) {
    const { title, description, canonical } = seo;

    // Strip the loading screen ENTIRELY — remove everything from <div id="loading"> to the <nav> tag
    // (simple regex would break on nested divs, so we target the nav tag that follows)
    html = html.replace(
        /<div id="loading"[^>]*>[\s\S]*?<nav/,
        '<nav'
    );

    // Replace <title>
    html = html.replace(/(<title>)[^<]*(<\/title>)/, '$1' + escapeHtml(title) + '$2');

    // Replace meta description
    html = html.replace(/(<meta name="description" content=")[^"]*(")/, '$1' + escapeHtml(description) + '$2');

    // Replace OG tags
    html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, '$1' + escapeHtml(title) + '$2');
    html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, '$1' + escapeHtml(description) + '$2');
    html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, '$1' + canonical + '$2');

    // Replace Twitter tags
    html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, '$1' + escapeHtml(title) + '$2');
    html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, '$1' + escapeHtml(description) + '$2');

    // Replace canonical
    html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, '$1' + canonical + '$2');

    // Replace content inside <main id="app-root">
    const startMarker = '<main id="app-root">';
    const endMarker = '</main>';
    const startIdx = html.indexOf(startMarker);
    const endIdx = html.indexOf(endMarker, startIdx);
    if (startIdx !== -1 && endIdx !== -1) {
        const before = html.substring(0, startIdx + startMarker.length);
        const after = html.substring(endIdx);
        html = before + '\n        ' + seo.content + '\n    ' + after;
    }

    return html;
}

// ====== PAGE BUILDERS ======

function homePage() {
    return {
        title: 'Activamente · Salud mental y bienestar · Psicólogos en México',
        description: 'Activamente es un espacio de excelencia clínica y calidez humana para la salud mental en México. Conectamos con psicólogos especializados en ansiedad, estrés, depresión, terapia de pareja y más. Terapia online y presencial.',
        canonical: SITE_URL + '/',
        content: `
<section style="padding: 4rem 2rem; max-width: 960px; margin: 0 auto; font-family: 'Inter', sans-serif; line-height: 1.8;">
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2.5rem; margin-bottom: 0.5rem;">Activamente · Salud Mental y Bienestar</h1>
    <p style="font-size: 1.3rem; color: #c29a5b; font-weight: 600; margin-bottom: 1.5rem;">Expertos comprometidos con tu bienestar emocional en México</p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 1.5rem;">En Activamente creamos un espacio de excelencia clínica y calidez humana donde psicólogos especializados te acompañan en tu camino hacia el equilibrio emocional. Ofrecemos terapia para ansiedad, manejo del estrés, depresión, relaciones de pareja, duelo, autoestima y más, tanto en modalidad online como presencial en México.</p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 2rem;">Nuestro equipo de terapeutas certificados combina experiencia clínica con un trato cercano y personalizado, adaptando cada proceso terapéutico a tus necesidades específicas. Creemos que la salud mental es el cimiento de una vida plena y trabajamos para hacerla accesible a todos.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Áreas de atención</h2>
    <ul style="margin-bottom: 2rem; color: #333;">
        <li><strong>Ansiedad:</strong> Aprende a gestionar la ansiedad con herramientas basadas en terapia cognitivo-conductual y mindfulness.</li>
        <li><strong>Estrés:</strong> Técnicas para reducir el estrés laboral, familiar y personal con acompañamiento profesional.</li>
        <li><strong>Depresión:</strong> Apoyo profesional para superar la depresión y recuperar tu bienestar emocional.</li>
        <li><strong>Relaciones de pareja:</strong> Terapia de pareja para fortalecer la comunicación y resolver conflictos.</li>
        <li><strong>Duelo y pérdidas:</strong> Acompañamiento sensible en procesos de duelo y adaptación al cambio.</li>
        <li><strong>Autoestima:</strong> Trabaja en tu autoconcepto y desarrolla una relación más saludable contigo mismo.</li>
        <li><strong>Adolescentes:</strong> Terapia especializada para jóvenes que enfrentan los desafíos de la adolescencia.</li>
        <li><strong>Trauma:</strong> Procesamiento y sanación de experiencias traumáticas con profesionales capacitados.</li>
    </ul>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Modalidades de terapia</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 1rem;">Ofrecemos terapia online y presencial, adaptándonos a tu estilo de vida y necesidades. La terapia online te permite acceder a atención profesional desde la comodidad de tu hogar, mientras que la modalidad presencial está disponible en nuestras ubicaciones en México.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Nuestros psicólogos</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 1rem;">Contamos con un equipo de psicólogos y terapeutas certificados con experiencia en diversas corrientes terapéuticas: terapia cognitivo-conductual, terapia humanista, terapia sistémica y más. Cada especialista es seleccionado por su excelencia clínica y su compromiso con el bienestar de sus pacientes.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Foro comunitario "El Espacio"</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 2rem;">Participa en nuestro foro comunitario donde pacientes y especialistas comparten experiencias, reflexiones y aprendizajes sobre salud mental en un ambiente respetuoso y de apoyo mutuo.</p>

    <div style="margin: 2.5rem 0; display: flex; gap: 1.5rem; flex-wrap: wrap;">
        <a href="/especialistas" style="display: inline-block; padding: 1rem 2.5rem; background: #5d1021; color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 1.1rem;">Encuentra tu especialista</a>
        <a href="/nosotros" style="display: inline-block; padding: 1rem 2.5rem; border: 2px solid #c29a5b; color: #5d1021; text-decoration: none; border-radius: 50px; font-weight: 600;">Conoce más sobre nosotros</a>
        <a href="/contacto" style="display: inline-block; padding: 1rem 2.5rem; border: 2px solid #5d1021; color: #5d1021; text-decoration: none; border-radius: 50px; font-weight: 600;">Contáctanos</a>
    </div>

    <div style="margin-top: 3rem; padding: 2rem; background: #fdfbf7; border-radius: 16px; border: 1px solid #e0d5c7;">
        <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.3rem; margin-bottom: 1rem;">¿Eres psicólogo?</h2>
        <p style="font-size: 1.1rem; color: #333;">Si eres profesional de la salud mental y compartes nuestro compromiso con la excelencia clínica y el trato humano, te invitamos a formar parte de nuestro equipo de especialistas.</p>
        <p style="margin-top: 1rem;"><a href="/registro" style="color: #5d1021; font-weight: 600;">Regístrate como especialista &rarr;</a></p>
    </div>
</section>`
    };
}

function aboutPage() {
    return {
        title: 'Nosotros · Activamente · Quiénes somos',
        description: 'Conoce la historia, misión y valores de Activamente. Un ecosistema de salud mental en México con psicólogos certificados y atención personalizada.',
        canonical: SITE_URL + '/nosotros',
        content: `
<section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; font-family: 'Inter', sans-serif; line-height: 1.8;">
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2.2rem;">Nosotros &middot; Activamente</h1>
    <p style="font-size: 1.1rem; color: #333; margin-top: 1.5rem;">En Activamente ofrecemos un espacio de excelencia clínica y calidez humana para la salud mental. Nuestra misión es empoderar a las personas para transformar su relación con sus pensamientos y emociones a través de terapia profesional y acompañamiento especializado.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Nuestra misión</h2>
    <p style="font-size: 1.1rem; color: #333;">Hacer accesible la salud mental de calidad en México, conectando a pacientes con psicólogos certificados que ofrecen un trato humano, ético y profesional. Creemos que el bienestar emocional no debe ser un privilegio, sino un derecho al alcance de todos.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Nuestra visión</h2>
    <p style="font-size: 1.1rem; color: #333;">Ser la plataforma líder de salud mental en México, reconocida por la calidad de nuestros especialistas, la calidez de nuestro servicio y nuestro compromiso con la transformación positiva de las personas.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Nuestros valores</h2>
    <ul style="color: #333; margin-bottom: 1.5rem;">
        <li><strong>Excelencia clínica:</strong> Todos nuestros psicólogos son profesionales certificados con formación continua.</li>
        <li><strong>Calidez humana:</strong> Creemos en la terapia como un espacio seguro, libre de juicio y lleno de empatía.</li>
        <li><strong>Accesibilidad:</strong> Ofrecemos terapia online y presencial con precios justos y transparentes.</li>
        <li><strong>Confidencialidad:</strong> La privacidad de nuestros pacientes es sagrada. Todos los datos se manejan con estricta seguridad.</li>
        <li><strong>Compromiso social:</strong> Trabajamos para reducir el estigma alrededor de la salud mental en México.</li>
    </ul>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Nuestros especialistas</h2>
    <p style="font-size: 1.1rem; color: #333;">Contamos con psicólogos especializados en diversas áreas: terapia cognitivo-conductual, terapia humanista, terapia sistémica, psicoanálisis y más. Cada profesional es seleccionado rigurosamente por su experiencia clínica, formación académica y compromiso con el paciente. Trabajamos con adolescentes, adultos, parejas y familias.</p>
    <p style="margin-top: 1rem;"><a href="/especialistas" style="color: #5d1021; font-weight: 600;">Conoce a nuestro equipo de especialistas &rarr;</a></p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">¿Por qué elegir Activamente?</h2>
    <p style="font-size: 1.1rem; color: #333;">Porque combinamos la excelencia clínica con un trato humano y cercano. No solo te conectamos con un psicólogo, te acompañamos en todo tu proceso de bienestar emocional. Cada terapeuta en nuestra plataforma comparte nuestro compromiso con la calidad, la ética y la transformación personal.</p>
</section>`
    };
}

function contactPage() {
    return {
        title: 'Contacto · Activamente · Atención a pacientes',
        description: 'Contacta con Activamente. Estamos aquí para ayudarte. Respondemos en menos de 24 horas hábiles. Terapia online y presencial en México.',
        canonical: SITE_URL + '/contacto',
        content: `
<section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; font-family: 'Inter', sans-serif; line-height: 1.8;">
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2.2rem;">Contacto &middot; Activamente</h1>
    <p style="font-size: 1.1rem; color: #333; margin-top: 1.5rem;">Estamos aquí para ayudarte a encontrar el apoyo que necesitas. Si tienes preguntas sobre nuestros servicios de terapia, deseas agendar una cita o necesitas más información sobre nuestros especialistas, no dudes en contactarnos.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Información de contacto</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 0.5rem;"><strong>Correo electrónico:</strong> <a href="mailto:activamentecorreo2026@gmail.com" style="color: #5d1021;">activamentecorreo2026@gmail.com</a></p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 0.5rem;"><strong>Teléfono:</strong> +52 55 8000 4851</p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 2rem;"><strong>Horario de atención:</strong> Lunes a viernes de 9:00 a 18:00 horas (horario CDMX)</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">¿Cómo funcionan nuestras terapias?</h2>
    <p style="font-size: 1.1rem; color: #333;">Ofrecemos terapia psicológica online y presencial en México. El proceso es simple: elige al especialista que mejor se adapte a tus necesidades, agenda una cita y comienza tu camino hacia el bienestar emocional. Respondemos a todas las consultas en menos de 24 horas hábiles.</p>

    <ul style="color: #333; margin-bottom: 2rem;">
        <li><strong>Terapia online:</strong> Sesiones por videollamada desde la comodidad de tu hogar.</li>
        <li><strong>Terapia presencial:</strong> Atención en nuestras ubicaciones en México.</li>
        <li><strong>Primera sesión:</strong> Conoce a tu terapeuta y define tus objetivos terapéuticos.</li>
    </ul>

    <div style="margin-top: 2rem;">
        <a href="/especialistas" style="display: inline-block; padding: 1rem 2.5rem; background: #5d1021; color: white; text-decoration: none; border-radius: 50px; font-weight: 600;">Ver especialistas disponibles</a>
    </div>

    <p style="font-size: 1.1rem; color: #333; margin-top: 2rem;">Si eres psicólogo y estás interesado en formar parte de nuestro equipo, escríbenos a <a href="mailto:activamentecorreo2026@gmail.com" style="color: #5d1021;">activamentecorreo2026@gmail.com</a> con tu currículum y datos profesionales.</p>
</section>`
    };
}

function loginPage() {
    return {
        title: 'Iniciar Sesión · Activamente · Portal de pacientes y especialistas',
        description: 'Accede a tu cuenta en Activamente para gestionar citas, ver tu historial y acceder a recursos exclusivos de salud mental.',
        canonical: SITE_URL + '/iniciar-sesion',
        content: `
<section style="padding: 4rem 2rem; max-width: 500px; margin: 0 auto; font-family: 'Inter', sans-serif; text-align: center;">
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2rem;">Iniciar Sesi&oacute;n</h1>
    <p style="color: #666; margin-top: 1rem;">Accede a tu cuenta en Activamente para gestionar tus citas, agendar sesiones con tu psicólogo y acceder a recursos exclusivos de bienestar mental.</p>
    <p style="color: #666; margin-top: 1rem;">¿A&uacute;n no tienes cuenta? <a href="/registro" style="color: #5d1021; font-weight: 600;">Reg&iacute;strate aqu&iacute;</a></p>
</section>`
    };
}

function registerPage() {
    return {
        title: 'Registro · Activamente · Crea tu cuenta',
        description: 'Regístrate en Activamente como paciente o especialista. Accede a terapia online y presencial con psicólogos certificados en México.',
        canonical: SITE_URL + '/registro',
        content: `
<section style="padding: 4rem 2rem; max-width: 500px; margin: 0 auto; font-family: 'Inter', sans-serif; text-align: center;">
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2rem;">Crear Cuenta &middot; Activamente</h1>
    <p style="color: #666; margin-top: 1rem;">Reg&iacute;strate como paciente para agendar citas con nuestros psic&oacute;logos especializados, o como especialista para formar parte de nuestra red de profesionales de la salud mental en M&eacute;xico.</p>
</section>`
    };
}
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2rem;">Crear Cuenta &middot; Activamente</h1>
    <p style="color: #666; margin-top: 1rem;">Reg&iacute;strate como paciente o especialista y forma parte de nuestra comunidad.</p>
</section>`
    };
}

async function psychologistsPage() {
    try {
        const result = await query(
            `SELECT p.*, u.email FROM psychologists p JOIN users u ON p.user_id = u.id WHERE p.is_active = true ORDER BY p.rating DESC, p.reviews_count DESC`
        );
        const psychologists = result.rows;
        let cards = '';
        if (psychologists.length > 0) {
            cards = psychologists.map(p => `
    <div style="padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid #e0d5c7; border-radius: 12px; background: #fdfbf7;">
        <div style="display: flex; gap: 1.5rem; align-items: start;">
            <img src="${escapeHtml(p.image || '')}" alt="${escapeHtml(p.name)}" style="width: 100px; height: 100px; border-radius: 12px; object-fit: cover;" loading="lazy">
            <div>
                <h2 style="color: #5d1021; margin: 0 0 0.3rem;">${escapeHtml(p.name)}</h2>
                <p style="color: #c29a5b; font-weight: 600; margin: 0 0 0.5rem;">${escapeHtml(p.specialty || '')}</p>
                <p style="color: #666; line-height: 1.6;">${escapeHtml((p.bio || '').substring(0, 200))}…</p>
                <p>${starsHtml(p.rating)} ${p.rating || '5.0'} &middot; ${p.reviews_count || 0} testimonios &middot; $${p.price || '--'} MXN/sesi&oacute;n</p>
                <a href="/especialista/${p.user_id}" style="color: #5d1021; font-weight: 600;">Ver perfil completo &rarr;</a>
            </div>
        </div>
    </div>`).join('');
        } else {
            cards = '<p style="color:#666;">No hay especialistas registrados actualmente.</p>';
        }
        return {
            title: 'Especialistas · Activamente',
            description: 'Conoce a nuestro equipo de psicólogos especializados en salud mental. Terapia online y presencial en México.',
            canonical: SITE_URL + '/especialistas',
            content: `
<section style="padding: 6rem 2rem 4rem; max-width: 900px; margin: 0 auto; font-family: 'Inter', sans-serif;">
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2.2rem; margin-bottom: 0.5rem;">Especialistas &middot; Activamente</h1>
    <p style="font-size: 1.1rem; color: #666; margin-bottom: 2rem;">Conoce a nuestro equipo de psic&oacute;logos y terapeutas especializados.</p>
    ${cards}
</section>`
        };
    } catch (err) {
        console.error('SSR psychologists error:', err);
        return homePage();
    }
}

async function psychologistProfilePage(id) {
    try {
        const result = await query(
            `SELECT p.*, u.email FROM psychologists p JOIN users u ON p.user_id = u.id WHERE p.user_id = $1 AND p.is_active = true`,
            [id]
        );
        if (result.rows.length === 0) {
            return {
                title: 'Especialista no encontrado · Activamente',
                description: 'El perfil del especialista no está disponible.',
                canonical: SITE_URL + '/',
                content: '<p>Especialista no encontrado.</p>'
            };
        }
        const p = result.rows[0];

        const [blogResult, testResult] = await Promise.all([
            query(`SELECT * FROM forum_posts WHERE author_id = $1 AND is_active = true ORDER BY timestamp DESC LIMIT 3`, [id]).catch(() => ({ rows: [] })),
            query(`SELECT * FROM site_testimonials WHERE is_active = true ORDER BY created_at DESC LIMIT 5`).catch(() => ({ rows: [] }))
        ]);

        const blogPosts = blogResult.rows || [];
        const testimonials = testResult.rows || [];

        const blogHtml = blogPosts.length > 0
            ? blogPosts.map(b => `
    <div style="padding: 1rem; margin-bottom: 1rem; border-left: 3px solid #c29a5b; background: #fdfbf7; border-radius: 4px;">
        <h3 style="color: #5d1021; margin: 0 0 0.5rem;">${escapeHtml(b.title || '')}</h3>
        <p style="color: #666; line-height: 1.6;">${escapeHtml((b.content || '').substring(0, 200))}…</p>
    </div>`).join('')
            : '<p style="color:#666;">No hay publicaciones a&uacute;n.</p>';

        const testHtml = testimonials.length > 0
            ? testimonials.slice(0, 5).map(t => `
    <div style="padding: 1rem; margin-bottom: 0.8rem; background: #fdfbf7; border-radius: 8px; border: 1px solid #e0d5c7;">
        <p>${starsHtml(t.stars)}</p>
        <p style="color: #333; font-style: italic; line-height: 1.6;">&ldquo;${escapeHtml(t.content || '')}&rdquo;</p>
        <small style="color: #999;">&mdash; ${escapeHtml(t.patient_name || 'Paciente')}</small>
    </div>`).join('')
            : '<p style="color:#666;">No hay testimonios a&uacute;n.</p>';

        return {
            title: `${p.name} · ${p.specialty || 'Especialista'} · Activamente`,
            description: (p.bio || '').substring(0, 160),
            canonical: `${SITE_URL}/especialista/${p.user_id}`,
            content: `
<section style="padding: 6rem 2rem 4rem; max-width: 900px; margin: 0 auto; font-family: 'Inter', sans-serif; line-height: 1.8;">
    <div style="display: flex; gap: 2rem; align-items: start; margin-bottom: 2rem; flex-wrap: wrap;">
        <img src="${escapeHtml(p.image || '')}" alt="${escapeHtml(p.name)}" style="width: 180px; height: 180px; border-radius: 20px; object-fit: cover;">
        <div>
            <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; margin: 0 0 0.5rem; font-size: 2rem;">${escapeHtml(p.name)}</h1>
            <p style="color: #c29a5b; font-size: 1.2rem; font-weight: 600; margin: 0 0 1rem;">${escapeHtml(p.specialty || 'Psicólogo')}</p>
            <p style="font-size: 1.3rem;">${starsHtml(p.rating)} ${p.rating || '5.0'}</p>
            <p style="color: #333; font-size: 1.1rem;"><strong>$${p.price || '--'} MXN</strong> / sesi&oacute;n &middot; ${p.reviews_count || 0} testimonios</p>
            <p style="color: #666;">Modalidad: ${p.modality === 'online' ? 'Online' : p.modality === 'presencial' ? 'Presencial' : 'Online y Presencial'} &middot; ${escapeHtml(p.languages || 'Español')}</p>
        </div>
    </div>
    <h2 style="color: #5d1021; border-bottom: 2px solid #c29a5b; padding-bottom: 0.5rem;">Sobre ${escapeHtml(p.name)}</h2>
    <p style="color: #333; font-size: 1.1rem; white-space: pre-line; margin-top: 1rem;">${escapeHtml(p.bio || '')}</p>
    ${p.education ? `<h3 style="color: #5d1021; margin-top: 2rem;">Formaci&oacute;n</h3><p style="color: #333; white-space: pre-line;">${escapeHtml(p.education)}</p>` : ''}
    ${p.approach ? `<h3 style="color: #5d1021; margin-top: 2rem;">Enfoque Terap&eacute;utico</h3><p style="color: #333;">${escapeHtml(p.approach)}</p>` : ''}
    <h3 style="color: #5d1021; margin-top: 2rem;">Testimonios</h3>
    ${testHtml}
    <h3 style="color: #5d1021; margin-top: 2rem;">Publicaciones</h3>
    ${blogHtml}
</section>`
        };
    } catch (err) {
        console.error('SSR profile error:', err);
        return homePage();
    }
}

async function forumPage() {
    try {
        const result = await query(
            `SELECT * FROM forum_posts WHERE is_active = true ORDER BY timestamp DESC LIMIT 10`
        );
        const posts = result.rows || [];
        let postsHtml = '';
        if (posts.length > 0) {
            postsHtml = posts.map(p => `
    <div style="padding: 1.2rem; margin-bottom: 1rem; border: 1px solid #e0d5c7; border-radius: 8px; background: #fdfbf7;">
        <h3 style="color: #5d1021; margin: 0 0 0.5rem;">${escapeHtml(p.title || '')}</h3>
        <p style="color: #666; line-height: 1.6;">${escapeHtml((p.content || '').substring(0, 250))}…</p>
        <small style="color: #999;">${escapeHtml(p.author_email || 'Anónimo')}</small>
    </div>`).join('');
        } else {
            postsHtml = '<p style="color:#666;">No hay publicaciones en el foro a&uacute;n.</p>';
        }
        return {
            title: 'El Espacio · Foro Activamente',
            description: 'Participa en el foro comunitario de Activamente. Comparte experiencias y encuentra apoyo.',
            canonical: SITE_URL + '/foro',
            content: `
<section style="padding: 6rem 2rem 4rem; max-width: 800px; margin: 0 auto; font-family: 'Inter', sans-serif;">
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2.2rem; margin-bottom: 0.5rem;">El Espacio &middot; Foro Activamente</h1>
    <p style="font-size: 1.1rem; color: #666; margin-bottom: 2rem;">Comparte experiencias y encuentra apoyo en nuestra comunidad.</p>
    ${postsHtml}
</section>`
        };
    } catch (err) {
        console.error('SSR forum error:', err);
        return homePage();
    }
}

// ====== MAIN HANDLER ======
module.exports = async (req, res) => {
    try {
        const html = loadTemplate();
        const urlPath = req.url.split('?')[0];
        const PROFILE_PATH_RE = /^\/especialista\/(\d+)$/;

        let page;
        if (urlPath === '/' || urlPath === '') {
            page = homePage();
        } else if (urlPath === '/nosotros') {
            page = aboutPage();
        } else if (urlPath === '/contacto') {
            page = contactPage();
        } else if (urlPath === '/especialistas') {
            page = await psychologistsPage();
        } else if (urlPath === '/foro' || urlPath === '/blog') {
            page = await forumPage();
        } else if (urlPath === '/iniciar-sesion' || urlPath === '/login') {
            page = loginPage();
        } else if (urlPath === '/registro' || urlPath === '/register') {
            page = registerPage();
        } else {
            const profileMatch = urlPath.match(PROFILE_PATH_RE);
            if (profileMatch) {
                page = await psychologistProfilePage(parseInt(profileMatch[1], 10));
            } else {
                // Unknown route — return SPA shell as-is
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600');
                return res.status(200).end(html);
            }
        }

        const finalHtml = injectSEO(html, page);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');
        res.setHeader('X-Robots-Tag', 'index, follow');
        return res.status(200).end(finalHtml);

    } catch (err) {
        console.error('Render error:', err.message);
        try {
        const htmlPath = path.join(process.cwd(), 'private', 'template.html');
            const html = fs.readFileSync(htmlPath, 'utf-8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).end(html);
        } catch {
            return res.status(500).end('Error interno del servidor.');
        }
    }
};
