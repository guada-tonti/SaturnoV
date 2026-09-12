/**
 * Datos comparativos de escala para contextualizar la inmensidad del Saturn V
 * frente a la diminuta cápsula que regresó a la Tierra.
 */

export const SCALE_COMPARISONS = [
  {
    id: 'saturn_v',
    name: 'Saturn V Completo',
    height: 110.6,
    diameter: 10.0,
    mass: 2970,
    color: '#E2E8F0',
    description: 'El vehículo completo en la rampa de lanzamiento. Más alto que la Estatua de la Libertad y el Big Ben.'
  },
  {
    id: 'statue_of_liberty',
    name: 'Estatua de la Libertad (con pedestal)',
    height: 93.0,
    diameter: 18.0,
    mass: 225,
    color: '#64748B',
    isReference: true,
    description: 'Monumento de referencia en Nueva York.'
  },
  {
    id: 's1c_stage',
    name: 'Primera Etapa (S-IC)',
    height: 42.1,
    diameter: 10.0,
    mass: 2280,
    color: '#94A3B8',
    description: 'Solo esta etapa pesaba más de 2,200 toneladas con propelente.'
  },
  {
    id: 's2_stage',
    name: 'Segunda Etapa (S-II)',
    height: 24.8,
    diameter: 10.0,
    mass: 480,
    color: '#CBD5E1',
    description: 'Etapa criogénica de hidrógeno líquido.'
  },
  {
    id: 's4b_stage',
    name: 'Tercera Etapa (S-IVB)',
    height: 17.8,
    diameter: 6.6,
    mass: 120,
    color: '#E2E8F0',
    description: 'La etapa que impulsó a la tripulación hacia la Luna.'
  },
  {
    id: 'csm_lm',
    name: 'CSM + Módulo Lunar (En tránsito)',
    height: 16.5,
    diameter: 4.5,
    mass: 45,
    color: '#F8FAFC',
    description: 'Toda la nave que viajó por el espacio profundo hacia la órbita lunar.'
  },
  {
    id: 'city_bus',
    name: 'Autobús Urbano Estándar',
    height: 12.0,
    diameter: 2.5,
    mass: 14,
    color: '#F59E0B',
    isReference: true,
    description: 'Vehículo terrestre de referencia.'
  },
  {
    id: 'lm_eagle',
    name: 'Módulo Lunar "Eagle"',
    height: 7.0,
    diameter: 4.2,
    mass: 15.1,
    color: '#E5A93C',
    description: 'La nave que alunizó en el Mar de la Tranquilidad.'
  },
  {
    id: 'cm_columbia',
    name: 'Command Module "Columbia"',
    height: 3.65,
    diameter: 3.91,
    mass: 5.56,
    color: '#38BDF8',
    isHighlight: true,
    description: 'LO ÚNICO QUE REGRESÓ: Esta pequeña cápsula es la única pieza del gigantesco Saturn V de 110.6 metros que volvió a la Tierra.'
  },
  {
    id: 'astronaut',
    name: 'Astronauta (Neil Armstrong)',
    height: 1.8,
    diameter: 0.6,
    mass: 0.09,
    color: '#FFFFFF',
    isReference: true,
    description: 'Ser humano con traje espacial A7L.'
  }
];
