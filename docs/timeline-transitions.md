# Navegación de la cronología

## Comportamiento

- Cada etapa tiene un estado final de posición, orientación, escala y visibilidad, independiente del recorrido.
- Seleccionar una etapa posterior N prepara el estado N−1 y reproduce sólo su acontecimiento final. No se encadenan animaciones de etapas omitidas.
- Seleccionar una etapa anterior, o repetir la actual, restaura su estado final y ajusta brevemente la cámara. No se recrean acoplamientos imposibles en reversa.
- Una selección interrumpe los tweens del vehículo y de cámara. Si la cámara estaba a mitad de transición, también se normaliza su encuadre antes del siguiente acontecimiento.
- Una selección manual pausa el autoplay. Cambiar de modo cancela la transición; volver a Cronología restaura la etapa seleccionada.

## Implementación localizada

`js/three/TimelineTransitions.js` distingue estados finales (`stateAt`, `setStageState`) de navegación (`transitionTo`). Reutiliza las poses de `StageAnimator` evaluadas sin duración ni efectos y las guarda en una caché. El estado incluye los descendientes, no sólo los grupos principales. La orientación global de inspección se conserva.

Las piezas descartadas se ocultan en el estado final. Sólo las que se separan en el acontecimiento seleccionado tienen una trayectoria de salida temporal; conservan sus propios descendientes y no recuperan piezas obsoletas. CM y SM mantienen una unión rígida cuando corresponde. La apertura del SLA usa su bisagra radial; los paracaídas conservan el anclaje al CM mientras se despliegan.

`CameraChoreographer` reconoce las referencias `lm_ascent` y `sla_panels`, excluye geometría oculta y calcula el encuadre con el espacio disponible entre paneles. Mantiene el ángulo de observación. `EffectsManager` hace que los efectos existentes sigan la transformación mundial de su componente.

`app.js` utiliza el mismo controlador para toda la cronología y para volver desde Componentes. `TimelineUI.js` detiene el temporizador del autoplay ante navegación manual. `index.html` actualiza la referencia de caché. El contenido de `missionData.js` y la interfaz de cronología no cambian.

## Verificación realizada

Auditoría visual local en navegador, con vista de escritorio de 1280 × 720:

- Recorrido de las 24 etapas en orden, con observación de la configuración inicial y final de los acontecimientos.
- Separaciones S-IC, S-II, CSM, extracción S-IVB/SLA, separación lunar y SM.
- Apertura del SLA, giro unido del CSM y acoplamiento; continuidad PDI → Alunizaje; ascenso y reencuentro lunar.
- Reentrada, despliegue de paracaídas conectados al CM y amerizaje.
- Saltos Inicio → PDI, Inicio → TEI, Max Q → Extracción y Extracción → Reencuentro.
- Retrocesos Amerizaje → Inicio, PDI → Acoplamiento y Reencuentro → Ascenso.
- Selecciones rápidas durante separaciones, apertura, extracción, PDI, paracaídas y TEI.
- Pausa del autoplay al seleccionar una etapa manualmente.
- Cambio a Componentes durante el despliegue de paracaídas y restauración de su estado al volver.
- Consola sin errores en la pasada final.

Prueba automática con el modelo real de RocketBuilder, Three.js 0.160.0 y GSAP 3.12.5 (mismas versiones que index.html):

- 576 pares de origen y destino con comparación completa del estado final.
- 69 interrupciones en distintos momentos de una transición.
- Visibilidad durante el salto a Extracción, descarte del descenso del LM y ausencia de tweens residuales.
- Conservación de la unión CM–SM y de la orientación global de inspección.
- Encuadre de LM Ascent y coincidencia de cámara entre PDI y Alunizaje.

Para ejecutar la prueba con copias locales de esas dependencias:

```sh
node tests/timeline-transitions.mjs /ruta/three.module.mjs /ruta/gsap.cjs
```

Las pruebas automáticas verifican estados e invariantes; la auditoría visual verifica la presentación de las transiciones. Los cambios permanecen locales.
