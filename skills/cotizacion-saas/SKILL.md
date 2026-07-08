---
name: cotizacion-saas
description: "Genera cotizaciones profesionales de software, plataformas SaaS o proyectos de desarrollo a la medida. Usa este skill siempre que el usuario mencione: cotización de software, propuesta técnica y económica, pricing de plataforma, modelo de suscripción para software, cotizar un ERP, cotizar un sistema, propuesta para cliente de desarrollo, estructura de cobro mensual/anual con código fuente, modelo win-win de software, penalización de salida anticipada, o cualquier variante de generar un documento de cotización formal para un proyecto de tecnología. También aplica cuando el usuario quiera revisar, mejorar o reestructurar una cotización existente de software/SaaS, o cuando pida análisis de huecos legales y oportunidades de mejora en una propuesta comercial de tecnología."
---

# Cotización Profesional de Software / SaaS

## PASO 0 — Verificar versión más reciente (OBLIGATORIO, antes de todo)

Antes de generar o revisar cualquier cotización, verifica que estás usando la ÚLTIMA versión de este skill publicada en GitHub y actualiza la copia local si cambió. El repo es la fuente de verdad:

**Repo fuente:** `https://github.com/scrumexpress-cell/kott-claude-skills` · archivo `skills/cotizacion-saas/SKILL.md`

1. Descarga el SKILL.md remoto (usa el que funcione):
   - `gh api repos/scrumexpress-cell/kott-claude-skills/contents/skills/cotizacion-saas/SKILL.md --jq .content | base64 --decode > /tmp/skill_remoto.md`
   - o crudo: `curl -sL https://raw.githubusercontent.com/scrumexpress-cell/kott-claude-skills/main/skills/cotizacion-saas/SKILL.md -o /tmp/skill_remoto.md`
2. Compáralo con este archivo local (`~/.claude/skills/cotizacion-saas/SKILL.md`) — p. ej. con `diff`.
3. Si difieren, **sobrescribe el local con el remoto**, avisa al usuario en una línea ("actualicé el skill a la última versión del repo") y **continúa aplicando la versión actualizada** (vuelve a leer el SKILL.md ya actualizado).
4. Si el repo no es accesible (sin red / sin `gh` / sin `curl`), continúa con la versión local y avísale al usuario que no pudo verificarse.

No omitas este paso: garantiza que las reglas (formato de salida en PDF, datos de pago del proveedor, estructura del documento) sean siempre las más recientes que el usuario mantiene en el repo.

## Propósito

Este skill genera cotizaciones formales, estructuradas y profesionales para proyectos de software, plataformas SaaS o ERPs a la medida. Está diseñado para producir documentos que funcionen tanto como herramienta de venta como base para un contrato de servicios.

## Cuándo usar este skill

- El usuario quiere cotizar un proyecto de software para un cliente
- Necesita reestructurar una cotización existente
- Quiere definir un modelo comercial (suscripción, licencia, híbrido)
- Necesita analizar huecos legales o mejorar una propuesta
- Quiere crear una propuesta técnica y económica formal

## Estructura del documento de cotización

Toda cotización debe incluir estas secciones en este orden. Adaptar el contenido al proyecto específico pero mantener la estructura:

### 1. Portada
- Nombre del proyecto/plataforma como título principal
- Subtítulo: "Propuesta Técnica y Económica"
- Tabla visual de dos columnas (label en negrita / valor) con estos campos:
  - **Preparado para:** Cliente + Razón social + Atención a
  - **Preparado por:** Proveedor + Razón social + Responsable legal
  - **Fecha** (mes + año)
  - **Versión** (numeración decimal: 1.0, 2.0, 4.0)
  - **Vigencia** (típicamente 30 días naturales desde emisión)
- Logos del cliente (y proveedor) centrados arriba de la tabla
- Nota de confidencialidad al pie: "Documento confidencial. Prohibida su reproducción sin autorización."

### 2. Contenido / Índice
- Lista numerada de todas las secciones
- **El primer elemento del índice siempre es el One-Pager de Hallazgos** (sección 3 del documento, posterior a portada e índice, pero primer contenido sustantivo)

### 3. One-Pager de Hallazgos de la Exploración
- **Debe ser el primer contenido sustantivo del documento** (justo después de portada e índice, antes del Resumen Ejecutivo)
- Ocupa **una sola página** — es un resumen visual de alto impacto que conecta la conversación con el cliente con la propuesta que sigue
- Encabezado breve (1-2 líneas): "Esto es lo que escuchamos en nuestra exploración con [Cliente] y cómo lo resolvemos."
- **Infografía horizontal de 3 columnas** con estos bloques (en este orden):

  **Columna 1 — Dolores Detectados**
  - Icono de alerta/dolor (⚠️ o equivalente visual)
  - Header: "Dolores Detectados"
  - 3-5 bullets cortos con los dolores específicos mencionados por el cliente (verbatim del lenguaje del cliente cuando sea posible)
  - Cada bullet en una línea, máximo 12 palabras
  - Color de acento: rojo/naranja oscuro para denotar problema

  **Columna 2 — Hipótesis de Solución**
  - Icono de lámpara/idea (💡 o equivalente)
  - Header: "Hipótesis de Solución"
  - 3-5 bullets que respondan 1:1 a los dolores de la columna 1 (mismo orden)
  - Lenguaje de acción: "Automatización de X", "Portal único para Y", "Agente IA que Z"
  - Color de acento: naranja corporativo #E85D1F

  **Columna 3 — KPI que Impacta en tu Empresa**
  - Icono de gráfica/crecimiento (📈 o equivalente)
  - Header: "KPI que Impacta en tu Empresa"
  - 3-5 bullets con métricas concretas y cuantificables que mejorarán
  - Formato: "Reducción de X% en [métrica]", "Ahorro de Y horas/mes en [proceso]", "Tiempo de respuesta de Z días → W horas"
  - Si no se tienen cifras del cliente, usar rangos o benchmarks de industria con nota al pie ("Estimado base en proyectos similares")
  - Color de acento: verde para denotar resultado positivo

- **Reglas de la infografía:**
  - Las 3 columnas deben tener el **mismo número de bullets** y estar alineadas horizontalmente (dolor 1 → solución 1 → KPI 1)
  - Usar tabla de 3 columnas en docx con bordes sutiles o sin bordes, con headers de color diferente por columna
  - No saturar: máximo 5 puntos por columna; si hay más dolores, elegir los 5 de mayor peso estratégico
  - Cerrar la página con una línea de transición: "El resto de este documento detalla cómo lo construimos, qué incluye, cuánto cuesta y bajo qué condiciones."

- **Origen del contenido:**
  - Dolores: extraer de transcripciones de reuniones, notas de descubrimiento, correos previos
  - Hipótesis: derivar del alcance funcional de la sección 5; debe haber coherencia 1:1
  - KPIs: validar con el cliente cuando sea posible; si no, usar estimaciones conservadoras y marcarlas como tales

- **🚫 REGLA CRÍTICA — Nunca exponer bugs/defectos del sistema en el One-Pager:**
  Los dolores deben describir EXCLUSIVAMENTE la realidad operativa del cliente ANTES de tu sistema (procesos manuales, Excel, correos, llamadas, sin visibilidad). NUNCA listes como "dolor" un bug, defecto o regresión que TU sistema haya tenido y que después arreglaste. Frases como *"Bug: el sistema sobrescribía X"*, *"Antes el portal no validaba Y"*, *"Se rompía cuando Z"* leen como "el sistema viene con defectos" en la cabeza de un cliente que está decidiendo si firmar.
  - Si hay un fix relevante, va al **changelog interno** o a una sección de "Mejoras del último ciclo" como historial técnico, NUNCA en el documento de venta.
  - Si el bug refleja un proceso real del cliente que era confuso (ej. "no había claridad entre quién solicitó vs quién está asignado"), **reformúlalo desde la óptica operativa del cliente**: "Trazabilidad confusa entre ejecutivo del cliente y responsable de revisión" — eso sí es un dolor legítimo del cliente, no un bug del sistema.
  - Regla de oro: si lees el One-Pager poniéndote en los zapatos del que va a firmar, ninguna frase debería hacerlo dudar de la calidad de lo que ya está construido.

### 4. Resumen Ejecutivo
- Descripción de la solución en 1-2 párrafos
- Cifras clave en formato visual (súper-módulos, sub-módulos, usuarios, etc.)
- Resumen del modelo comercial en lenguaje ejecutivo (no técnico)
- Diferenciador principal (ej: propiedad del código, sin lock-in)

### 5. Alcance Funcional
- Organizar por módulos/súper-módulos
- Para cada módulo: nombre como header, sub-módulos con bullets de funcionalidades clave
- **Incluir screenshot real del módulo debajo de la descripción** — es el diferenciador visual más poderoso del documento. Si no hay capturas disponibles, solicitarlas al usuario antes de generar el .docx o dejar placeholder explícito.
- Ser específico en funcionalidades (no genérico): verbos de acción + entidad + beneficio
- Destacar funcionalidades de IA con texto como "clasificación automática por IA", "detector de anomalías", "predicción de cobranza IA", "asistente IA con resumen en lenguaje natural"
- Si algún módulo tiene integración futura pendiente (ej. nómina externa), aclarar que "la integración completa se cotizará por separado"

### 6. Infraestructura y Tecnología — ⚠️ OMITIR POR DEFAULT (el usuario pidió eliminarla)
- NO incluir esta sección salvo que el usuario la pida explícitamente para una cotización en particular (p. ej. cliente con área de TI que la exige).
- Si se pide: tabla "Componente / Detalle" (Base de datos, Autenticación y Roles, Almacenamiento, Edge Functions, Aplicación web, Repositorio GitHub, Seguridad), stack en una línea y nota de portabilidad ("tecnologías estándar y de código abierto, sin dependencia de proveedor propietario; el cliente puede migrar a cualquier infraestructura compatible").
- La garantía de propiedad/portabilidad que le importa al cliente vive en la sección de Modelo Comercial y Propiedad del Código.

### 7. Modelo Comercial y Propiedad del Código
- Filosofía del modelo (transparencia, sin dependencia)
- Garantías de propiedad del código
- Modelo de entrega (SaaS, licencia perpetua, híbrido)
- Libertad de salida del cliente
- Sincronización de código (GitHub)

### 8. Inversión / Resumen Financiero
- Inversión inicial (si aplica) con desglose
- Suscripción recurrente: plan mensual vs. anual con descuento
- Resumen comparativo (Año 1 mensual vs. anual, Año 2+)
- Nota sobre IVA y facturación
- Hora adicional con tarifa preferencial vs. mercado

### 9. Penalización por Terminación Anticipada
- Tabla con períodos y porcentajes decrecientes + **columna de "Máximo"** en MXN para dar certeza numérica
- Qué conserva el cliente al salir — **listar explícitamente como bullets**:
  - 100% del código fuente, base de datos y documentación
  - Respaldo completo de la base de datos en formato SQL
  - Documentación de despliegue para infraestructura propia
- Punto de corte donde la salida es libre ("Mes 13 en adelante: $0, con 30 días de aviso previo")

### 10. Qué Incluye la Suscripción
- Tabla detallada "Servicio / Descripción" con filas: Infraestructura dedicada, Soporte técnico (horario + SLA de respuesta), Horas de mejora y adaptación, Actualizaciones de software, Inteligencia Artificial (API costs incluidos), Monitoreo y disponibilidad (SLA uptime), Capacitación continua
- Horas de mejora: cantidad mensual, ejemplos concretos de qué cubre (configurar nueva oficina, modificar reporte, ajustar campos, crear filtros)
- **Acumulación de horas**: las horas no utilizadas se acumulan **dentro del semestre en curso** y expiran al cierre del semestre (no es acumulación indefinida, pero tampoco "úsala o piérdela" mensual)
- **Módulo interno de tracking de horas y funcionalidades**: mencionar que la plataforma incluye un seguimiento transparente donde el proveedor registra cada funcionalidad desarrollada con complejidad estimada y tiempo real. Esto es diferenciador de transparencia.
- Horas adicionales: tarifa preferencial + comparación explícita con mercado (ej. "$850 MXN/hora vs. $1,200 MXN/hora de mercado")
- Lista de modificaciones mayores que se cotizan aparte (integraciones externas, portales nuevos, sistemas de notificaciones, módulos IA adicionales)

### 11. Cronograma de Implementación
- Fases con actividades y duración
- Si hay MVP disponible, indicar acceso inmediato
- Horas de adaptación incluidas en el primer mes
- Forma de pago ligada al cronograma

### 12. Condiciones Generales
Incluir estas subsecciones (cada una como header de nivel 3 dentro de la sección):

- **Propiedad Intelectual** — Código es propiedad del cliente desde su creación; proveedor cede derechos patrimoniales; repositorio GitHub siempre actualizado.
- **Confidencialidad** — Bidireccional, durante y después del contrato. Datos del cliente son del cliente.
- **Vigencia y Renovación** — Sin permanencia obligatoria; penalización decreciente en primeros 12 meses; cancelación libre desde mes 13 con 30 días de aviso; renovación automática por periodos de 12 meses.
- **Facturación** — Desglose de: inversión inicial (100% al firmar), mensualidad (primeros 5 días del mes), plan anual (factura única al inicio de cada periodo), precios antes de IVA (16% si CFDI), método de pago.
- **Datos para Pago** — Presentar **dos opciones claramente separadas**:
  - *Opción A — Sin CFDI* (persona física): beneficiario, banco, CLABE, cuenta, sucursal
  - *Opción B — Con CFDI* (persona moral): beneficiario (razón social), banco, CLABE, contrato, requisitos CFDI (constancia de situación fiscal, uso de CFDI, correo)
  - **Importante:** siempre presentar ambas opciones. Para montos grandes, recomendar persona moral por respaldo legal.
- **Mora en Pagos** — Cargo por mora de 5% mensual sobre monto vencido si no se paga dentro de los primeros 10 días naturales; suspensión de servicio a partir de 30 días de atraso; la suspensión no exime del pago de mensualidades del periodo de atraso.
- **Protección de Propiedad Intelectual Genérica** — Cliente se compromete a no comercializar, sublicenciar, distribuir ni revender el software (total o en partes sustanciales) a terceros, especialmente a empresas del mismo giro. Código es para uso interno exclusivo del cliente. Esta cláusula protege al proveedor sin limitar el uso interno del cliente.
- **Vigencia de la Cotización** — 30 días naturales desde la fecha de emisión; precios sujetos a cambio después.
- **Nota de Cotización ≠ Contrato** — Cerrar con: "El presente documento constituye una cotización y no un contrato. En caso de que ambas partes estén interesadas en llevar a cabo el proyecto, se procederá a la firma de un contrato de prestación de servicios que detalle todas las condiciones aquí descritas, así como cualquier aspecto adicional no especificado en esta cotización."

### 🚫 Secciones ELIMINADAS del formato (decisión permanente del usuario — NO incluirlas)
- **Glosario de Términos** — NO incluir nunca. Si un tecnicismo es imprescindible, explicarlo entre paréntesis en el mismo lugar donde aparece.
- **Cierre / Call to Action** ("¿Comenzamos?") — NO incluir. Los datos de contacto van completos en la PORTADA (Preparado por: nombre, correo, teléfono); el documento termina con Condiciones Generales / Datos para Pago.

## Modelos comerciales típicos

### Modelo A: Suscripción Pura (todo incluido)
- Sin inversión inicial fuerte
- Desarrollo amortizado en la mensualidad
- Permanencia mínima de 18-24 meses
- Penalización decreciente durante el período mínimo
- Después del período mínimo: salida libre

### Modelo B: Híbrido (inversión inicial + suscripción)
- Inversión inicial que cubre desarrollo e implementación
- Mensualidad más baja que cubre operación y mejoras
- Penalización más corta (12 meses) porque la inversión inicial ya cubre parte del desarrollo
- Recomendado cuando el cliente quiere un MVP inmediato

### Modelo C: Licencia Perpetua + Mantenimiento
- Pago único por el software
- Mantenimiento anual opcional (15-20% del costo de licencia)
- El cliente es dueño desde el día 1
- Menor recurrencia para el proveedor

## Estructura de penalización decreciente

La penalización protege la inversión de desarrollo del proveedor. El principio es: a medida que pasa el tiempo, el proveedor ya recuperó más de su inversión, así que la penalización baja.

Ejemplo para modelo híbrido (12 meses):
- Meses 1-6: 60% de mensualidades restantes hasta mes 12
- Meses 7-9: 40% de mensualidades restantes
- Meses 10-12: 20% de mensualidades restantes
- Mes 13+: $0, salida libre con 30 días de aviso

Ejemplo para modelo suscripción pura (24 meses):
- Meses 1-6: 75% del saldo restante
- Meses 7-12: 50% del saldo restante
- Meses 13-18: 25% del saldo restante
- Meses 19-24: 10% del saldo restante
- Mes 25+: $0, salida libre

Incluir siempre el monto máximo de penalización por rango para dar certeza al cliente.

## Checklist de huecos legales a cubrir

Al generar o revisar una cotización, verificar que estén cubiertos estos puntos. Si falta alguno, señalarlo al usuario:

1. **Criterios de aceptación del entregable** — ¿Qué define que el MVP/sistema está "listo"? Sin esto, el cliente puede rechazar indefinidamente.
2. **Mecanismo de resolución de disputas** — Mediación, arbitraje, jurisdicción. Sin esto, cualquier desacuerdo escala a litigio directo.
3. **Cláusula de mora** — Ya cubierta en la estructura (5% mensual + suspensión a 30 días). Verificar que esté presente con números concretos.
4. **Fuerza mayor** — Eventos fuera del control de ambas partes.
5. **Validación de horas consumidas** — Reporte transparente de horas de mejora usadas vs. disponibles (módulo interno de tracking).
6. **Definición de "mejora sencilla" vs. "módulo nuevo"** — Criterio objetivo para clasificar solicitudes. Usar ejemplos concretos en ambas direcciones.
7. **SLA con consecuencias** — Tiempos de respuesta sin penalización no sirven. Definir créditos o compensaciones si se incumple el uptime 99.5%.
8. **Acumulación de horas** — Regla clara: acumulación dentro del semestre en curso, expiran al cierre del semestre.
9. **Datos post-terminación** — ¿Cuánto tiempo conserva el proveedor los datos? ¿Obligación de borrarlos tras entrega del respaldo SQL?
10. **Persona jurídica vs. física para cobro** — Ofrecer ambas opciones (con/sin CFDI). Para montos grandes o clientes corporativos, recomendar siempre persona moral.
11. **Protección de IP genérica del proveedor** — Cláusula anti-reventa: el cliente no puede comercializar ni sublicenciar el código a terceros del mismo giro. Ya cubierta en la estructura.
12. **Documentación técnica** — Obligación de entregar y mantener actualizada la documentación para que un tercero pueda continuar el proyecto.
13. **IP preexistente** — Distinguir código personalizado (del cliente) de frameworks/herramientas genéricas del proveedor.
14. **Aclaración cotización ≠ contrato** — Siempre cerrar con la nota de que el documento no constituye contrato y que se firmará uno aparte.
15. **Coherencia One-Pager ↔ Alcance** — Verificar que cada dolor del one-pager tenga una hipótesis de solución reflejada en el alcance funcional, y que cada KPI prometido sea defendible con la funcionalidad ofrecida. Si hay un dolor sin solución en el alcance, o un KPI sin mecanismo claro para alcanzarlo, marcarlo.

## Formato de salida

- **Documento COMPACTO (objetivo: 5-6 páginas).** Agrupar secciones afines para que fluyan sin saltos de página forzados (p. ej. Hallazgos+Resumen Ejecutivo; Modelo Comercial+Inversión+Suscripción+Penalización+Cronograma). Omitir el índice si el documento queda corto. Condiciones Generales en tabla compacta de 2 columnas (Condición / Detalle), no como sub-secciones con encabezado.
- **El entregable FINAL siempre es un PDF.** Genera el documento como `.docx` (con el skill de docx) y luego conviértelo a PDF; el PDF es lo que se entrega al usuario. Conserva el `.docx` como archivo fuente editable, pero el output principal es el `.pdf`.
  - Conversión (elige según el sistema):
    - **Linux/macOS o sandbox:** `python <skill-docx>/scripts/office/soffice.py --headless --convert-to pdf cotizacion.docx` (LibreOffice). OJO: ese script usa `socket.AF_UNIX` y FALLA en Windows.
    - **Windows:** si hay Microsoft Word instalado, `python -c "from docx2pdf import convert; convert('cotizacion.docx','cotizacion.pdf')"` (usa Word por COM; alta fidelidad). Si no hay Word pero sí LibreOffice, llamar `soffice.exe --headless --convert-to pdf` directamente (no el script del skill).
  - Nombra el archivo `Cotizacion_<Cliente>_v<N>.pdf` y déjalo en el working dir del usuario.
  - Si la conversión a PDF falla, entrega el `.docx` e indícalo explícitamente, pero intenta el PDF primero.
- Tipografía: Arial (o sans-serif limpio equivalente)
- Paleta corporativa: naranja #E85D1F (acento/headers), gris oscuro #333 (texto), blanco para fondo
- Tablas con bordes suaves, headers con fondo oscuro + texto blanco, filas alternadas
- Headers y footers: "Agilidad en Digital · Propuesta Confidencial" en izquierda, número de página en derecha
- Portada con espaciado generoso, logo grande centrado, tabla label/valor
- Screenshots de módulos insertados a ancho completo debajo de cada descripción funcional
- Cifras clave del resumen ejecutivo en formato de "tarjetas" horizontales (ej: "5 súper-módulos | 15+ sub-módulos | 3 oficinas | IA integrada")

## Anti-patrones — NUNCA hacer

- **Exponer defectos del propio sistema en el documento de venta.** Los pain points del One-Pager describen la realidad del cliente ANTES de la plataforma, no fixes hechos sobre tu propio código. Ver regla crítica en sección 3 del documento.
- **Mezclar el changelog del producto con la cotización.** El cliente que firma no quiere leer "v1.2 arregló X, v1.3 mejoró Y". Quiere leer "esto resuelve tu problema operativo Z". El changelog va en una página interna del producto (ej. `/changelog`), no en el PDF de venta.
- **Listar "limpieza de warnings", "fix de bug", "refactor" como entregables.** Si vas a presentar mejoras hechas, frasealas en términos de outcome para el cliente, no de actividad técnica del proveedor.
- **Prometer KPIs sin mecanismo claro para alcanzarlos.** Si dices "−40% de llamadas al ejecutivo", debe haber una funcionalidad concreta en el alcance que justifique esa reducción. Si no, baja el KPI o quítalo.

## Cotizaciones en USD con cliente mexicano

Cuando la cotización vaya en dólares (USD) y el cliente sea mexicano:

- **Aclarar moneda explícitamente en cada precio**: "$18,000 USD" no solo "$18,000" — para evitar confusión con MXN.
- **Nota obligatoria sobre IVA y CFDI**: "Precios expresados en USD antes de IVA. Si Grupo X requiere CFDI, se factura en MXN al tipo de cambio Banxico (DOF) del día de emisión + IVA 16%. Si el pago se realiza a cuenta extranjera en USD, no se emite CFDI mexicano."
- **Opción A (sin CFDI)** puede ser cuenta USD (US bank account, Wise, Mercury). **Opción B (con CFDI)** siempre es cuenta MXN de persona moral mexicana.
- **Tabla de penalización**: mantener los montos máximos en la misma moneda de la cotización (USD si es USD), no convertir.
- **Hora adicional**: también en USD con comparativo de mercado en USD (ej. "$50 USD/hora vs $80 USD/hora de mercado para senior comparable").
- **Forma de pago anual**: si es plan anual, ofrecer pago en USD a cuenta extranjera con descuento mantenido. Si requieren CFDI anual, la conversión MXN se hace una sola vez al firmar.

## Notas importantes

- Los montos siempre deben ir antes de IVA con nota explícita ("+ IVA si se requiere factura")
- Incluir vigencia de la cotización (30 días es estándar)
- Si el cliente pidió propiedad del código, el modelo debe garantizarlo desde el día 1, no al final del contrato
- La penalización debe ser justa para ambos: protege al proveedor sin ser abusiva para el cliente
- Siempre recomendar que la cotización se acompañe de un contrato de prestación de servicios formal
- **Control de versiones**: numerar la cotización (1.0, 2.0, 3.0...) y mencionar la versión en la portada. Si el cliente pide cambios, sube de versión.
- **Datos bancarios**: nunca ocultar la opción sin CFDI si el cliente la pide, pero siempre ofrecer ambas.
- **Screenshots reales > mockups > placeholders**: la credibilidad del documento depende en gran medida de mostrar la plataforma real en funcionamiento.

## Análisis dual (si el usuario lo solicita)

Cuando el usuario pida revisar la cotización "como cliente y como proveedor":

**Perspectiva del cliente — buscar:**
- Ambigüedades que puedan usarse en su contra
- Compromisos del proveedor sin consecuencias por incumplimiento
- Costos ocultos o no claros
- Dependencias que limiten su libertad de salida
- Falta de mecanismos de verificación (horas, calidad, SLA)

**Perspectiva del proveedor — buscar:**
- Riesgos de no recuperar inversión
- Scope creep potencial (horas de mejora abiertas a interpretación)
- Falta de protección ante impago (verificar cláusula de mora)
- Vulnerabilidades de propiedad intelectual (verificar anti-reventa)
- Compromisos operativos insostenibles (SLA muy agresivo sin equipo)
