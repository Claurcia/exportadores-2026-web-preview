/* Datos de demostración compartidos por las 3 propuestas.
   Los participantes son ficticios; los votos y vistas son placeholders.
   Las miniaturas apuntan a imágenes generadas (assets/gen) o a referencias de los insumos. */
window.EXPO = {
  fechas: {
    inscripcionesInicio: '2026-09-14',
    inscripcionesFin: '2026-10-11',
    votacionInicio: '2026-09-14',
    votacionFin: '2026-10-18',
    final: '2026-10-23',
    finalLugar: 'Hotel Los Delfines, Lima'
  },
  regiones: ['Amazonas','Áncash','Apurímac','Arequipa','Ayacucho','Cajamarca','Callao','Cusco','Huancavelica','Huánuco','Ica','Junín','La Libertad','Lambayeque','Lima','Loreto','Madre de Dios','Moquegua','Pasco','Piura','Puno','San Martín','Tacna','Tumbes','Ucayali'],
  categorias: ['Agro y alimentos','Textil y artesanía','Bebidas','Pesca y acuicultura','Manufactura','Otros'],
  participantes: [
    { id: 1,  producto: 'Café Especial del Norte',    titular: 'María Fernanda Ruiz',  region: 'Cajamarca',   categoria: 'Agro y alimentos',   votos: 1245, vistas: 3810, yt: 'dQw4w9WgXcQ', thumb: 'thumb-cafe.webp' },
    { id: 2,  producto: 'Palta Hass Premium',         titular: 'Carlos Mendoza',       region: 'La Libertad', categoria: 'Agro y alimentos',   votos: 1180, vistas: 3402, yt: 'dQw4w9WgXcQ', thumb: 'thumb-palta.webp' },
    { id: 3,  producto: 'Textiles con Identidad',     titular: 'Lucía Gómez',          region: 'Puno',        categoria: 'Textil y artesanía', votos: 980,  vistas: 2950, yt: 'dQw4w9WgXcQ', thumb: 'thumb-textil.webp' },
    { id: 4,  producto: 'Cerámica de Chulucanas',     titular: 'Diego Valverde',       region: 'Piura',       categoria: 'Textil y artesanía', votos: 870,  vistas: 2410, yt: 'dQw4w9WgXcQ', thumb: 'thumb-ceramica.webp' },
    { id: 5,  producto: 'Espárragos del Sol',         titular: 'José Luis Ramírez',    region: 'Ica',         categoria: 'Agro y alimentos',   votos: 1320, vistas: 4100, yt: 'dQw4w9WgXcQ', thumb: 'thumb-esparragos.webp' },
    { id: 6,  producto: 'Nueces Andinas',             titular: 'Andrea Torres',        region: 'Junín',       categoria: 'Agro y alimentos',   votos: 1050, vistas: 3120, yt: 'dQw4w9WgXcQ', thumb: 'thumb-nueces.webp' },
    { id: 7,  producto: 'Cacao Fino de Aroma',        titular: 'Renzo Fujita',         region: 'San Martín',  categoria: 'Agro y alimentos',   votos: 760,  vistas: 2205, yt: 'dQw4w9WgXcQ', thumb: 'thumb-cacao.webp' },
    { id: 8,  producto: 'Uvas de Exportación',        titular: 'Sofía Quispe',         region: 'Ica',         categoria: 'Agro y alimentos',   votos: 1100, vistas: 3350, yt: 'dQw4w9WgXcQ', thumb: 'thumb-uvas.webp' },
    { id: 9,  producto: 'Pescados del Pacífico',      titular: 'Manuel Arévalo',       region: 'Piura',       categoria: 'Pesca y acuicultura', votos: 1280, vistas: 3900, yt: 'dQw4w9WgXcQ', thumb: 'thumb-pescado.webp' },
    { id: 10, producto: 'Flores que Inspiran',        titular: 'Carla Salazar',        region: 'Lima',        categoria: 'Agro y alimentos',   votos: 930,  vistas: 2780, yt: 'dQw4w9WgXcQ', thumb: 'thumb-flores.webp' },
    { id: 11, producto: 'Muebles de Bambú',           titular: 'Elena Huamán',         region: 'Ucayali',     categoria: 'Manufactura',        votos: 640,  vistas: 1980, yt: 'dQw4w9WgXcQ', thumb: 'thumb-bambu.webp' },
    { id: 12, producto: 'Pisco Quebranta Artesanal',  titular: 'Javier Rojas',         region: 'Lima',        categoria: 'Bebidas',            votos: 1020, vistas: 3010, yt: 'dQw4w9WgXcQ', thumb: 'thumb-pisco.webp' },
    { id: 13, producto: 'Café Tunki de Sandia',       titular: 'Rosa Mamani',          region: 'Puno',        categoria: 'Agro y alimentos',   votos: 890,  vistas: 2610, yt: 'dQw4w9WgXcQ', thumb: 'thumb-cafe.webp' },
    { id: 14, producto: 'Cerámica de Pisac',          titular: 'Pedro Cárdenas',       region: 'Cusco',       categoria: 'Textil y artesanía', votos: 710,  vistas: 2050, yt: 'dQw4w9WgXcQ', thumb: 'thumb-ceramica.webp' },
    { id: 15, producto: 'Tejidos de Ayacucho',        titular: 'Ana Belén Torres',     region: 'Ayacucho',    categoria: 'Textil y artesanía', votos: 820,  vistas: 2390, yt: 'dQw4w9WgXcQ', thumb: 'thumb-textil.webp' },
    { id: 16, producto: 'Palta Fuerte de Casma',      titular: 'Luis Paredes',         region: 'Áncash',      categoria: 'Agro y alimentos',   votos: 590,  vistas: 1720, yt: 'dQw4w9WgXcQ', thumb: 'thumb-palta.webp' }
  ],
  bases: [
    { t: 'Objetivo', d: 'Promover y dar visibilidad a los mejores productos peruanos con potencial exportador a China, generando un relato positivo entre ambos países y abriendo mercado a la pequeña y mediana empresa.' },
    { t: 'Participantes', d: 'Pueden participar personas naturales o representantes de mypes de todo el Perú con productos listos para exportar. El titular asume plena responsabilidad sobre los datos consignados en su ficha, que tiene carácter de declaración jurada.' },
    { t: 'Inscripción', d: 'Completa la ficha de inscripción y adjunta el enlace de tu video en YouTube presentando tu producto (máximo 2 minutos). La inscripción es gratuita y está abierta del 14 de setiembre al 11 de octubre de 2026.' },
    { t: 'Moderación', d: 'Todos los videos inscritos son evaluados para verificar que su contenido no tenga ningún elemento ofensivo ni viole principios de buena conducta. Una vez aprobados, se publican en la galería en un plazo máximo de 48 horas.' },
    { t: 'Etapa 1: Competencia online', d: 'Del 14 de setiembre al 18 de octubre. Todos los productos aprobados participan a través de sus videos. El público vota con identidad verificada: una persona, un voto. Clasifican 10 finalistas: los 5 más votados y 5 seleccionados por el jurado.' },
    { t: 'Etapa 2: Gran Final en Lima', d: '23 de octubre en el Hotel Los Delfines. Los 10 finalistas presentan en vivo frente a un jurado que elige a los 5 ganadores.' },
    { t: 'Premios', d: 'Los 5 ganadores viajan a China con todo pagado para exponer sus productos en la CIIE 2026 (Shanghái) y participar en el APEC 2026 en China.' },
    { t: 'Datos personales', d: 'Los datos se tratan conforme a la Ley N.º 29733 de Protección de Datos Personales, únicamente para la gestión del concurso. El participante puede ejercer sus derechos ARCO escribiendo al correo de contacto.' },
    { t: 'Disposiciones finales', d: 'La organización se reserva el derecho de modificar fechas o etapas por causas de fuerza mayor. Su decisión es inapelable.' }
  ]
};
