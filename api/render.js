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
 * The template has no loading screen so Googlebot sees content immediately.
 */
function injectSEO(html, seo) {
    const { title, description, canonical } = seo;

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
        description: 'Activamente conecta pacientes con psicólogos certificados en México. Terapia online y presencial para ansiedad, depresión, estrés, relaciones de pareja y más. Atención profesional con calidez humana.',
        canonical: SITE_URL + '/',
        content: `
<section style="padding: 4rem 2rem; max-width: 960px; margin: 0 auto; font-family: 'Inter', sans-serif; line-height: 1.8;">
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2.5rem; margin-bottom: 0.5rem;">Activamente · Salud Mental y Bienestar</h1>
    <p style="font-size: 1.3rem; color: #c29a5b; font-weight: 600; margin-bottom: 1.5rem;">Expertos comprometidos con tu bienestar emocional en México</p>

    <p style="font-size: 1.1rem; color: #333; margin-bottom: 1.5rem;">En Activamente creamos un espacio seguro donde la excelencia clínica se encuentra con la calidez humana. Somos una plataforma de salud mental que conecta pacientes con psicólogos certificados en México, ofreciendo terapia online y presencial adaptada a las necesidades de cada persona.</p>

    <p style="font-size: 1.1rem; color: #333; margin-bottom: 2rem;">Nuestro equipo de terapeutas especializados combina años de experiencia clínica con un enfoque cálido y personalizado. Creemos firmemente que la salud mental es la base de una vida plena y equilibrada, y trabajamos cada día para hacerla accesible a todos los mexicanos, sin importar su ubicación o presupuesto.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">¿Por qué elegir Activamente para tu terapia?</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 1.5rem;">Elegir un psicólogo es una decisión importante. En Activamente nos aseguramos de que cada especialista en nuestra plataforma cumpla con los más altos estándares profesionales y éticos. Todos nuestros terapeutas cuentan con cédula profesional, formación continua y experiencia comprobada en su área de especialización. Además, ofrecemos total transparencia en costos, modalidades y enfoques terapéuticos para que puedas tomar la mejor decisión para tu bienestar.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Áreas de atención psicológica</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 1rem;">Trabajamos con especialistas en diversas áreas de la salud mental para brindarte el acompañamiento que necesitas:</p>
    <ul style="margin-bottom: 2rem; color: #333;">
        <li><strong>Ansiedad:</strong> La ansiedad es una de las consultas más frecuentes en terapia. Nuestros psicólogos te ayudarán a identificar sus causas y desarrollar herramientas prácticas basadas en terapia cognitivo-conductual y mindfulness para gestionarla de manera efectiva en tu día a día.</li>
        <li><strong>Estrés:</strong> El estrés laboral, familiar y personal puede afectar todos los aspectos de tu vida. Aprende técnicas de manejo del estrés con acompañamiento profesional personalizado.</li>
        <li><strong>Depresión:</strong> La depresión es una condición seria pero tratable. Nuestros terapeutas especializados te ofrecen apoyo profesional para superar la depresión y recuperar tu bienestar emocional con herramientas basadas en evidencia científica.</li>
        <li><strong>Relaciones de pareja:</strong> La terapia de pareja puede ayudar a fortalecer la comunicación, resolver conflictos y reconstruir la confianza. Trabajamos con enfoques sistémicos y de pareja.</li>
        <li><strong>Duelo y pérdidas:</strong> El proceso de duelo es único para cada persona. Ofrecemos acompañamiento sensible y respetuoso en procesos de duelo, pérdidas y adaptación a cambios significativos.</li>
        <li><strong>Autoestima e identidad:</strong> Trabaja en tu autoconcepto, desarrolla una relación más saludable contigo mismo y construye una identidad sólida y auténtica.</li>
        <li><strong>Adolescentes:</strong> Terapia especializada para jóvenes que enfrentan los desafíos propios de la adolescencia: cambios emocionales, presión social, identidad y relación familiar.</li>
        <li><strong>Trauma:</strong> Procesamiento y sanación de experiencias traumáticas con profesionales capacitados en técnicas como EMDR y terapia cognitivo-conductual enfocada en trauma.</li>
    </ul>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Terapia online y presencial en México</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 1rem;">Entendemos que cada persona tiene necesidades y preferencias distintas. Por eso ofrecemos dos modalidades de atención:</p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 0.8rem;"><strong>Terapia online:</strong> Sesiones por videollamada desde la comodidad de tu hogar, oficina o cualquier lugar con conexión a internet. Ideal para personas con agendas ocupadas, movilidad limitada o que prefieren la privacidad de su espacio. La terapia online ha demostrado ser igual de efectiva que la presencial para la mayoría de los casos.</p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 2rem;"><strong>Terapia presencial:</strong> Atención en ubicaciones seleccionadas en México. La interacción cara a cara puede ser especialmente valiosa para ciertos enfoques terapéuticos y preferencias personales.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Nuestros psicólogos y terapeutas</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 1rem;">Contamos con un equipo diverso de psicólogos y terapeutas certificados, cada uno con su propia especialidad y enfoque. Desde terapia cognitivo-conductual (TCC), terapia humanista, terapia sistémica, psicoanálisis, hasta mindfulness y terapias de tercera generación. Cada especialista es seleccionado rigurosamente por su excelencia clínica, formación académica y genuino compromiso con el bienestar de sus pacientes.</p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 2rem;">Todos nuestros profesionales cuentan con cédula profesional vigente, experiencia clínica comprobada y participan en programas de formación continua. Creemos en la terapia como un espacio de transformación y crecimiento personal.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Foro comunitario "El Espacio"</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 2rem;">El Espacio es nuestro foro comunitario donde pacientes y especialistas comparten experiencias, reflexiones y aprendizajes sobre salud mental. Es un ambiente respetuoso, anónimo y de apoyo mutuo, moderado por nuestro equipo para garantizar un diálogo constructivo y seguro. Participar en comunidad puede ser un complemento valioso a tu proceso terapéutico.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Preguntas frecuentes sobre nuestros servicios</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 0.8rem;"><strong>¿Cómo elegir al psicólogo adecuado?</strong> Puedes explorar los perfiles de nuestros especialistas, leer sus biografías, conocer su enfoque terapéutico y revisar testimonios de otros pacientes. Si tienes dudas, contáctanos y te ayudaremos a encontrar al terapeuta ideal para ti.</p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 0.8rem;"><strong>¿Cuánto cuesta una sesión?</strong> Los precios varían según el especialista y comienzan desde $500 MXN por sesión. Todos los costos son transparentes y se muestran claramente en cada perfil.</p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 0.8rem;"><strong>¿Cómo agendar una cita?</strong> Una vez que encuentres al especialista de tu preferencia, completa el formulario de contacto en su perfil y el terapeuta te responderá para coordinar los detalles de tu primera sesión.</p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 2rem;"><strong>¿La terapia online es efectiva?</strong> Sí, numerosos estudios respaldan la efectividad de la terapia online, que puede ser igual o más efectiva que la presencial para la mayoría de las condiciones de salud mental.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Compromiso con tu bienestar</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 2rem;">En Activamente estamos comprometidos con tu privacidad y confidencialidad. Todos los datos compartidos en las sesiones y a través de nuestra plataforma se manejan con los más altos estándares de seguridad y protección de datos. Creemos en un enfoque integral que combina la experiencia clínica con un trato humano y cercano, porque sabemos que el camino hacia el bienestar emocional requiere tanto de ciencia como de calidez.</p>

    <div style="margin: 2.5rem 0; display: flex; gap: 1.5rem; flex-wrap: wrap;">
        <a href="/especialistas" style="display: inline-block; padding: 1rem 2.5rem; background: #5d1021; color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 1.1rem;">Encuentra tu especialista</a>
        <a href="/nosotros" style="display: inline-block; padding: 1rem 2.5rem; border: 2px solid #c29a5b; color: #5d1021; text-decoration: none; border-radius: 50px; font-weight: 600;">Conoce más sobre nosotros</a>
        <a href="/contacto" style="display: inline-block; padding: 1rem 2.5rem; border: 2px solid #5d1021; color: #5d1021; text-decoration: none; border-radius: 50px; font-weight: 600;">Contáctanos</a>
    </div>

    <div style="margin-top: 3rem; padding: 2rem; background: #fdfbf7; border-radius: 16px; border: 1px solid #e0d5c7;">
        <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.3rem; margin-bottom: 1rem;">¿Eres psicólogo y quieres formar parte de Activamente?</h2>
        <p style="font-size: 1.1rem; color: #333;">Si eres un profesional de la salud mental con cédula profesional y compartes nuestro compromiso con la excelencia clínica y el trato humano, te invitamos a formar parte de nuestra red de especialistas. Ofrecemos visibilidad, herramientas de gestión y una comunidad de profesionales comprometidos con el bienestar de México.</p>
        <p style="margin-top: 1rem;"><a href="/registro" style="color: #5d1021; font-weight: 600;">Regístrate como especialista &rarr;</a></p>
    </div>
</section>`
    };
}

function aboutPage() {
    return {
        title: 'Nosotros · Activamente · Quiénes somos y nuestra misión',
        description: 'Conoce la historia, misión, visión y valores de Activamente. Un ecosistema de salud mental en México con psicólogos certificados, atención personalizada y compromiso social.',
        canonical: SITE_URL + '/nosotros',
        content: `
<section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; font-family: 'Inter', sans-serif; line-height: 1.8;">
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2.2rem;">Nosotros &middot; Activamente</h1>
    <p style="font-size: 1.1rem; color: #333; margin-top: 1.5rem;">En Activamente ofrecemos un espacio de excelencia clínica y calidez humana para la salud mental en México. Nuestra misión es empoderar a las personas para transformar su relación con sus pensamientos y emociones a través de terapia profesional y acompañamiento especializado.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Nuestra misión</h2>
    <p style="font-size: 1.1rem; color: #333;">Hacer accesible la salud mental de calidad en México, conectando a pacientes con psicólogos certificados que ofrecen un trato humano, ético y profesional. Creemos que el bienestar emocional no debe ser un privilegio, sino un derecho al alcance de todas las personas, independientemente de su ubicación geográfica o situación económica.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Nuestra visión</h2>
    <p style="font-size: 1.1rem; color: #333;">Ser la plataforma líder de salud mental en México, reconocida por la calidad excepcional de nuestros especialistas, la calidez de nuestro servicio y nuestro compromiso genuino con la transformación positiva de las personas. Aspiramos a construir una sociedad donde el cuidado de la salud mental sea una prioridad y un hábito normalizado.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Nuestros valores</h2>
    <ul style="color: #333; margin-bottom: 1.5rem;">
        <li><strong>Excelencia clínica:</strong> Todos nuestros psicólogos son profesionales certificados con cédula profesional vigente y participación en programas de formación continua. La calidad de la atención es nuestra prioridad.</li>
        <li><strong>Calidez humana:</strong> Creemos en la terapia como un espacio seguro, libre de juicio y lleno de empatía. Cada persona es única y merece un trato respetuoso y personalizado.</li>
        <li><strong>Accesibilidad:</strong> Ofrecemos terapia online y presencial con precios justos y transparentes, porque la salud mental de calidad debe estar al alcance de todos.</li>
        <li><strong>Confidencialidad:</strong> La privacidad de nuestros pacientes es sagrada. Todos los datos personales y clínicos se manejan con estricta seguridad y confidencialidad.</li>
        <li><strong>Compromiso social:</strong> Trabajamos activamente para reducir el estigma alrededor de la salud mental en México, promoviendo el diálogo abierto y la educación emocional en nuestra comunidad.</li>
    </ul>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Nuestros especialistas</h2>
    <p style="font-size: 1.1rem; color: #333;">Contamos con psicólogos especializados en diversas corrientes terapéuticas: terapia cognitivo-conductual (TCC), terapia humanista, terapia sistémica, psicoanálisis, mindfulness y terapias contextuales. Cada profesional es seleccionado rigurosamente por su experiencia clínica, formación académica y compromiso genuino con el paciente. Trabajamos con adolescentes, adultos, parejas y familias en todo México.</p>
    <p style="margin-top: 1rem;"><a href="/especialistas" style="color: #5d1021; font-weight: 600;">Conoce a nuestro equipo de especialistas &rarr;</a></p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">¿Por qué elegir Activamente?</h2>
    <p style="font-size: 1.1rem; color: #333;">Porque combinamos la excelencia clínica con un trato humano y cercano. No solo te conectamos con un psicólogo, te acompañamos en todo tu proceso de bienestar emocional. Cada terapeuta en nuestra plataforma comparte nuestro compromiso con la calidad, la ética y la transformación personal. Además, nuestra plataforma te permite elegir entre terapia online y presencial, comparar perfiles, leer testimonios reales y seleccionar al profesional que mejor se adapte a tus necesidades específicas.</p>

    <p style="margin-top: 2rem;"><strong style="color: #5d1021;">Activamente: Camina hacia una vida con significado.</strong></p>
</section>`
    };
}

function contactPage() {
    return {
        title: 'Contacto · Activamente · Atención a pacientes y especialistas',
        description: 'Contacta con Activamente. Estamos aquí para ayudarte a encontrar al psicólogo ideal. Respondemos en menos de 24 horas hábiles. Terapia online y presencial en México.',
        canonical: SITE_URL + '/contacto',
        content: `
<section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; font-family: 'Inter', sans-serif; line-height: 1.8;">
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2.2rem;">Contacto &middot; Activamente</h1>
    <p style="font-size: 1.1rem; color: #333; margin-top: 1.5rem;">Estamos aquí para ayudarte a encontrar el apoyo profesional que necesitas. Si tienes preguntas sobre nuestros servicios de terapia psicológica, deseas agendar una cita con alguno de nuestros especialistas, o necesitas más información sobre cómo funciona nuestra plataforma, no dudes en contactarnos. Respondemos a todas las consultas en menos de 24 horas hábiles.</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Información de contacto</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 0.5rem;"><strong>Correo electrónico:</strong> <a href="mailto:activamentecorreo2026@gmail.com" style="color: #5d1021;">activamentecorreo2026@gmail.com</a></p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 0.5rem;"><strong>Teléfono:</strong> +52 55 8000 4851</p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 2rem;"><strong>Horario de atención:</strong> Lunes a viernes de 9:00 a 18:00 horas (horario CDMX)</p>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">¿Cómo funcionan nuestras terapias?</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 1rem;">El proceso es simple y está diseñado para que te sientas acompañado en todo momento. Primero, explora los perfiles de nuestros psicólogos especializados y encuentra al terapeuta que mejor se adapte a tus necesidades. Cada perfil incluye información detallada sobre su formación, experiencia, enfoque terapéutico, costos y testimonios de otros pacientes.</p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 1rem;">Una vez que hayas elegido a tu especialista, completa el formulario de contacto en su perfil indicando tus datos y preferencias de horario. El terapeuta se comunicará contigo directamente para coordinar los detalles de tu primera sesión, ya sea online por videollamada o presencial en su consultorio.</p>

    <ul style="color: #333; margin-bottom: 2rem;">
        <li><strong>Terapia online:</strong> Sesiones por videollamada desde la comodidad de tu hogar, con la misma efectividad que la terapia presencial. Ideal para horarios complicados o si prefieres la privacidad de tu espacio.</li>
        <li><strong>Terapia presencial:</strong> Atención psicológica cara a cara en ubicaciones seleccionadas en México. La interacción directa puede ser especialmente valiosa para ciertos procesos terapéuticos.</li>
        <li><strong>Primera sesión:</strong> En tu primera sesión conocerás a tu terapeuta, definirán juntos tus objetivos terapéuticos y establecerán un plan de trabajo personalizado.</li>
    </ul>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">Preguntas frecuentes</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 0.8rem;"><strong>¿Cuánto cuesta una consulta?</strong> Los precios son establecidos por cada especialista y son totalmente transparentes. Puedes consultar el costo por sesión en el perfil de cada psicólogo, con precios desde $500 MXN.</p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 0.8rem;"><strong>¿Necesito referencia médica?</strong> No, puedes contactar directamente al especialista de tu preferencia sin necesidad de referencia médica previa.</p>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 2rem;"><strong>¿Cómo sé qué tipo de terapia necesito?</strong> Si no estás seguro de qué especialista o enfoque es el adecuado para ti, escríbenos y te orientaremos. También puedes agendar una primera sesión exploratoria con cualquiera de nuestros terapeutas.</p>

    <div style="margin-top: 2rem;">
        <a href="/especialistas" style="display: inline-block; padding: 1rem 2.5rem; background: #5d1021; color: white; text-decoration: none; border-radius: 50px; font-weight: 600;">Ver especialistas disponibles</a>
    </div>

    <h2 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 1.5rem; margin: 2rem 0 1rem;">¿Eres psicólogo?</h2>
    <p style="font-size: 1.1rem; color: #333; margin-top: 1.5rem;">Si eres profesional de la salud mental con cédula profesional y estás interesado en formar parte de nuestro equipo de especialistas, escríbenos a <a href="mailto:activamentecorreo2026@gmail.com" style="color: #5d1021;">activamentecorreo2026@gmail.com</a> con tu currículum y datos profesionales. Evaluamos tu perfil y te contactaremos para integrarte a nuestra red de terapeutas.</p>
</section>`
    };
}

function loginPage() {
    return {
        title: 'Iniciar Sesión · Activamente · Portal de pacientes y especialistas',
        description: 'Accede a tu cuenta en Activamente para gestionar tus citas, agendar sesiones con tu psicólogo, ver tu historial y acceder a recursos exclusivos de bienestar mental.',
        canonical: SITE_URL + '/iniciar-sesion',
        content: `
<section style="padding: 4rem 2rem; max-width: 500px; margin: 0 auto; font-family: 'Inter', sans-serif; text-align: center;">
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2rem;">Iniciar Sesi&oacute;n</h1>
    <p style="color: #666; margin-top: 1rem;">Accede a tu cuenta en Activamente para gestionar tus citas, agendar sesiones con tu psicólogo y acceder a recursos exclusivos de bienestar mental.</p>
    <p style="color: #666; margin-top: 1rem;">Si eres psicólogo, inicia sesión para administrar tu perfil, revisar tus citas y conectar con tus pacientes.</p>
    <p style="color: #666; margin-top: 1rem;">¿A&uacute;n no tienes cuenta? <a href="/registro" style="color: #5d1021; font-weight: 600;">Reg&iacute;strate aqu&iacute;</a></p>
</section>`
    };
}

function registerPage() {
    return {
        title: 'Registro · Activamente · Crea tu cuenta',
        description: 'Regístrate en Activamente como paciente o especialista. Accede a terapia online y presencial con psicólogos certificados en México. Forma parte de nuestra comunidad de salud mental.',
        canonical: SITE_URL + '/registro',
        content: `
<section style="padding: 4rem 2rem; max-width: 500px; margin: 0 auto; font-family: 'Inter', sans-serif; text-align: center;">
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2rem;">Crear Cuenta &middot; Activamente</h1>
    <p style="color: #666; margin-top: 1rem;">Reg&iacute;strate como paciente para agendar citas con nuestros psic&oacute;logos especializados, dar seguimiento a tu proceso terapéutico y acceder a recursos exclusivos de bienestar emocional.</p>
    <p style="color: #666; margin-top: 1rem;">Si eres psicólogo certificado, regístrate como especialista para formar parte de nuestra red de profesionales de la salud mental en México, gestionar tu perfil y recibir solicitudes de pacientes.</p>
    <p style="color: #666; margin-top: 1rem;">¿Ya tienes cuenta? <a href="/iniciar-sesion" style="color: #5d1021; font-weight: 600;">Inicia sesión</a></p>
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
            cards = '<p style="color:#666;">No hay especialistas registrados actualmente. Te invitamos a visitarnos pronto para conocer a nuestro equipo de psicólogos certificados.</p>';
        }
        return {
            title: 'Especialistas · Activamente · Psicólogos certificados en México',
            description: 'Conoce a nuestro equipo de psicólogos especializados en salud mental en México. Terapia online y presencial para ansiedad, depresión, estrés, pareja y más. Encuentra a tu terapeuta ideal.',
            canonical: SITE_URL + '/especialistas',
            content: `
<section style="padding: 4rem 2rem; max-width: 900px; margin: 0 auto; font-family: 'Inter', sans-serif;">
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2.2rem; margin-bottom: 0.5rem;">Especialistas &middot; Activamente</h1>
    <p style="font-size: 1.1rem; color: #666; margin-bottom: 0.5rem;">Conoce a nuestro equipo de psic&oacute;logos y terapeutas especializados en diversas áreas de la salud mental. Todos nuestros profesionales cuentan con cédula profesional vigente, experiencia clínica comprobada y un genuino compromiso con tu bienestar emocional.</p>
    <p style="font-size: 1.1rem; color: #666; margin-bottom: 2rem;">Selecciona al especialista que mejor se adapte a tus necesidades según su experiencia, enfoque terapéutico, modalidad de atención y costo por sesión. Cada perfil incluye información detallada para que tomes la mejor decisión.</p>
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
                description: 'El perfil del especialista solicitado no está disponible actualmente. Explora nuestro directorio de psicólogos certificados en México.',
                canonical: SITE_URL + '/especialistas',
                content: '<p>El perfil del especialista que buscas no está disponible actualmente. Puede que el profesional ya no se encuentre activo en nuestra plataforma o que la URL sea incorrecta.</p><p style="margin-top: 1.5rem;"><a href="/especialistas" style="color: #5d1021; font-weight: 600;">Explorar todos nuestros especialistas &rarr;</a></p>'
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
            postsHtml = '<p style="color:#666;">No hay publicaciones en el foro a&uacute;n. Sé el primero en compartir tu experiencia o reflexión sobre salud mental en nuestra comunidad.</p>';
        }
        return {
            title: 'El Espacio · Foro comunitario de Activamente',
            description: 'Participa en el foro comunitario de Activamente. Comparte experiencias, reflexiones y aprendizajes sobre salud mental con otros pacientes y especialistas en un ambiente respetuoso.',
            canonical: SITE_URL + '/foro',
            content: `
<section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; font-family: 'Inter', sans-serif;">
    <h1 style="font-family: 'Playfair Display', serif; color: #5d1021; font-size: 2.2rem; margin-bottom: 0.5rem;">El Espacio &middot; Foro Activamente</h1>
    <p style="font-size: 1.1rem; color: #666; margin-bottom: 1rem;">El Espacio es nuestro foro comunitario donde pacientes, psicólogos y especialistas comparten experiencias, reflexiones y aprendizajes sobre salud mental. Es un lugar seguro, respetuoso y de apoyo mutuo donde todas las voces son bienvenidas.</p>
    <p style="font-size: 1.1rem; color: #666; margin-bottom: 2rem;">Comparte tus dudas, inquietudes o descubrimientos sobre tu proceso terapéutico. Los especialistas de Activamente también participan en las conversaciones, ofreciendo orientación profesional. Recuerda que este espacio no sustituye la terapia profesional, sino que la complementa.</p>
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

        // Serve robots.txt directly (before route matching)
        if (urlPath === '/robots.txt') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return res.status(200).end('User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ' + SITE_URL + '/sitemap.xml\n');
        }

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
