<?php
require_once 'db.php';

$bios = [
    1 => "Mi nombre es Pedro Alberto Prieto Lobo y te doy la bienvenida. Trabajo desde la terapia cognitivo conductual, un enfoque práctico y estructurado que busca entender cómo se relacionan tus pensamientos, tus emociones y tus acciones. Mi papel no es solo escucharte, sino brindarte herramientas concretas que puedas aplicar en tu vida diaria para afrontar las dificultades de una manera más saludable.\n\nA lo largo de mi trayectoria he acompañado a muchas personas en la superación de los cambios que buscan; he trabajado con temas como ansiedad, depresión, baja autoestima, duelo y dependencia, entre otros. Brindo terapia individual para adolescentes y adultos de todas las edades, y terapia de pareja.\n\nEn nuestras sesiones trabajaremos como un equipo. Exploraremos juntos aquellos patrones que hoy te generan malestar y construiremos nuevas formas de interpretar tu realidad. Mi meta es que, con el tiempo, te sientas con la autonomía y la confianza necesarias para gestionar tus propias emociones y alcanzar una mayor calidad de vida.\n\nEstoy aquí para acompañarte en este camino de autodescubrimiento y crecimiento. Será un honor caminar a tu lado hacia una versión de ti más tranquila y plena.",

    2 => "En mi trabajo como terapeuta valoro profundamente la interacción genuina, entendiendo la terapia como un encuentro humano además de profesional. Esta visión también implica una responsabilidad constante por seguir formándome y trabajar con intervenciones basadas en evidencia, buscando ofrecer procesos terapéuticos de calidad y orientados al cumplimiento de objetivos en cada sesión.\n\nHe tenido la oportunidad de trabajar en el sector público, específicamente en el área de violencia intrafamiliar y de género. Esta experiencia me permitió desarrollar habilidades fundamentales como la escucha activa, el respeto, la empatía y el profesionalismo, las cuales hoy forman parte esencial de cada una de mis sesiones y del acompañamiento que ofrezco a mis consultantes.\n\nActualmente brindo atención psicológica en el sector privado, donde me especializo en temas relacionados con ansiedad, depresión, falta de motivación y la sensación de desconexión con aquello que es importante para cada persona. Ahora tengo el gusto de formar parte de Activamente, un espacio dedicado a ofrecer acompañamiento psicológico en un entorno seguro, profesional y respetuoso para cada persona.",

    3 => "Mi trayectoria profesional se ha nutrido de una diversidad de experiencias que hoy fundamentan mi práctica clínica. He tenido la oportunidad de trabajar en el sector público, colaborando con la Dirección General de Seguridad Ciudadana, donde desarrollé una sólida capacidad para la intervención en crisis y el manejo de situaciones de estrés, ansiedad y depresión; asimismo, he trabajado en la promoción de la salud mental en entornos educativos brindando pláticas informativas.\n\nComplementé esta labor con mi experiencia en clínicas privadas, donde además de brindar atención a adolescentes y adultos, descubrí el valor de la psicoeducación, desarrollando contenido digital y charlas para hacer la psicología más accesible.\n\nHoy, formo parte de un equipo comprometido en ofrecerte no solo calidez humana, sino la seguridad de un enfoque basado en evidencia científica. Este compromiso con la actualización constante me ha llevado a continuar mi formación a través de una maestría (que se encuentra en curso) y, actualmente, a iniciar una certificación en los reconocidos Institutos Beck y Gottman (especializados en Terapia Cognitivo-Conductual y de Pareja, respectivamente). Mi meta es que aquí encuentres un espacio profesional accesible, actualizado y, sobre todo, profundamente humano."
];

$specialties = [
    1 => 'Psicólogo',
    2 => 'Psicólogo',
    3 => 'Psicólogo'
];

$names = [
    1 => 'Pedro Alberto Prieto Lobo',
    2 => 'Gabriel Cárdenas Sánchez',
    3 => 'Cristian Hernández Cano'
];

try {
    foreach ($bios as $uid => $bio) {
        $stmt = $pdo->prepare("UPDATE psychologists SET bio = ?, specialty = ?, name = ? WHERE user_id = ?");
        $stmt->execute([$bio, $specialties[$uid], $names[$uid], $uid]);
        echo "✅ User $uid updated\n";
    }
    echo "Done.\n";
} catch (Exception $e) {
    echo "❌ " . $e->getMessage() . "\n";
}
