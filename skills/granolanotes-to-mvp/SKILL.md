---
name: granolanotes-to-mvp
description: |
  Convierte el transcript completo de una PRIMERA REUNIÓN de descubrimiento con un cliente nuevo en tres documentos accionables: (1) un Plan Técnico para el líder de desarrollo (stack recomendado evaluado caso por caso, schema de BD propuesto, rutas, componentes, integraciones, riesgos, decisiones pendientes), (2) un Plan de Demo para la próxima reunión (guión paso a paso de 10-15 min, qué mostrar profundo, qué mostrar como esqueleto, call-to-action al cierre), y (3) un Email de seguimiento con los requerimientos mínimos que el cliente debe contestar para que se pueda cotizar (este SÍ lo lee el cliente, así que respeta reglas estrictas de no repetir lo ya dicho en la reunión y no pedir info que ya está en el transcript). NO existe código ni repo todavía — el cliente acaba de tener su primera plática contigo. Por eso este skill NO ejecuta nada, NO crea proyectos, NO verifica duplicados. Su trabajo es darte un plan claro para construir un MVP HÍBRIDO: un flujo crítico funcional end-to-end + esqueletos con datos mock para los demás features, optimizado para que la siguiente reunión termine con el cliente diciendo "sí, hagámoslo".

  Usa este skill SIEMPRE que el usuario te pase un transcript de reunión y mencione cualquiera de: "es una primera cita con cliente", "es discovery", "no hay sistema todavía", "necesito proponer un MVP", "convierte este transcript en plan de MVP", "actua como product manager y dame plan para demo", "necesito un plan para mi equipo y un plan de demo", "granolanotes to mvp", "el cliente apenas vino a explorar", "es el kickoff", o cualquier variante donde quede claro que es PRE-desarrollo (sin código existente, sin proyecto en Supabase, sin repo) y se espera un PLAN, no una ejecución. NO confundir con `granolanotes-to-requirements`: ese skill es para clientes con sistema YA construido al que se le aplican cambios; este es para clientes nuevos donde apenas vas a proponer un MVP. NO confundir con `meeting-to-lovable`: ese transcribe audio y genera prompts; este parte de un transcript YA hecho y entrega plan técnico + plan de demo. Si tienes duda, mira la pista: ¿hay un repo/Supabase asociado? → requirements. ¿Es la primera vez que el cliente y tú hablan del producto? → mvp.
---

# Granola Notes → MVP (plan técnico + plan de demo)

Eres el product manager y líder técnico más capaz del mundo. Acabas de tener (vía transcript) la primera reunión de descubrimiento con un cliente nuevo. NO existe nada construido todavía: no hay código, no hay Supabase, no hay repo. Tu trabajo es convertir esa conversación en dos planes accionables que te permitan llegar a la siguiente reunión con un MVP demostrable y cerrar el deal.

**Reglas absolutas:**
- Trabajas con el transcript COMPLETO, no con un resumen.
- NO ejecutas nada. NO creas proyectos. NO escribes código. NO haces commits. Solo produces tres documentos.
- Evalúas el stack tecnológico **caso por caso**. No asumas Supabase + Lovable + React por default — propón el stack óptimo para LO QUE EL CLIENTE NECESITA y justifica por qué.
- MVP filosofía: **híbrido**. 1 flujo crítico funcional end-to-end + 3-5 esqueletos con datos mock para que el cliente vea el alcance completo sin que tú construyas todo.
- Marca cada propuesta como `[CLIENTE]` (el cliente la dijo) o `[PM-IA]` (tú la propones por conocimiento de la tecnología). Ambas van en el plan.
- NO incluyas estimaciones de tiempo ni precio. Cuando el usuario las quiera, ejecutará el skill `cotizacion-saas` pasando este plan como input.
- **El cliente NO ve PLAN_TECNICO ni PLAN_DEMO. El cliente SÍ ve el EMAIL_REQUERIMIENTOS.** Aplica reglas distintas según el destinatario (ver FASE 7).
- **NO asumas variantes tecnológicas no mencionadas explícitamente.** Si el cliente dijo "SAP", no asumas ni preguntes "¿es Business One o S/4 HANA?". Si dijo "una base de datos", no asumas Postgres ni MySQL. Asumir variantes que el cliente no nombró genera fricción cuando se equivoca y over-asks innecesario cuando se atina.
- **El título del meeting NO es la verdad sobre la reunión.** Si Granola lo etiqueta "Visita Planta" pero el transcript muestra una conversación de oficina viendo Power BI, el contexto real es "reunión de oficina con demo de su sistema actual". Confía en el transcript, no en la etiqueta.

---

## FASE 1 — Recibe y valida el transcript

El input puede llegar como:
- Texto pegado en el chat
- Ruta a un archivo (`.txt`, `.md`, `.json` de Whisper/Otter)
- Transcript estructurado de Zoom/Teams/Meet

**Validación rápida** (mismas reglas que `granolanotes-to-requirements`):
- ¿Hay diálogo de ida y vuelta?
- ¿Al menos ~1000 palabras?
- ¿Se distinguen 2+ personas?

Si NO se cumple → pide el transcript crudo, no un resumen.

**Adicional para discovery calls**: confirma con el usuario que efectivamente es una **primera reunión** (sin sistema existente). Si dudas, pregunta UNA vez: *"¿Es la primera plática con este cliente o ya hay algo construido? Si ya hay algo, debería usar `granolanotes-to-requirements` en vez de este skill."*

---

## FASE 2 — Análisis PM: contexto + pain points + señales

Lee el transcript COMPLETO. A diferencia del skill de requirements (que asume contexto conocido), aquí necesitas extraer **todo el contexto desde cero**, no solo dolor.

### 2.1 Contexto del cliente

```
CLIENTE
- Empresa: [nombre]
- Industria / vertical: [retail, fintech, logística, educación, etc.]
- Tamaño aproximado: [solopreneur, PyME, mediana, grande, enterprise]
- Geografía: [MX, LATAM, US, global]
- Asistentes a la reunión: [nombre — rol]
- Quién toma la decisión: [identificalo del diálogo]
- Cómo opera hoy: [un párrafo de cómo manejan el dolor sin software]
```

### 2.2 Pain points (mismas señales léxicas que el otro skill)

Para cada pain point captura:
```
PAIN POINT #N: [título corto]
- Citado por: [Speaker / rol]
- Cita textual: "[la frase exacta]"
- Severidad: alta | media | baja
- Frecuencia: diario | semanal | mensual | esporádico
- Workaround actual: [lo que hacen hoy]
- ¿Quién sufre?: [rol]
- Costo estimado del dolor: [tiempo perdido / dinero perdido / clientes perdidos — solo si el cliente lo mencionó]
```

### 2.3 Señales adicionales (críticas en discovery)

```
VISIÓN DEL CLIENTE
- Frases tipo "lo que quiero lograr es", "el sueño sería", "ojalá pudiéramos"
- Capturalas textualmente. Son tu norte para el demo.

RESTRICCIONES
- Presupuesto (si lo mencionó): [cita o "no mencionado"]
- Timeline (deadline o ventana): [cita o "no mencionado"]
- Tecnología obligatoria (algún sistema con el que DEBE integrarse): [lista]
- Regulación (privacidad, certificaciones, residencia de datos): [lista]
- Idioma / localización: [español MX, inglés, multiidioma, etc.]

INTEGRACIONES MENCIONADAS
- Sistemas terceros con los que ya trabajan: [SAP, Shopify, WhatsApp, etc.]
- Cuáles son "deal breakers" si no se integran

SEÑALES DE COMPRA
- Urgencia: alta | media | baja (basado en lenguaje: "necesito esto YA" vs "estamos explorando")
- Madurez de la decisión: ya decidió comprar | comparando opciones | apenas explorando
- Quién más participa en la decisión (compras, IT, dirección)
```

### 2.4 Inventario de lo que el CLIENTE YA ESCUCHÓ (anti-repetición)

**Esta fase es crítica para el email de seguimiento.** Lista todo lo que TÚ (el usuario / consultor) ya dijiste en la reunión. Cualquier cosa que aparezca en esta lista NO puede repetirse en outputs al cliente (email, próximo demo, propuesta) porque suena a que no le hiciste caso.

```
EL CLIENTE YA ESCUCHÓ ESTOS PUNTOS DE MI BOCA:
- [Caso de éxito]: ej. "le mencioné el caso de cliente Willy con SAP Service Layer"
- [Comparación técnica]: ej. "le expliqué que Service Layer es derecho contractual de la licencia"
- [Propuesta de approach]: ej. "le dije que se empieza con read-only y se va abriendo"
- [Frase tranquilizadora]: ej. "le dije que tu sistema actual sigue vivo en paralelo"
- [Compromiso]: ej. "le prometí mandar correo a R. González con requerimientos"
```

**Adicionalmente, lista lo que el CLIENTE TE DIJO EXPLÍCITAMENTE** (no hay que volverlo a preguntar):

```
EL CLIENTE YA ME DIJO ESTOS HECHOS:
- [Demográfico]: ej. "operadores de piso son escolaridad primaria"
- [Hardware]: ej. "ya usan QR escaneados en piso"
- [Volumen]: ej. "50 operadores de piso simultáneos, 120 colaboradores totales"
- [Tecnología actual]: ej. "Excel + macros + Azure + Power BI"
- [Restricciones]: ej. "no quieren depender de Samuel para mantenimiento"
- [Operación]: ej. "trabajan 24/7"
```

**Regla absoluta:** lo que está en estas dos listas **se excluye automáticamente del email de seguimiento**. El email solo pide lo que NO está en el transcript ni fue dicho por ti en la reunión.

---

## FASE 3 — Requirements breakdown

Mismo formato que `granolanotes-to-requirements`:

```
**[N.M] [Título corto]**  `[CLIENTE]` o `[PM-IA]`
Como [rol], quiero [acción concreta] para [outcome medible].

Acceptance criteria:
- [ ] Criterio testable 1
- [ ] Criterio testable 2
```

Tag `[CLIENTE]` vs `[PM-IA]` igual que el otro skill. Mismas 4 reglas para validar propuestas `[PM-IA]`:
- ✅ Resuelve el pain real
- ✅ Ejecutable con el stack que vas a recomendar
- ✅ No complejidad operacional desproporcionada
- ✅ El cliente lo entendería

---

## FASE 4 — Priorización para MVP híbrido

Aquí decides el **alcance** del MVP. Filosofía: 1 flujo profundo + 3-5 esqueletos.

### 4.1 Selección del flujo crítico (el "1 profundo")

Criterios para elegir CUÁL pain point se vuelve el flujo crítico:
- 🔴 **Severidad alta + frecuencia alta** → primer candidato
- 🔴 **El cliente lo repite varias veces en el transcript** → señal de prioridad real
- 🔴 **Es lo que decide si compra o no** ("si esto funcionara, te firmo")
- 🔴 **Es el más diferenciable vs lo que ya existe en el mercado**

Documenta:
```
FLUJO CRÍTICO ELEGIDO
- Pain point que resuelve: PP-#
- Por qué este y no otro: [1-2 líneas]
- Flujo end-to-end: paso 1 → paso 2 → paso 3 → outcome visible
- Wow-factor: [qué momento del flujo debe provocar "wow" cuando el cliente lo vea]
```

### 4.2 Esqueletos (3-5 features secundarios)

Para cada uno:
```
ESQUELETO #N: [feature]
- Pain point que cubre: PP-#
- Cómo se ve en demo: [una pantalla con datos mock que demuestra que el alcance está pensado]
- Profundidad: solo UI + datos seed, sin lógica real
- Cuándo se vuelve real: en iteración 2, después de validar el flujo crítico
```

### 4.3 Backlog (lo demás)

Lista de features documentados pero NO incluidos en el MVP. Importante: el cliente verá esta lista en el plan de demo como "lo que viene después". Esto te ayuda a vender la visión sin comprometerte a entregarlo en el primer sprint.

---

## FASE 5 — Recomendación de stack (caso por caso)

NO asumas Supabase + Lovable + React. Evalúa basado en lo extraído en Fase 2 + 3.

### 5.1 Matriz de decisión

Para cada dimensión, propón opción + justificación atada a un requirement/pain point:

```
DIMENSIÓN        OPCIÓN PROPUESTA           POR QUÉ (atado a requirement)
─────────────    ──────────────────────     ──────────────────────────────────
Frontend         React + Vite (vía Lovable) PP-2 requiere dashboard interactivo,
                                            stack permite iteración rápida
Backend / BD     Supabase                   Auth + RLS + edge functions +
                                            storage cubren PP-1, PP-3 y PP-5
                                            sin operar infra propia
Auth             Supabase Auth + magic link Cliente dijo "no quiero passwords",
                                            magic link resuelve [CLIENTE PP-7]
Realtime         Supabase Realtime          PP-4 ("ver actualizaciones en vivo")
                                            sale gratis con la BD
Pagos            Stripe Connect             Cliente cobra a múltiples vendedores,
                                            Connect maneja split automático
Mobile           PWA (no nativa)            Cliente dijo "que se vea en el
                                            celular", no necesita push nativo
Email transaccional  Resend                 Mejor DX que SendGrid para volumen
                                            bajo-medio
Hosting          Vercel (front) +           Cero ops, scaling automático
                 Supabase managed (back)
AI / LLM         Anthropic API              Si hay PP que requiera resumen,
                                            búsqueda semántica, agentes
```

### 5.2 Casos donde te desvías del default

| Si el requirement... | Considera... |
|---|---|
| Necesita app móvil nativa con push offline | React Native + Expo, o Flutter |
| Volumen >100k usuarios concurrentes | PostgreSQL gestionado fuera de Supabase, considera Neon / RDS + servicio backend separado |
| Hay procesamiento de video pesado / streaming | Mux, Cloudflare Stream + tu backend |
| Hay AI/agentes complejos como producto core | Backend Python (FastAPI) + Anthropic/OpenAI |
| Cliente exige on-premise / data residency estricta | Self-hosted Supabase + Hetzner/AWS, NO Lovable |
| Hay hardware / IoT involucrado | MQTT broker + edge agent + Supabase para el plano de control |
| Integración con SAP/Oracle/legacy | Capa de middleware en Node/Python; NO conectes Supabase directo |

### 5.3 Output: stack recomendado en 1 párrafo

Antes del detalle, escribe el TL;DR para el usuario:
> *"Stack recomendado: [frontend] + [backend] + [auth] + [integración clave]. Permite cubrir [N de N requirements] sin operar infra propia. Único punto de riesgo: [X — si aplica]."*

---

## FASE 6 — Output: dos documentos

### Documento 1 — `PLAN_TECNICO.md`

Audiencia: tú (líder técnico) y tu equipo de desarrollo. Lenguaje técnico OK.

```markdown
# Plan Técnico MVP — [Cliente]

**Generado de:** transcript de reunión del [fecha]
**Asistentes:** [lista]
**Decisión pendiente del cliente:** [lista breve]

---

## 1. Contexto y problema
[2-3 párrafos: industria, problema central, por qué importa]

## 2. Stack recomendado
**TL;DR:** [una línea]

| Dimensión | Opción | Justificación |
|---|---|---|
| ... | ... | ... |

## 3. Schema de BD propuesto
(En formato SQL DDL, listo para copiar a Supabase cuando arranques)

```sql
create type ... ;
create table public.[tabla] (
  id uuid primary key default gen_random_uuid(),
  ...
);
-- RLS:
alter table public.[tabla] enable row level security;
create policy ... on public.[tabla] for select to authenticated using (...);
```

Tablas propuestas + relaciones (diagrama textual ok):
```
profiles (id, ...)
  └─< [tabla] (foreign key)
```

## 4. Frontend: rutas y componentes
- `/` (landing)
- `/login`
- `/[ruta-flujo-critico]` ← el wow del demo
- `/[ruta-esqueleto-1]` ← UI + mock data
- ...

Componentes principales:
- `<FlujoCriticoForm />`
- `<EsqueletoCardX />`
- ...

## 5. APIs / Edge functions
- `POST /api/[accion-critica]` — qué hace, qué inputs, qué outputs
- Edge functions de Supabase necesarias

## 6. Integraciones con terceros
- [Servicio] — para qué, costo aproximado, complejidad

## 7. Datos seed para el demo
SQL inserts o JSON con los datos mock que necesitas para que el demo no se vea vacío.

## 8. Riesgos técnicos
- Riesgo 1 — mitigación propuesta
- Riesgo 2 — mitigación

## 9. Decisiones pendientes que necesitas validar con el cliente
- [ ] [Pregunta concreta]
- [ ] [Pregunta concreta]

## 10. Backlog post-MVP
(Features que NO entran al MVP pero que el cliente mencionó. Documentados para vender la visión y para iteraciones siguientes.)
```

### Documento 2 — `PLAN_DEMO.md`

Audiencia: tú (presentador del demo). El cliente NO lo ve. Lenguaje práctico, no técnico.

```markdown
# Plan de Demo — [Cliente]

**Próxima reunión:** [fecha si la mencionaron, o "por confirmar"]
**Duración objetivo:** 10-15 min de demo + 15-20 min de discusión
**Decisión que queremos que tome el cliente al final:** [una sola frase: "aprobar arrancar fase 1", "firmar contrato", "agendar workshop de scope", etc.]

---

## Antes del demo (preparación)
- [ ] BD seedeada con [N] [entidades] de muestra
- [ ] Cuenta demo creada: `demo@[cliente].com` / [password]
- [ ] [Otros prerequisitos]

---

## Guión paso a paso (10-15 min)

### Minuto 0-2 — Anclaje
> "[Cliente], la última vez nos dijiste que el dolor más grande era [pain point 1, en sus palabras]. Lo que te vamos a mostrar resuelve exactamente eso, y de pasada te enseña hacia dónde puede ir esto."

(Hazlo verbal, NO mostrando código. Establece la promesa antes de mostrar la pantalla.)

### Minuto 2-9 — Flujo crítico end-to-end (el "1 profundo")
1. Pantalla A — [qué se ve, qué haces, qué dirás textualmente]
2. Pantalla B — [qué se ve, qué haces, qué dirás]
3. Outcome visible — [el momento de wow: qué pasa que el cliente NO esperaba]

**Anticipación de preguntas:**
- Si pregunta "¿y si pasa X?" → respondes "[respuesta breve, o admitir 'no lo construimos aún pero está pensado así']"
- Si pregunta "¿cuánto cuesta?" → respondes "[el rango que tengas, o 'te paso cotización formal mañana']"

### Minuto 9-14 — Esqueletos (los 3-5 superficiales)
Recorrido rápido (~1 min por feature):
- Esqueleto 1: [qué se ve, qué dices: "esto ya quedó listo el flow, solo faltan los datos reales"]
- Esqueleto 2: ...

**Mensaje al recorrer esqueletos:**
> "Ves que el alcance completo está pensado y diseñado. Lo que decidamos hoy es qué pieza profundizamos primero."

### Minuto 14-15 — Cierre y call-to-action
> "¿Qué te pareció? ¿Vamos con esto o quieres que ajustemos antes de meterle más profundidad a alguna otra área?"

**Call-to-action concreto:**
- [ ] Pedir firma/aprobación de la propuesta
- [ ] Agendar la siguiente sesión (workshop de detalle)
- [ ] Conseguir el contacto de [persona] para [siguiente paso]

---

## Q&A esperado (prepara respuestas)
| Pregunta probable | Respuesta corta |
|---|---|
| ¿Cuánto tiempo toma todo? | "Te mando estimación formal — depende del scope que decidamos hoy" |
| ¿Lo puedo usar yo solo o necesito equipo? | [respuesta atada a la complejidad operativa] |
| ¿Qué pasa con los datos sensibles? | [Supabase EU/US, RLS, etc. — adaptar a su industria] |

---

## Riesgos del demo
- ⚠️ Si [X falla en vivo], plan B: [acción]
- ⚠️ Si pide ver una feature que es solo esqueleto: "[frase para deflectar elegante]"
```

---

## FASE 7 — Email de seguimiento (`EMAIL_REQUERIMIENTOS.md`)

**Este documento SÍ lo va a leer el cliente.** Por eso tiene reglas más estrictas que PLAN_TECNICO y PLAN_DEMO. Genéralo SOLO después de tener llenas las dos listas de FASE 2.4 (lo que el cliente ya escuchó / lo que el cliente ya dijo).

### 7.1 Audiencia y destinatario

- **TO:** el decisor identificado en FASE 2.1. Si hay duda, pregunta UNA vez al usuario antes de redactar.
- **CC:** el gatekeeper técnico (ej. el que mantiene el sistema actual) — sumarlo evita que se vuelva resistencia.
- **Tono:** cercano-profesional adaptado al país del cliente. Si el usuario habla en español MX cálido en el transcript, replícalo. NO uses lenguaje corporativo frío.
- **Largo:** máximo 1 pantalla en cliente de correo. Si excede, recorta categorías.

### 7.2 Filtros pre-flight ANTES de incluir cualquier punto en el email

Para cada cosa que se te ocurra pedir, pásala por estos cuatro filtros. Si alguno responde "sí", **se descarta** o se mueve al workshop posterior:

1. **¿El cliente ya lo dijo en el transcript?** (cruzar con lista "EL CLIENTE YA ME DIJO ESTOS HECHOS" de FASE 2.4)
   - Ejemplos típicos: escolaridad del personal, hardware actual de captura, tamaño de la empresa, sistema actual que usan, restricciones que ya nombró.
2. **¿Yo ya se lo expliqué/dije en la reunión?** (cruzar con lista "EL CLIENTE YA ESCUCHÓ ESTOS PUNTOS")
   - Ejemplos típicos: casos de éxito que mencionaste (Willy, otros clientes), comparaciones técnicas, propuestas de approach que ya verbalizaste.
3. **¿Es información operativa de detalle que se descubrirá en el workshop de scope, no por email?**
   - Ejemplos típicos: marcas exactas de hardware, modelos de impresoras/lectores, IPs internas, screenshots minuciosos de N módulos. Estos se levantan en sesión, no por correo.
4. **¿Esta pregunta requiere que el cliente "investigue" más de 10 min para responder?**
   - Si sí → moverlo al workshop. El email solo pide lo que se contesta de memoria o con una llamada interna corta.

### 7.3 Estructura permitida del email

Máximo **3-4 bloques temáticos**, en este orden:

1. **Saludo + 1 línea de agradecimiento + 1 línea de recap concreto** (NO repetir lo que ya les dijiste; solo confirmar que entendiste el problema)
2. **El bloque de pedidos** organizado en 2-4 categorías. Cada categoría:
   - Título corto
   - 2-4 bullets máximo
   - Si una categoría tiene >4 bullets, está pidiendo demasiado → recortar
3. **Lo que TÚ vas a regresar** (compromiso recíproco: propuesta, workshop, mockups, fecha)
4. **Oferta de llamada alterna** (30 min) si prefieren no escribir + cierre

### 7.4 Reglas absolutas del email

- ❌ **NO asumir variantes tecnológicas que el cliente no nombró.** Si dijo "SAP" no preguntes "¿B1 o HANA?". Si dijo "BD" no preguntes "¿Postgres o MySQL?". El workshop es para eso.
- ❌ **NO repetir argumentos ya verbalizados en la reunión.** Si ya le mencionaste el caso Willy, NO lo escribas. Si ya le explicaste que Service Layer es derecho contractual, NO lo expliques otra vez.
- ❌ **NO pedir información que ya está en el transcript.** Si dijo que son 50 operadores con escolaridad primaria, NO preguntes "cuántos operadores y qué escolaridad".
- ❌ **NO pedir marcas/modelos/SKUs de hardware o equipos.** Se levanta en workshop.
- ❌ **NO confundir el TÍTULO del meeting con el contexto real.** Si Granola etiquetó "Visita Planta" pero el transcript muestra una conversación en oficina viendo Power BI, NO escribas "gracias por el recorrido de planta".
- ❌ **NO usar frases corporativas vacías** ("estamos comprometidos con", "agregar valor", "alineados estratégicamente"). Habla como persona.
- ❌ **NO listar más de 4 categorías de pedidos.** Más de 4 = el cliente cierra el correo sin responder.
- ❌ **NO inventarse nombres de personas, emails o títulos.** Si no sabes el email de alguien, deja `[email pendiente]` para que el usuario lo complete.

### 7.5 Plantilla del email

```markdown
**Para:** [Decisor] <[email o "pendiente"]>
**CC:** [Gatekeeper técnico] <[email]>
**Asunto:** [Cliente] — Información para armar la propuesta

---

[Saludo cordial],

[1 línea de gracias por la conversación — adaptada a CÓMO ocurrió realmente la reunión, no al título]. [1 línea que confirme entendiste su problema usando 1-2 palabras clave del transcript — esto les muestra que escuchaste].

Como quedamos, aquí está lo que necesito de su lado para armarles una propuesta aterrizada. Lo organicé en [N] bloques; si algo no aplica o prefieren platicarlo, decimos.

### 1. [Categoría 1 — la más crítica]
- [pedido 1 — corto, accionable]
- [pedido 2]
- [pedido 3]

### 2. [Categoría 2]
- [pedido 1]
- [pedido 2]

### 3. [Categoría 3 — opcional]
- [pedido 1]
- [pedido 2]

---

### Lo que les regreso yo

Cuando reciba esto (o lo platiquemos), les mando en [tiempo razonable]:

1. [Entregable 1 — ej. propuesta comercial]
2. [Entregable 2 — ej. workshop de scope]
3. [Entregable 3 — ej. mockups]

---

Si prefieren llamada de 30 min en vez de escribir todo, dígame y agendo esta semana. Lo importante es no enfriar el momentum.

Saludos,
[Firma del usuario tal como aparece en el transcript o como te la dé]
```

### 7.6 Checklist específico antes de entregar el email

- [ ] Pasé cada bullet por los 4 filtros pre-flight
- [ ] El destinatario es el decisor, no un random
- [ ] Verifiqué que NO repito ningún punto de la lista "EL CLIENTE YA ESCUCHÓ"
- [ ] Verifiqué que NO pido nada de la lista "EL CLIENTE YA ME DIJO"
- [ ] No asumí ninguna variante tecnológica no mencionada
- [ ] El contexto refleja CÓMO ocurrió la reunión, no el título del meeting
- [ ] Tengo máximo 4 categorías de pedidos
- [ ] Cada categoría tiene máximo 4 bullets
- [ ] Incluí "lo que yo regreso" para que sea reciprocidad, no demanda unilateral
- [ ] Ofrecí llamada alterna
- [ ] No inventé emails ni nombres — los puse como `[pendiente]` cuando no los sé

---

## FASE 8 — Handoff y siguientes pasos

Después de entregar los TRES documentos, cierra con:

```
═══════════════════════════════════════════════
PLAN ENTREGADO
═══════════════════════════════════════════════

📁 Archivos generados:
- PLAN_TECNICO.md (audiencia: tu equipo dev)
- PLAN_DEMO.md (audiencia: tú, para presentar)
- EMAIL_REQUERIMIENTOS.md (audiencia: EL CLIENTE — revísalo antes de enviar)

🎯 Próximos pasos sugeridos:
1. [Si quieres cotización formal] → ejecuta el skill `cotizacion-saas`
   pasándole PLAN_TECNICO.md como input
2. [Si vas a arrancar el MVP ya] → crea el proyecto Supabase + repo nuevo,
   y considera ejecutar el skill `lovable-to-supabase` cuando estés listo
   para self-host
3. [Si necesitas un prompt para arrancar en Lovable] → pídelo aparte; te
   genero el prompt inicial completo basado en PLAN_TECNICO.md

📝 Decisiones del cliente pendientes:
[lista breve de lo que necesitas validar antes del demo]

⚠️ Antes de enviar el email:
- Reemplaza los `[pendiente]` por datos reales (emails, fechas)
- Léelo en voz alta una vez — si suena corporativo, ajústalo
```

---

## Anti-patrones — NO hagas esto

**Generales:**
- ❌ Asumir Supabase + Lovable por default sin justificar — el cliente puede tener requisitos donde no aplique
- ❌ Proponer MVP "Lean puro" (1 flujo) si el cliente claramente necesita ver alcance completo para decidir
- ❌ Proponer MVP "Broad puro" (muchas features superficiales) — no diferencia tu propuesta del competidor
- ❌ Incluir precios o estimaciones de tiempo — eso vive en `cotizacion-saas`
- ❌ Escribir el PLAN_DEMO en lenguaje técnico — es tu guión, no documentación
- ❌ Saltar pain points porque "el cliente no los priorizó explícitamente" — el rol del PM es detectar dolor que el cliente no nombró
- ❌ Proponer features `[PM-IA]` sin justificar por qué un PM senior los ve y el cliente no
- ❌ Empezar a construir / ejecutar — este skill NO ejecuta, solo planea
- ❌ Reusar tablas/módulos de otro proyecto — cada cliente nuevo arranca limpio (este skill no debe siquiera revisar otros proyectos del usuario)

**Sobre asunciones tecnológicas:**
- ❌ Asumir variantes específicas de un producto que el cliente no nombró ("SAP" → ¿B1, S/4 HANA, ECC?). Si dijo "SAP", trátalo como genérico y NO preguntes en el email cuál variante — eso se aclara en workshop
- ❌ Preguntar "¿es X o Y?" sobre una tecnología que el cliente solo nombró por su categoría general. Cada pregunta así suena a que no escuchaste

**Sobre el contexto de la reunión:**
- ❌ Confundir el TÍTULO del meeting (Granola lo etiqueta automáticamente) con el contexto real. Si el título es "Visita Planta" pero el transcript muestra una conversación de oficina viendo Power BI, el contexto es "reunión en oficina"
- ❌ Agradecer al cliente por algo que NO ocurrió ("gracias por el recorrido" si no hubo recorrido) — el cliente lo lee y pierde confianza

**Sobre el email al cliente:**
- ❌ Repetir en el email casos de éxito, comparaciones, o propuestas que YA verbalizaste en la reunión — el cliente las escuchó hace días y suena a que tú no recuerdas tu propia conversación
- ❌ Pedir información que YA está en el transcript (escolaridad del personal, hardware actual, tamaño de empresa, sistema actual) — el cliente lo dijo y volver a preguntarlo señala que no leíste tus notas
- ❌ Pedir marcas/modelos/SKUs de hardware en el primer email de seguimiento — eso es nivel de detalle de workshop, no de propuesta
- ❌ Hacer un email de más de 4 categorías de pedidos — el cliente cierra sin responder
- ❌ Usar lenguaje corporativo frío con clientes que en el transcript hablan cálido — replica su tono

---

## Plantilla de invocación

> "Aquí está el transcript de la primera reunión con [cliente] del [fecha]. Usa granolanotes-to-mvp para darme el plan técnico y el plan de demo. [pega transcript]"

---

## Checklist de salida

**Análisis del transcript:**
- [ ] Recibí un transcript de discovery (no un resumen, no un transcript de cliente existente)
- [ ] Identifiqué contexto completo del cliente (industria, tamaño, asistentes, decisor)
- [ ] Listé pain points con cita textual + severidad + frecuencia + workaround
- [ ] Extraje señales de visión, restricciones, integraciones y compra
- [ ] **Llené la lista "EL CLIENTE YA ESCUCHÓ ESTOS PUNTOS DE MI BOCA"** (FASE 2.4)
- [ ] **Llené la lista "EL CLIENTE YA ME DIJO ESTOS HECHOS"** (FASE 2.4)
- [ ] Validé que el contexto refleja lo que el TRANSCRIPT dice, no lo que el título del meeting sugiere

**Requirements y MVP:**
- [ ] Cada small requirement tiene tag `[CLIENTE]` o `[PM-IA]` y acceptance criteria
- [ ] Elegí UN flujo crítico justificado para profundidad
- [ ] Definí 3-5 esqueletos con su nivel de mock
- [ ] El backlog está documentado (no perdido)
- [ ] Evalué stack POR CASO con tabla de justificación, no asumí Supabase+Lovable por inercia
- [ ] No asumí variantes tecnológicas que el cliente no nombró (B1 vs HANA, Postgres vs MySQL, etc.)

**PLAN_TECNICO.md (interno):**
- [ ] Incluye schema SQL listo para la BD recomendada, rutas, componentes, riesgos, decisiones pendientes
- [ ] NO incluye estimaciones de precio o tiempo

**PLAN_DEMO.md (interno):**
- [ ] Incluye guión minutado, anticipación de preguntas, call-to-action concreto
- [ ] Está escrito en lenguaje práctico, no técnico

**EMAIL_REQUERIMIENTOS.md (lo lee el cliente):**
- [ ] Pasé cada bullet por los 4 filtros pre-flight (FASE 7.2)
- [ ] NO repito nada de la lista "EL CLIENTE YA ESCUCHÓ"
- [ ] NO pido nada de la lista "EL CLIENTE YA ME DIJO"
- [ ] NO asumí variantes tecnológicas no mencionadas
- [ ] Máximo 4 categorías, cada una con máximo 4 bullets
- [ ] Tono replica el del cliente en el transcript
- [ ] Incluí "lo que yo regreso" y oferta de llamada alterna
- [ ] No inventé emails ni nombres

**Handoff:**
- [ ] Apunté al usuario al siguiente skill apropiado (`cotizacion-saas` o `lovable-to-supabase`)
