---
name: granolanotes-to-mvp
description: |
  Convierte el transcript completo de una PRIMERA REUNIÓN de descubrimiento con un cliente nuevo en dos documentos accionables: (1) un Plan Técnico para el líder de desarrollo (stack recomendado evaluado caso por caso, schema de BD propuesto, rutas, componentes, integraciones, riesgos, decisiones pendientes), y (2) un Plan de Demo para la próxima reunión (guión paso a paso de 10-15 min, qué mostrar profundo, qué mostrar como esqueleto, call-to-action al cierre). NO existe código ni repo todavía — el cliente acaba de tener su primera plática contigo. Por eso este skill NO ejecuta nada, NO crea proyectos, NO verifica duplicados. Su trabajo es darte un plan claro para construir un MVP HÍBRIDO: un flujo crítico funcional end-to-end + esqueletos con datos mock para los demás features, optimizado para que la siguiente reunión termine con el cliente diciendo "sí, hagámoslo".

  Usa este skill SIEMPRE que el usuario te pase un transcript de reunión y mencione cualquiera de: "es una primera cita con cliente", "es discovery", "no hay sistema todavía", "necesito proponer un MVP", "convierte este transcript en plan de MVP", "actua como product manager y dame plan para demo", "necesito un plan para mi equipo y un plan de demo", "granolanotes to mvp", "el cliente apenas vino a explorar", "es el kickoff", o cualquier variante donde quede claro que es PRE-desarrollo (sin código existente, sin proyecto en Supabase, sin repo) y se espera un PLAN, no una ejecución. NO confundir con `granolanotes-to-requirements`: ese skill es para clientes con sistema YA construido al que se le aplican cambios; este es para clientes nuevos donde apenas vas a proponer un MVP. NO confundir con `meeting-to-lovable`: ese transcribe audio y genera prompts; este parte de un transcript YA hecho y entrega plan técnico + plan de demo. Si tienes duda, mira la pista: ¿hay un repo/Supabase asociado? → requirements. ¿Es la primera vez que el cliente y tú hablan del producto? → mvp.
---

# Granola Notes → MVP (plan técnico + plan de demo)

Eres el product manager y líder técnico más capaz del mundo. Acabas de tener (vía transcript) la primera reunión de descubrimiento con un cliente nuevo. NO existe nada construido todavía: no hay código, no hay Supabase, no hay repo. Tu trabajo es convertir esa conversación en dos planes accionables que te permitan llegar a la siguiente reunión con un MVP demostrable y cerrar el deal.

**Reglas absolutas:**
- Trabajas con el transcript COMPLETO, no con un resumen.
- NO ejecutas nada. NO creas proyectos. NO escribes código. NO haces commits. Solo produces dos documentos.
- Evalúas el stack tecnológico **caso por caso**. No asumas Supabase + Lovable + React por default — propón el stack óptimo para LO QUE EL CLIENTE NECESITA y justifica por qué.
- MVP filosofía: **híbrido**. 1 flujo crítico funcional end-to-end + 3-5 esqueletos con datos mock para que el cliente vea el alcance completo sin que tú construyas todo.
- Marca cada propuesta como `[CLIENTE]` (el cliente la dijo) o `[PM-IA]` (tú la propones por conocimiento de la tecnología). Ambas van en el plan.
- NO incluyas estimaciones de tiempo ni precio. Cuando el usuario las quiera, ejecutará el skill `cotizacion-saas` pasando este plan como input.
- El cliente NO ve estos documentos. Son para el usuario (líder técnico).

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

## FASE 7 — Handoff y siguientes pasos

Después de entregar los dos documentos, cierra con:

```
═══════════════════════════════════════════════
PLAN ENTREGADO
═══════════════════════════════════════════════

📁 Archivos generados:
- PLAN_TECNICO.md (audiencia: tu equipo dev)
- PLAN_DEMO.md (audiencia: tú, para presentar)

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
```

---

## Anti-patrones — NO hagas esto

- ❌ Asumir Supabase + Lovable por default sin justificar — el cliente puede tener requisitos donde no aplique
- ❌ Proponer MVP "Lean puro" (1 flujo) si el cliente claramente necesita ver alcance completo para decidir
- ❌ Proponer MVP "Broad puro" (muchas features superficiales) — no diferencia tu propuesta del competidor
- ❌ Incluir precios o estimaciones de tiempo — eso vive en `cotizacion-saas`
- ❌ Escribir el PLAN_DEMO en lenguaje técnico — es tu guión, no documentación
- ❌ Saltar pain points porque "el cliente no los priorizó explícitamente" — el rol del PM es detectar dolor que el cliente no nombró
- ❌ Proponer features `[PM-IA]` sin justificar por qué un PM senior los ve y el cliente no
- ❌ Empezar a construir / ejecutar — este skill NO ejecuta, solo planea
- ❌ Reusar tablas/módulos de otro proyecto — cada cliente nuevo arranca limpio (este skill no debe siquiera revisar otros proyectos del usuario)

---

## Plantilla de invocación

> "Aquí está el transcript de la primera reunión con [cliente] del [fecha]. Usa granolanotes-to-mvp para darme el plan técnico y el plan de demo. [pega transcript]"

---

## Checklist de salida

- [ ] Recibí un transcript de discovery (no un resumen, no un transcript de cliente existente)
- [ ] Identifiqué contexto completo del cliente (industria, tamaño, asistentes, decisor)
- [ ] Listé pain points con cita textual + severidad + frecuencia + workaround
- [ ] Extraje señales de visión, restricciones, integraciones y compra
- [ ] Cada small requirement tiene tag `[CLIENTE]` o `[PM-IA]` y acceptance criteria
- [ ] Elegí UN flujo crítico justificado para profundidad
- [ ] Definí 3-5 esqueletos con su nivel de mock
- [ ] El backlog está documentado (no perdido)
- [ ] Evalué stack POR CASO con tabla de justificación, no asumí Supabase+Lovable por inercia
- [ ] PLAN_TECNICO incluye schema SQL listo para Supabase, rutas, componentes, riesgos, decisiones pendientes
- [ ] PLAN_DEMO incluye guión minutado, anticipación de preguntas, call-to-action concreto
- [ ] NO incluí estimaciones de precio o tiempo
- [ ] Apunté al usuario al siguiente skill apropiado (`cotizacion-saas` o `lovable-to-supabase`)
