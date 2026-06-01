-- Database for Activamente
CREATE DATABASE IF NOT EXISTS activamente;
USE activamente;

-- Table for user authentication (Psychologists)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'psychologist',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for psychologist profiles
CREATE TABLE IF NOT EXISTS psychologists (
    user_id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    bio TEXT,
    education TEXT,
    approach TEXT,
    languages VARCHAR(255) DEFAULT 'Español',
    location VARCHAR(255) DEFAULT 'Consulta Online',
    price DECIMAL(10,2) DEFAULT 0.00,
    image VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    modality VARCHAR(50) DEFAULT 'ambos',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for forum posts
CREATE TABLE IF NOT EXISTS forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT,
    author_email VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- Psicólogo: Pedro Alberto Prieto Lobo
-- ============================================
INSERT INTO users (email, password, role)
VALUES ('pedro.prieto@activamente.com', '$2b$10$OrGieKXi4lZmKhVLB/JZ6ebtfUAjjaejOgEmI1CvkSBLR/nHp049a', 'psychologist');

INSERT INTO psychologists (
    user_id, name, specialty, bio, education, approach, languages, location, image
) VALUES (
    LAST_INSERT_ID(),
    'Pedro Alberto Prieto Lobo',
    'Psicólogo',
    'Mi nombre es Pedro Alberto Prieto Lobo y te doy la bienvenida. Trabajo desde la terapia cognitivo conductual, un enfoque práctico y estructurado que busca entender cómo se relacionan tus pensamientos, tus emociones y tus acciones. Mi papel no es solo escucharte, sino brindarte herramientas concretas que puedas aplicar en tu vida diaria para afrontar las dificultades de una manera más saludable.\n\nA lo largo de mi trayectoria he acompañado a muchas personas en la superación de los cambios que buscan; he trabajado con temas como ansiedad, depresión, baja autoestima, duelo y dependencia, entre otros. Brindo terapia individual para adolescentes y adultos de todas las edades, y terapia de pareja.\n\nEn nuestras sesiones trabajaremos como un equipo. Exploraremos juntos aquellos patrones que hoy te generan malestar y construiremos nuevas formas de interpretar tu realidad. Mi meta es que, con el tiempo, te sientas con la autonomía y la confianza necesarias para gestionar tus propias emociones y alcanzar una mayor calidad de vida.\n\nEstoy aquí para acompañarte en este camino de autodescubrimiento y crecimiento. Será un honor caminar a tu lado hacia una versión de ti más tranquila y plena.',
    '',
    'Terapia Cognitivo Conductual (TCC)',
    'Español',
    'Consulta Online',
    'uploads/prof_pedro_prieto.jpg'
);

-- ============================================
-- Psicólogo: Gabriel
-- ============================================
INSERT INTO users (email, password, role)
VALUES ('gabriel@activamente.com', '$2b$10$aNwp5l6bB7vPRS9oTKwvF.HMVHuPpCkxfzDzOlgzFOHLfWh.OHN1m', 'psychologist');

INSERT INTO psychologists (
    user_id, name, specialty, bio, education, approach, languages, location, image
) VALUES (
    LAST_INSERT_ID(),
    'Gabriel Cárdenas Sánchez',
    'Psicólogo',
    'En mi trabajo como terapeuta valoro profundamente la interacción genuina, entendiendo la terapia como un encuentro humano además de profesional. Esta visión también implica una responsabilidad constante por seguir formándome y trabajar con intervenciones basadas en evidencia, buscando ofrecer procesos terapéuticos de calidad y orientados al cumplimiento de objetivos en cada sesión.\n\nHe tenido la oportunidad de trabajar en el sector público, específicamente en el área de violencia intrafamiliar y de género. Esta experiencia me permitió desarrollar habilidades fundamentales como la escucha activa, el respeto, la empatía y el profesionalismo, las cuales hoy forman parte esencial de cada una de mis sesiones y del acompañamiento que ofrezco a mis consultantes.\n\nActualmente brindo atención psicológica en el sector privado, donde me especializo en temas relacionados con ansiedad, depresión, falta de motivación y la sensación de desconexión con aquello que es importante para cada persona. Ahora tengo el gusto de formar parte de Activamente, un espacio dedicado a ofrecer acompañamiento psicológico en un entorno seguro, profesional y respetuoso para cada persona.',
    '',
    'Intervenciones basadas en evidencia',
    'Español',
    'Consulta Online',
    'uploads/prof_gabriel.jpg'
);

-- ============================================
-- Psicólogo: Cristian
-- ============================================
INSERT INTO users (email, password, role)
VALUES ('cristian@activamente.com', '$2b$10$rgNhny2azSH4WNewB1RByOHvvKvsehjqRn/sMMXMIyB0WLPkbvb3a', 'psychologist');

INSERT INTO psychologists (
    user_id, name, specialty, bio, education, approach, languages, location, image
) VALUES (
    LAST_INSERT_ID(),
    'Cristian Hernández Cano',
    'Psicólogo',
    'Mi trayectoria profesional se ha nutrido de una diversidad de experiencias que hoy fundamentan mi práctica clínica. He tenido la oportunidad de trabajar en el sector público, colaborando con la Dirección General de Seguridad Ciudadana, donde desarrollé una sólida capacidad para la intervención en crisis y el manejo de situaciones de estrés, ansiedad y depresión; asimismo, he trabajado en la promoción de la salud mental en entornos educativos brindando pláticas informativas.\n\nComplementé esta labor con mi experiencia en clínicas privadas, donde además de brindar atención a adolescentes y adultos, descubrí el valor de la psicoeducación, desarrollando contenido digital y charlas para hacer la psicología más accesible.\n\nHoy, formo parte de un equipo comprometido en ofrecerte no solo calidez humana, sino la seguridad de un enfoque basado en evidencia científica. Este compromiso con la actualización constante me ha llevado a continuar mi formación a través de una maestría (que se encuentra en curso) y, actualmente, a iniciar una certificación en los reconocidos Institutos Beck y Gottman (especializados en Terapia Cognitivo-Conductual y de Pareja, respectivamente). Mi meta es que aquí encuentres un espacio profesional accesible, actualizado y, sobre todo, profundamente humano.',
    '',
    'Terapia Cognitivo-Conductual',
    'Español',
    'Consulta Online',
    'uploads/prof_cristian.jpg'
);
