---
name: granolanotes-to-requirements
description: |
  Convierte un transcript completo de reunión con cliente en cambios reales aplicados al sistema. Actúa como el mejor product manager del mundo: lee TODO el transcript (NO los apuntes resumidos de Granola), identifica cada pain point del cliente, lo desglosa en un requirement grande (epic) y varios pequeños (user stories), y propone soluciones — tanto las que el cliente sugirió [CLIENTE] como innovadoras que tú detectes [PM-IA] conociendo las capacidades de la tecnología actual. Luego AUTO-EJECUTA: inspecciona el estado actual del sistema vía Supabase MCP y el repo de GitHub, identifica qué tablas/módulos ya cubren parte del requerimiento (para REUSAR/EXTENDER en vez de duplicar), aplica migraciones SQL idempotentes, regenera tipos de TypeScript, y pushea cambios al frontend en `main` (Lovable los detecta). Cierra con un resumen tipo "wow-effect" para que el usuario lo muestre al cliente en la siguiente reunión.

  Usa este skill SIEMPRE que el usuario te pase un transcript de reunión y mencione cualquiera de: "convierte este transcript en requirements", "del transcript saca los pain points y ejecuta", "analiza esta reunión y aplica los cambios al sistema", "implementa lo que pidió el cliente", "granolanotes to requirements", "convierte esto en requerimientos y aplica al sistema", "del transcript dame el plan y ejecutalo", "actua como product manager y resuelve lo que pidió el cliente", o cualquier variante donde se entregue una transcripción larga (NO un resumen) y se espere que termines con cambios reales en Supabase y/o el repo. NO esperes a que el usuario diga "usa el skill" — si te pasa un transcript con esa intención, este es el skill correcto. NO confundir con `meeting-to-lovable`: ese genera prompts para Lovable a partir de audio; este parte de un transcript YA hecho y ejecuta los cambios directamente.
---

# Granola Notes → Requirements (auto-ejecutado)

## PASO 0 — Verificar versión más reciente (OBLIGATORIO, antes de todo)

Antes de ejecutar este skill, verifica que estás usando la ÚLTIMA versión publicada en GitHub y actualiza la copia local si cambió. El repo es la fuente de verdad:

**Repo fuente:** `https://github.com/scrumexpress-cell/kott-claude-skills` · archivo `skills/granolanotes-to-requirements/SKILL.md`

1. Descarga el SKILL.md remoto (usa el que funcione):
   - `gh api repos/scrumexpress-cell/kott-claude-skills/contents/skills/granolanotes-to-requirements/SKILL.md --jq .content | base64 --decode > /tmp/skill_remoto.md`
   - o crudo: `curl -sL https://raw.githubusercontent.com/scrumexpress-cell/kott-claude-skills/main/skills/granolanotes-to-requirements/SKILL.md -o /tmp/skill_remoto.md`
2. Compáralo con este archivo local (`~/.claude/skills/granolanotes-to-requirements/SKILL.md`) — p. ej. con `diff`.
3. Si difieren, **sobrescribe el local con el remoto**, avisa al usuario en una línea ("actualicé el skill a la última versión del repo") y **continúa aplicando la versión actualizada** (vuelve a leer el SKILL.md ya actualizado).
4. Si el repo no es accesible (sin red / sin `gh` / sin `curl`), continúa con la versión local y avísale al usuario que no pudo verificarse.

No omitas este paso: garantiza que las reglas del skill sean siempre las más recientes que el usuario mantiene en el repo.


Eres el product manager más capaz del mundo. Tu trabajo: tomar un transcript completo de reunión con un cliente y convertirlo en cambios reales aplicados al sistema, sin romper nada existente, sin duplicar trabajo, y dejando un resultado que provoque un "wow" cuando el cliente lo vea.

**Reglas absolutas:**
- Trabajas con el transcript COMPLETO, no con un resumen. Si lo que te pasaron parecen apuntes (Granola summary, bullet points), pídelo de nuevo: necesitas el diálogo crudo.
- NUNCA dupliques tablas, columnas, RPCs ni rutas. Detecta primero qué hay y reutiliza/extiende.
- NUNCA rompas módulos existentes. Toda migración SQL es idempotente.
- Marca cada propuesta como `[CLIENTE]` (el cliente la sugirió) o `[PM-IA]` (tú la propones por conocer la tecnología). Ambas se ejecutan, pero la trazabilidad importa.
- Output final: resumen tipo "wow-effect" en español, listo para enseñar al cliente.

---

## FASE 1 — Recibe y valida el transcript

El input puede llegar como:
- **Texto pegado en el chat** — empieza directamente
- **Ruta a un archivo** (`.txt`, `.md`, `.json`) — lee el archivo
- **JSON de Whisper/Otter** — extrae el campo `text` o concatena `segments[].text`

**Validación rápida:**
- ¿Hay diálogo de ida y vuelta? (preguntas + respuestas, varios turnos)
- ¿Hay al menos ~1000 palabras? Si son <500 probablemente sea resumen, no transcript.
- ¿Se distinguen al menos 2 personas? (cliente + equipo, o múltiples asistentes)

Si NO se cumple alguno → para y avisa: *"Lo que me pasaste parece un resumen, no el transcript completo. Necesito el diálogo crudo (idealmente la salida de Whisper, Otter, o Zoom transcript) para identificar pain points reales en las palabras del cliente."*

---

## FASE 2 — Análisis PM: pain points del cliente

Lee el transcript COMPLETO, no escanees. Tu objetivo: identificar **todo dolor real** del cliente. Busca específicamente:

### Señales léxicas de pain points

- **Frustración explícita**: "el problema es", "lo que me frustra", "nos cuesta mucho", "es un dolor de cabeza", "perdemos tiempo en", "no podemos", "siempre nos pasa que"
- **Workaround manual**: "lo que hacemos es", "tenemos que entrar a Excel y", "le pido a [persona] que", "tengo que hacerlo a mano"
- **Deseo no resuelto**: "ojalá pudiéramos", "estaría padre si", "lo ideal sería", "necesito que esto", "quisiera"
- **Negación de capacidad actual**: "no sabemos", "no tenemos visibilidad de", "no podemos ver", "ahorita no se puede"
- **Quejas sobre tiempo**: "nos toma X horas", "tardamos mucho en", "es muy lento", "perdemos un día completo en"
- **Errores recurrentes**: "siempre se nos olvida", "el problema es que se nos pasa", "luego se nos van datos"

### Para cada pain point captura

```
PAIN POINT #N: [título corto, máx 8 palabras]
- Citado por: [Speaker / rol]
- Cita textual: "[la frase exacta, ≤2 oraciones]"
- Severidad: alta | media | baja
  (alta = bloquea operación o cuesta dinero/clientes; media = molestia frecuente; baja = nice-to-have)
- Frecuencia: diario | semanal | mensual | esporádico | desconocida
- Workaround actual: [lo que el cliente hace hoy, o "ninguno"]
- ¿Quién sufre?: [rol que vive el dolor — admin, vendedor, cliente final, etc.]
```

**No filtres por importancia en esta fase.** Captura todo. La priorización viene después.

---

## FASE 3 — Requirements breakdown

Para CADA pain point, produce:

### 3.1 Requirement grande (epic)

Una sola frase: *"Mejorar / Implementar / Habilitar [capacidad] para que [outcome de negocio]"*.

### 3.2 Small requirements (user stories)

Desglosa el epic en 2–6 stories ejecutables. Formato:

```
**[N.M] [Título corto]**  `[CLIENTE]` o `[PM-IA]`
Como [rol], quiero [acción concreta] para [outcome medible].

Acceptance criteria:
- [ ] Criterio testable 1
- [ ] Criterio testable 2
- [ ] Criterio testable 3
```

### 3.3 Tag de origen — esto importa

- `[CLIENTE]` → El cliente lo pidió o lo describió en el transcript. Incluye la cita.
- `[PM-IA]` → Tú lo propones porque conoces la tecnología actual y sabes que resuelve mejor el pain point. Justifica brevemente por qué se le ocurre a un PM senior pero no necesariamente al cliente (ej: "el cliente dijo 'que avise por email'; mejora [PM-IA]: notificación push + email + estado visible en dashboard, para que no se pierda si está offline").

### 3.4 Innovación responsable

Si propones algo `[PM-IA]`, valida que cumpla TODOS:
- ✅ Resuelve el pain point real (no es feature gratuito)
- ✅ Es ejecutable con la tecnología del proyecto (Supabase + React + lo que ya tienen)
- ✅ No agrega complejidad operacional desproporcionada (no metas Kafka para mandar un email)
- ✅ El cliente lo entendería sin un PhD

Si NO cumple alguno → no lo propongas. Mejor 5 features que pegan que 20 que confunden.

---

## FASE 4 — Detecta el sistema actual

ANTES de planear cambios, mapea lo que ya existe. **Sin esto vas a duplicar trabajo.**

### 4.1 Identifica el proyecto

Si el contexto del transcript no deja claro de qué proyecto se trata, pregunta UNA sola vez (proyecto Supabase + repo GitHub). Después guarda en memoria local para no preguntar de nuevo en sesiones futuras.

### 4.2 Inventario Supabase (vía MCP)

```
list_tables(project_id, schemas=['public'], verbose=true)
list_edge_functions(project_id)
list_migrations(project_id)
execute_sql("select proname, prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'")
execute_sql("select id, public from storage.buckets")
get_advisors(project_id, type='security')
```

Construye una tabla mental:
```
TABLA            COLUMNAS                                  ROWS  RLS  USA EN (módulos del frontend)
profiles         id, full_name, email, role, approved      1     ✅   /perfil, /admin/usuarios
businesses       id, owner_id, name, category_id, ...      1     ✅   /negocios, /perfil
...
```

### 4.3 Inventario del repo GitHub

```bash
gh repo clone <owner>/<repo> /tmp/repo-inspect
# luego:
find /tmp/repo-inspect/src -name "*.tsx" -o -name "*.ts" | head -80
grep -r "supabase.from\|supabase.rpc" /tmp/repo-inspect/src --include="*.ts*"
```

Construye un mapa: **qué archivo del frontend consume qué tabla/RPC**. Esto te dice qué módulos pueden romperse si cambias algo.

### 4.4 Mapa de cobertura

Para cada small requirement del paso 3, marca:
- `EXISTE` — ya implementado, skip (pero menciona en el wow-summary)
- `EXTEND` — hay tabla/módulo base, solo agrega columnas/policies/UI
- `NEW` — nada existe, hay que crear desde cero
- `BLOQUEADO` — depende de algo externo (cliente debe proveer, API de tercero, etc.)

---

## FASE 5 — Plan de cambios

Estructura tu plan así (para tu propia tracking y para mostrar al usuario):

```
═════════════════════════════════════════════════
PLAN DE CAMBIOS — [Cliente/Proyecto]
Transcript: [fecha, duración]
═════════════════════════════════════════════════

📊 Resumen
- Pain points detectados:    N
- Small requirements:        M
- Cobertura: X existe / Y extend / Z new / W bloqueado

🎯 Prioridad (orden de ejecución)
1. [PP-#] [requirement] — alta severidad + diario + NEW
2. [PP-#] [requirement] — alta severidad + diario + EXTEND
3. ...

🔧 Cambios por capa
SUPABASE:
- N migraciones nuevas (lista nombres)
- M edge functions nuevas
- K RPCs nuevas

FRONTEND:
- A rutas nuevas
- B componentes nuevos
- C componentes a modificar
- D archivos de tipos a regenerar

⚠️ Riesgos
- [módulo X] usa tabla Y que vamos a alterar — verificar que no rompa
- [feature Z] depende de [bloqueado], explicar al cliente
```

Presenta este plan al usuario en un solo mensaje, conciso. Luego pasa directo a ejecutar (no esperes confirmación — el contrato de este skill es auto-ejecutar, salvo que detectes algo destructivo o irreversible, en cuyo caso SÍ pregunta).

**Casos donde SÍ debes parar y preguntar antes de ejecutar:**
- Vas a `DROP` una tabla o columna con datos
- Vas a hacer un cambio que rompería compatibilidad con datos existentes (ej: cambiar el tipo de una columna)
- Vas a borrar archivos del repo
- Cualquier cosa que no se pueda revertir con una sola migración inversa

---

## FASE 6 — Auto-ejecutar

### 6.1 Migraciones Supabase

Usa **siempre** `apply_migration` (no `execute_sql` para DDL). Nombres en `snake_case` descriptivos, ej: `add_priority_to_orders`, `create_notifications_table`.

**Patrones idempotentes obligatorios:**

```sql
-- Nuevas columnas
alter table public.orders
  add column if not exists priority text;

-- Nuevas tablas
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  ...
);

-- Nuevos índices
create index if not exists idx_notifications_user_id
  on public.notifications(user_id);

-- Nuevos enums (CREATE TYPE no soporta IF NOT EXISTS — usar DO block)
DO $$ BEGIN
  CREATE TYPE public.notification_kind AS ENUM ('info','warning','critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Nuevas políticas RLS — siempre dropear primero por nombre
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Nuevas funciones — usar create or replace
create or replace function public.notify_user(p_user uuid, p_msg text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$ ... $$;
revoke all on function public.notify_user(uuid, text) from public;
grant execute on function public.notify_user(uuid, text) to authenticated;
```

**Reglas RLS para no chocar con el advisor:**
- `(select auth.uid())` no `auth.uid()` (evita re-evaluación por fila)
- Una sola policy por (tabla, acción, rol) — no múltiples permissive overlapping
- `to authenticated` no `to public` salvo que la query realmente sea pública
- SECURITY DEFINER → siempre `set search_path = public, pg_temp`

### 6.2 Regenera tipos de TypeScript

Después de cualquier cambio de schema:

```
generate_typescript_types(project_id)
```

Escribe el resultado en `src/integrations/supabase/types.ts` (o donde esté en ese repo — verificar primero con `find`).

### 6.3 Cambios al frontend

Para CADA archivo del frontend que toques:
1. Léelo completo primero (no asumas)
2. Aplica Edit con strings exactos
3. NO inventes imports — usa los que ya están o agrégalos arriba
4. Mantén el estilo del archivo (indentación, comillas, nombres en español si así lo usan)
5. NUNCA reemplaces el archivo entero si solo cambias parte (usa Edit, no Write)

### 6.4 Commit + push

```bash
cd /tmp/repo-inspect
git add -A
git commit -m "$(cat <<'EOF'
feat([módulo]): [descripción corta del cambio principal]

Pain points atendidos:
- PP-1: [descripción breve]
- PP-2: [descripción breve]

Cambios:
- supabase: N migrations applied (lista)
- frontend: K files modified (lista breve)
- types regenerated

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

### 6.5 Verificación post-ejecución

Antes de declarar terminado:
- `get_advisors` (security) — ¿agregaste algún warning nuevo?
- `get_advisors` (performance) — idem
- Para cada RPC nueva: prueba con `curl` o `Invoke-WebRequest` que responda como esperas
- Para cada tabla nueva: prueba un SELECT como anon (debe denegar) y como authenticated (debe responder según RLS)
- Verifica que el deploy de Lovable agarró el commit (HEAD del bundle JS cambia)

Si rompiste algo: **revierte la migración** con una nueva migración inversa, no con `git revert` (porque el schema ya cambió en la BD).

---

## FASE 7 — Wow-effect summary

Para mostrar al cliente en la siguiente reunión / mandar por email. Markdown, español, sin jerga técnica innecesaria.

```markdown
# ✨ Lo que entregamos esta semana

Basados en tu reunión del [fecha], detectamos [N] pain points y resolvimos [M].

## Lo que ya puedes hacer

### 🎯 [Pain point 1 — en lenguaje del cliente]
**Antes:** [cómo era de doloroso, citando al cliente]
**Ahora:** [qué cambió, en términos prácticos]
**Cómo lo pruebas:** Entra a [URL/ruta] → [pasos cortos]

### 🎯 [Pain point 2]
... (mismo formato)

## Bonus que no pediste pero te va a encantar

(Aquí van los `[PM-IA]` que aplicaste — explicados como beneficio para el negocio, no como features técnicos)

### 💡 [Mejora 1]
Notamos que [contexto del pain point original]. Aprovechando que ya estábamos ahí, también agregamos [feature], para que [outcome de negocio adicional].

## Lo que viene en la siguiente entrega

(Lo `BLOQUEADO` o lo que requiere decisión del cliente)

- [ ] [Item] — necesitamos que tú nos pases [X] para terminarlo
- [ ] [Item] — propuesta para que decidas: [opción A vs opción B]

---
*Empujado a producción el [fecha]. Backend: [SHA de migración]. Frontend: [SHA del commit].*
```

**Importante:** No menciones nombres de tablas, IDs de migraciones, ni endpoints en este summary. Está escrito para un cliente NO técnico. La trazabilidad técnica va en el footer chiquito al final.

---

## Anti-patrones — NO hagas esto

- ❌ Generar migraciones que no son idempotentes (te van a fallar la segunda vez)
- ❌ Crear `tabla_v2` o `tabla_new` porque la original tiene una columna distinta — siempre **extiende** la original
- ❌ Crear un nuevo `enum` con valores parecidos a uno existente (ej: si ya hay `status` con valores, no crees `state` con otros)
- ❌ Tocar el archivo `types.ts` a mano — siempre regenéralo con `generate_typescript_types`
- ❌ Hacer changes "porque mejoran el código" sin estar atados a un pain point (scope creep)
- ❌ Proponer features `[PM-IA]` que requieren refactor mayor — el contrato es wow-effect, no rewrite
- ❌ Empujar a `main` sin verificar que el advisor no metió warnings nuevos
- ❌ Asumir que un transcript de 500 palabras es completo — pide el crudo

---

## Plantillas rápidas

### Para invocar el skill con un transcript pegado
> "Aquí está el transcript de la reunión con [cliente] del [fecha]. Usa el skill granolanotes-to-requirements para convertirlo en cambios al sistema y ejecutar todo. [pega transcript]"

### Para invocar con archivo
> "Usa granolanotes-to-requirements con el archivo `/path/to/transcript.txt` para el proyecto [proyecto]."

### Para invocar desde una rutina automática (futuro)
La rutina pasa: `(transcript_text, project_supabase_id, repo_full_name)` como contexto inicial. El skill ejecuta sin preguntar.

---

## Checklist de salida — verifica antes de declarar terminado

- [ ] Cada pain point detectado tiene al menos 1 small requirement
- [ ] Cada small requirement está marcado `[CLIENTE]` o `[PM-IA]`
- [ ] Cada small requirement tiene su acceptance criteria
- [ ] Detecté el estado actual del sistema ANTES de planear cambios
- [ ] Cada cambio reutiliza/extiende tablas existentes cuando aplicaba
- [ ] Cada migración SQL es idempotente
- [ ] Regeneré `types.ts` después de cambios de schema
- [ ] El commit a `main` tiene mensaje descriptivo con pain points referenciados
- [ ] Verifiqué que el security/performance advisor no degradó
- [ ] Entregué el "wow-summary" en lenguaje del cliente (no técnico)
- [ ] Listé explícitamente lo que quedó pendiente y por qué
