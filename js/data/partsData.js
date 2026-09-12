/**
 * Fichas técnicas detalladas de cada componente del Saturn V y la nave Apollo.
 * Utilizado por el Inspector de Componentes y el explorador interactivo.
 */

export const ROCKET_PARTS = {
  les: {
    id: 'les',
    name: 'Launch Escape System (LES)',
    role: 'Sistema de Escape de Emergencia',
    height: '10.0 m (33 ft)',
    diameter: '1.2 m (torre reticular)',
    mass: '4,170 kg (9,200 lb)',
    propellant: 'Combustible sólido (Polisulfuro)',
    thrust: '689 kN (155,000 lbf)',
    burnTime: '3.2 segundos',
    discardTime: 'T+ 000:03:17 (tras ignición de la S-II)',
    description: 'Torre reticular montada sobre el Módulo de Mando. En caso de una falla catastrófica en la plataforma de lanzamiento o durante los primeros minutos de ascenso, el cohete de combustible sólido de escape se encendería instantáneamente para alejar la cápsula tripulada a 1.6 km de distancia y 1.2 km de altura, permitiendo el despliegue seguro de paracaídas.',
    hasCutaway: false,
    cameraOffset: { x: 4, y: 23, z: 8 },
    cameraTarget: { x: 0, y: 22, z: 0 },
    stats: [
      { label: 'Tiempo de reacción', value: '100 ms' },
      { label: 'Aceleración máx.', value: '15 G' },
      { label: 'Toberas de cabeceo', value: 'Canards aerodinámicos' }
    ]
  },
  cm: {
    id: 'cm',
    name: 'Command Module (CM) "Columbia"',
    role: 'Cabina de Tripulación y Centro de Control',
    height: '3.65 m (12 ft)',
    diameter: '3.91 m (12.8 ft) en la base',
    mass: '5,560 kg (12,250 lb)',
    habitableVolume: '6.2 m³ (218 cu ft)',
    propellant: 'MMH / N2O4 (RCS de actitud)',
    thrust: '12 x propulsores RCS de 414 N',
    discardTime: 'Única sección que regresa a la Tierra',
    description: 'La única parte del Saturn V que completó el viaje de ida y vuelta a la Luna. Una estructura cónica de aleación de aluminio y nido de abeja de acero inoxidable, forrada con un escudo térmico ablativo de resina fenólica-epoxi (Avcoat). Albergó a Neil Armstrong, Buzz Aldrin y Michael Collins durante los 8 días de misión.',
    hasCutaway: true,
    cutawayTitle: 'Interior del Command Module',
    cutawayDetails: 'Espacio habitable extremadamente compacto de 6.2 m³. Contenía tres literas reclinables de aleación ligera, el panel principal de control con más de 500 interruptores y diales, el telescopio y sextante óptico de navegación AOT, el ordenador de guiado Apollo (AGC) y la escotilla de transferencia al Módulo Lunar.',
    cameraOffset: { x: 3.5, y: 19.8, z: 6 },
    cameraTarget: { x: 0, y: 19.3, z: 0 },
    stats: [
      { label: 'Tripulación', value: '3 astronautas' },
      { label: 'Temp. Escudo Térmico', value: '2,760 °C' },
      { label: 'Presión interna', value: '5.0 psi (100% O₂)' }
    ]
  },
  sm: {
    id: 'sm',
    name: 'Service Module (SM)',
    role: 'Soporte Vital, Energía y Propulsión Principal',
    height: '7.56 m (24.8 ft)',
    diameter: '3.91 m (12.8 ft)',
    mass: '24,520 kg (54,060 lb cargado)',
    propellant: 'Aerozine 50 / N2O4 (hipergólico)',
    thrust: '91.2 kN (20,500 lbf) Motor SPS',
    burnTime: 'Hasta 750 s (múltiples encendidos)',
    discardTime: 'T+ 194:49 (antes de la reentrada)',
    description: 'Estructura cilíndrica no presurizada que abastecía al Módulo de Mando con oxígeno, agua, electricidad (mediante 3 celdas de combustible de hidrógeno-oxígeno) y propulsión principal. El motor SPS (Service Propulsion System) ejecutó la inserción en órbita lunar (LOI) y el regreso a la Tierra (TEI).',
    hasCutaway: false,
    cameraOffset: { x: 5, y: 17.5, z: 9 },
    cameraTarget: { x: 0, y: 17.1, z: 0 },
    stats: [
      { label: 'Celdas de combustible', value: '3 x Pratt & Whitney' },
      { label: 'Propulsores RCS', value: '4 bloques cuádruples (16 motores)' },
      { label: 'Antena Principal', value: 'Antena parabólica High-Gain' }
    ]
  },
  sla: {
    id: 'sla',
    name: 'Spacecraft-LM Adapter (SLA)',
    role: 'Carenado Protector y Adaptador Estructural',
    height: '8.5 m (28 ft)',
    diameter: '3.9 m (superior) / 6.6 m (inferior)',
    mass: '1,837 kg (4,050 lb)',
    propellant: 'N/A (Cargas pirotécnicas)',
    thrust: 'N/A',
    burnTime: 'N/A',
    discardTime: 'T+ 003:20 (durante transposición)',
    description: 'Estructura cónica truncada que unía la tercera etapa S-IVB con el Módulo de Servicio y protegía al Módulo Lunar durante el lanzamiento y el ascenso atmosférico. En el espacio translunar, se abría mediante cargas explosivas en 4 paneles radiales para permitir la extracción del Lunar Module.',
    hasCutaway: false,
    cameraOffset: { x: 6, y: 14.5, z: 11 },
    cameraTarget: { x: 0, y: 13.9, z: 0 },
    stats: [
      { label: 'Paneles eyectables', value: '4 pétalos a 45°/90°' },
      { label: 'Material', value: 'Paneles nido de abeja de aluminio' },
      { label: 'Liberación', value: 'Pernos pirotécnicos' }
    ]
  },
  lm: {
    id: 'lm',
    name: 'Lunar Module (LM) "Eagle"',
    role: 'Nave de Alunizaje y Exploración de Superficie',
    height: '7.0 m (23 ft con patas desplegadas)',
    diameter: '4.2 m (fuselaje) / 9.4 m (patas)',
    mass: '15,100 kg (33,300 lb total)',
    habitableVolume: '4.5 m³ (160 cu ft)',
    propellant: 'Aerozine 50 / N2O4',
    thrust: 'Descenso: 45 kN (regulable) / Ascenso: 15.6 kN',
    discardTime: 'Descenso: en Luna / Ascenso: en órbita lunar',
    description: 'La primera nave espacial tripulada diseñada exclusivamente para operar en el vacío del espacio y alunizar. Compuesta por dos etapas: la etapa de descenso (dorada con patas) y la etapa de ascenso (cabina presurizada facetada donde viajaban Armstrong y Aldrin).',
    hasCutaway: true,
    cutawayTitle: 'Interior del Lunar Module (Eagle)',
    cutawayDetails: 'Cabina presurizada extremadamente optimizada: los dos astronautas viajaban de pie sujetos por arneses de tensión para ahorrar el peso de los asientos. Dos ventanas triangulares inclinadas hacia abajo daban visibilidad de la superficie. En el frontal se ubicaba el panel de control, el DEDA (Display and Keyboard) del ordenador AGC y la escotilla cuadrada de salida para los paseos lunares (EVA).',
    cameraOffset: { x: 4.5, y: 13.8, z: 8 },
    cameraTarget: { x: 0, y: 13.3, z: 0 },
    stats: [
      { label: 'Tripulación', value: '2 astronautas (de pie)' },
      { label: 'Tiempo en superficie', value: '21.6 horas' },
      { label: 'Aislamiento térmico', value: 'Kapton / Mylar dorado' }
    ]
  },
  iu: {
    id: 'iu',
    name: 'Instrument Unit (IU)',
    role: 'Cerebro Autónomo de Guiado y Navegación del Cohete',
    height: '0.91 m (3 ft)',
    diameter: '6.6 m (21.7 ft)',
    mass: '1,996 kg (4,400 lb)',
    propellant: 'N/A (Baterías de plata-zinc)',
    thrust: 'N/A',
    burnTime: 'Control continuo durante 6 horas',
    discardTime: 'T+ 004:17 (con la etapa S-IVB)',
    description: 'Un anillo estructural montado en la parte superior de la tercera etapa S-IVB. Contenía la computadora de vuelo digital Launch Vehicle Digital Computer (LVDC), la plataforma inercial giroestabilizada ST-124-M3, transmisores de telemetría y sistemas de refrigeración. Guiaba al Saturn V desde el despegue hasta la inyección translunar.',
    hasCutaway: false,
    cameraOffset: { x: 6, y: 12.5, z: 11 },
    cameraTarget: { x: 0, y: 12.0, z: 0 },
    stats: [
      { label: 'Computador LVDC', value: '12,190 instrucciones/s' },
      { label: 'Memoria magnética', value: '32,768 palabras (26 bits)' },
      { label: 'Fabricante', value: 'IBM Federal Systems' }
    ]
  },
  s4b: {
    id: 's4b',
    name: 'S-IVB (Tercera Etapa)',
    role: 'Inserción Orbital e Inyección Translunar (TLI)',
    height: '17.8 m (58.4 ft)',
    diameter: '6.6 m (21.7 ft)',
    mass: '119,900 kg (264,300 lb cargado)',
    propellant: 'LH2 (Hidrógeno Liq.) + LOX (Oxígeno Liq.)',
    thrust: '1,000 kN (225,000 lbf) 1x motor J-2',
    burnTime: '2 quemas: 150 s (órbita) + 348 s (TLI)',
    discardTime: 'T+ 004:17 (enviada a órbita solar)',
    description: 'Equipada con un único motor Rocketdyne J-2 con capacidad de reencendido en el vacío del espacio. Insertó la nave en órbita de estacionamiento terrestre y, 2 horas y media más tarde, ejecutó la trascendental quema TLI para enviar a la tripulación rumbo a la Luna.',
    hasCutaway: false,
    cameraOffset: { x: 8, y: 9.0, z: 15 },
    cameraTarget: { x: 0, y: 8.3, z: 0 },
    stats: [
      { label: 'Motor', value: '1 x Rocketdyne J-2' },
      { label: 'Capacidad de reinicio', value: 'Hasta 3 veces en vacío' },
      { label: 'Tanques', value: 'Mamparo común LOX/LH2' }
    ]
  },
  s2: {
    id: 's2',
    name: 'S-II (Segunda Etapa)',
    role: 'Aceleración a Gran Altitud y Salida Atmosférica',
    height: '24.8 m (81.5 ft)',
    diameter: '10.0 m (33 ft)',
    mass: '480,000 kg (1,060,000 lb cargado)',
    propellant: 'LH2 (Hidrógeno Liq.) + LOX (Oxígeno Liq.)',
    thrust: '5,000 kN (1,150,000 lbf) 5x motores J-2',
    burnTime: '360 segundos (6 minutos)',
    discardTime: 'T+ 000:09:08 (reentrada destructiva)',
    description: 'La etapa criogénica más grande jamás construida en su época. Al utilizar hidrógeno líquido como combustible y oxígeno líquido como oxidante, ofrecía un altísimo impulso específico (Isp). Sus 5 motores J-2 aceleraron el vehículo de 9,900 km/h a más de 24,600 km/h.',
    hasCutaway: false,
    cameraOffset: { x: 11, y: 0.5, z: 20 },
    cameraTarget: { x: 0, y: -0.2, z: 0 },
    stats: [
      { label: 'Motores', value: '5 x Rocketdyne J-2' },
      { label: 'Aislamiento', value: 'Poliuretano y fibra de vidrio' },
      { label: 'Fabricante', value: 'North American Aviation' }
    ]
  },
  s1c: {
    id: 's1c',
    name: 'S-IC (Primera Etapa)',
    role: 'Impulso Inicial de Despegue y Salida de la Tierra',
    height: '42.1 m (138 ft)',
    diameter: '10.0 m (33 ft)',
    mass: '2,280,000 kg (5,030,000 lb cargado)',
    propellant: 'RP-1 (Kerosene refinado) + LOX (Oxígeno Liq.)',
    thrust: '34,500 kN (7,750,000 lbf) 5x motores F-1',
    burnTime: '161 segundos (2 min 41 s)',
    discardTime: 'T+ 000:02:42 (impacto en Océano Atlántico)',
    description: 'La colosal primera etapa del Saturn V. Construida por Boeing, albergaba más de 2,100 toneladas de combustible y oxidante. Sus cinco gigantescos motores Rocketdyne F-1 (4 exteriores sobre cardán de empuje y 1 central fijo) consumían 13 toneladas de combustible por segundo para vencer la gravedad terrestre.',
    hasCutaway: false,
    cameraOffset: { x: 14, y: -12.0, z: 26 },
    cameraTarget: { x: 0, y: -13.6, z: 0 },
    stats: [
      { label: 'Motores', value: '5 x Rocketdyne F-1' },
      { label: 'Consumo conjunto', value: '12,890 kg/segundo' },
      { label: 'Aletas estabilizadoras', value: '4 aletas de titanio' }
    ]
  }
};
