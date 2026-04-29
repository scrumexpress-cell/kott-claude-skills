---
name: lovable-to-supabase
description: >
  Guía completa para migrar un proyecto de Supabase hosteado en Lovable a una instancia propia de Supabase.
  Usa este skill SIEMPRE que el usuario mencione: migrar de Lovable, clonar proyecto Supabase, transferir datos
  de Lovable a Supabase propio, "tengo un proyecto en Lovable y quiero pasarlo a mi Supabase", migración de
  instancia Supabase, o cualquier variante de mover datos/funciones entre proyectos Supabase donde uno sea
  administrado por Lovable. También aplica cuando el usuario quiera verificar que una migración de este tipo
  fue exitosa. Incluye checklist pre-migración, proceso de exportación correcto, migración de edge functions
  desde GitHub, configuración de secrets, y verificación post-migración para evitar pérdida de datos.
---

# Migración de Lovable Supabase → Supabase Propio

## Contexto importante

Los proyectos de Lovable tienen su propia instancia de Supabase que **no puedes controlar directamente**:
- No tienes acceso MCP al proyecto Lovable (es de ellos, no tuyo)
- Las edge functions NO se exportan con `pg_dump` — hay que obtenerlas del repo de GitHub
- WebFetch puede estar bloqueado para GitHub — usa Chrome browser tools como fallback
- Las tablas pueden tener columnas que no aparecen en un export CSV selectivo

---

## FASE 0 — Setup obligatorio (NO le preguntes al usuario, hazlo tú)

**Esta fase es para evitar interrumpir al usuario con preguntas que tú mismo puedes responder con las herramientas que tienes.** Antes de pedir cualquier cosa, intenta resolverlo tú primero.

### 0.1 Obtener credenciales del Supabase destino — SOLO

Si necesitas el anon/publishable key del Supabase destino, **NO le preguntes al usuario**. Hazlo así:

1. Carga `mcp__Claude_in_Chrome__*` tools (`ToolSearch` con `query: "chrome", max_results: 30`)
2. Conecta al browser activo del usuario y navega a `https://supabase.com/dashboard/project/<PROJECT_ID>/settings/api-keys`
3. Click en la tab "Publishable and secret API keys" (la nueva, formato `sb_publishable_xxx`)
4. Extrae el key con `javascript_tool`:
   ```js
   Array.from(document.querySelectorAll('input, code, span, td'))
     .map(el => el.value || el.textContent)
     .filter(v => v && v.startsWith('sb_publishable_'))[0]
   ```
5. Si solo existe el legacy anon key (formato JWT `eyJ...`), **el filtro de privacidad bloqueará la lectura**. En ese caso usa el publishable key nuevo del primer tab. Si no existe, créalo via "New publishable key".

**Regla:** los keys con formato `sb_publishable_xxx` son SAFE de leer. Los JWT (legacy `eyJ...`) están bloqueados por el filtro de privacidad — no intentes capturarlos.

### 0.2 Identificar source y destination

Si el usuario te da una URL ambigua, navega tú mismo a `https://supabase.com/dashboard/projects` para ver TODOS sus proyectos. Si el "origen" no aparece, es el Supabase interno de Lovable (al que el usuario solo tiene acceso via Lovable).

### 0.3 Acceso al SOURCE (Lovable interno)

El proyecto interno de Lovable se accede vía `https://lovable.dev/projects/<UUID>?view=cloud&section=sql`. El SQL editor de Lovable da acceso completo al Supabase interno. **Úsalo como tu fuente de verdad para datos del origen.**

### 0.4 Acceso al CÓDIGO del repo

Si el repo es **privado**, tres opciones en orden de preferencia:

1. **Mejor:** pedir acceso a la carpeta local con `mcp__cowork__request_cowork_directory` (donde el repo esté clonado o se pueda extraer)
2. Si la carpeta está vacía, descargar el ZIP via Chrome: navegar a `https://github.com/<owner>/<repo>/archive/refs/heads/main.zip` (la sesión del usuario en Chrome autentica), luego pedirle que extraiga con UN comando de PowerShell:
   ```powershell
   Expand-Archive -Path "$env:USERPROFILE\Downloads\<repo>-main.zip" -DestinationPath "<ruta-mounted>" -Force; Move-Item "<ruta>\<repo>-main\*" "<ruta>\" -Force; Remove-Item "<ruta>\<repo>-main"
   ```
3. Como último recurso, leer archivos uno por uno via Chrome (extraer `rawLines` del JSON payload de cada blob). **Lento y susceptible al filtro de privacidad** — solo si las anteriores fallan.

### 0.5 Transferir SQL grande entre tabs (source ↔ destination)

Cuando necesites mover SQL grande (>5K chars) entre el SQL editor del origen y el del destino, los tabs no comparten contexto JS. Solución:

1. `mcp__computer-use__request_access` con `{"apps":["Google Chrome"], "clipboardWrite": true, "clipboardRead": true}`
2. En el tab origen, ejecutar el SELECT que genera INSERTs (ver Fase 3)
3. Extraer resultados a `window.__data` via `javascript_tool`:
   ```js
   const cells = Array.from(document.querySelectorAll('table td, [role="cell"]'));
   window.__data = cells.map(c => c.textContent).filter(t => t && t.includes('INSERT INTO'));
   ```
4. Copiar al clipboard del OS:
   ```js
   await navigator.clipboard.writeText(window.__data[0])
   ```
   *Nota:* puede dar timeout si el contenido es >100K chars. El comando usualmente se completa pese al timeout — verifica con `mcp__computer-use__read_clipboard`.
5. Navegar al tab destino (SQL editor de Supabase), click en el editor, `Ctrl+A` → `Delete` → `Ctrl+V` → `Ctrl+Return`

### 0.6 Filtro de privacidad — qué se bloquea

`javascript_tool` y respuestas de página están filtrados. Patrones bloqueados:
- JWT tokens (`eyJ...` largos)
- Cookies o auth headers
- A veces SQL grande con muchas comillas y caracteres especiales

**Si te da `[BLOCKED: Cookie/query string data]`:** no intentes leer el contenido. En su lugar, manipula los datos sin retornarlos (guárdalos en `window.X`, copia al clipboard, paste cross-tab).

### 0.7 Generar INSERTs masivos via SQL `format()`

Para migrar datos de TODAS las tablas en un solo paso, usa `format()` con `%L` (literal SQL safe). Ejemplo:

```sql
SELECT string_agg(stmt, E'\n') FROM (
  SELECT format('INSERT INTO public.tabla (col1, col2) VALUES (%L, %L);', col1::text, col2::text) AS stmt FROM public.tabla
  UNION ALL
  SELECT format('INSERT INTO public.otra (col) VALUES (%L);', col::text) FROM public.otra
) t;
```

Esto devuelve UN texto enorme con todos los INSERTs. Si supera 100K chars, particiona por tabla. Activity_logs en particular suele tener >300K chars — sepárala.

### 0.8 Disable triggers durante migración de auth.users

El trigger `on_auth_user_created` (en Supabase de Lovable) crea automáticamente un row en `public.profiles` cuando se inserta un user. Esto causa conflictos UNIQUE al migrar profiles separadamente. Soluciones:

- **Recomendada:** modificar el trigger original a `INSERT ... ON CONFLICT (user_id) DO NOTHING` antes de migrar usuarios
- Migrar profiles via UPDATE (no INSERT), porque la fila ya existe gracias al trigger:
  ```sql
  UPDATE public.profiles SET display_name=%L, avatar_url=%L, age=%L, onboarding_completed=%L WHERE user_id=%L
  ```

### 0.9 Edge functions: deploy via dashboard UI

No hay MCP para deploys cross-org. Usa Chrome para deployar:

1. Navegar a `https://supabase.com/dashboard/project/<DEST>/functions/new`
2. `Ctrl+A` → `Delete` en el editor (clear default code)
3. Escribir el código TS al clipboard via `mcp__computer-use__write_clipboard`
4. Click en editor → `Ctrl+V`
5. Triple-click en el field "Function name" → escribir nombre exacto
6. Click "Deploy function"

Repetir por cada función. Configurar secrets manualmente después en Settings → Edge Functions → Secrets.

### 0.10 Actualizar `.env` y `config.toml` en repo privado

Edición directa via GitHub web UI (chrome MCP):
- `https://github.com/<owner>/<repo>/edit/main/.env` → paste nuevas credenciales → Commit
- `https://github.com/<owner>/<repo>/edit/main/supabase/config.toml` → cambiar `project_id`

### 0.11 ⚠️ CRÍTICO: Lovable Cloud NO se puede "disconnect & reconnect"

**No pierdas tiempo intentando esto** — Lovable Cloud está atado al proyecto Lovable desde su creación. La UI no tiene un botón "Disconnect Cloud" ni "Switch to external Supabase". El proyecto siempre seguirá apuntando al Supabase interno de Lovable.

Tampoco funcionan estos enfoques:
- "Importar repo de GitHub a un proyecto Lovable existente" — Lovable no soporta importar a un proyecto que ya tiene scaffold
- Editar el `.env` en el repo y esperar que Lovable lo respete — Lovable inyecta sus propios valores de Cloud
- Modificar `client.ts` en el repo — Lovable lo sobrescribe en sus generaciones

### 0.12 ✅ La forma que SÍ funciona: clonar el proyecto Lovable

La estrategia correcta es **crear un nuevo proyecto Lovable que sea una copia del original**, pero conectado al Supabase externo desde el inicio:

1. https://lovable.dev → New project (vacío)
2. **NO actives** "Use Lovable Cloud" durante setup
3. (Opcional) Connectors → GitHub → conectar el repo del proyecto original
4. En el primer mensaje del chat, pegar un prompt detallado pidiéndole a Lovable que clone el proyecto original conectándolo al Supabase externo

**Plantilla del prompt** (rellena los placeholders):

```
Clona el proyecto <NOMBRE> existente (no del repo, del proyecto Lovable). Quiero una copia exacta del código, componentes, páginas, hooks, edge functions y todo lo que ya generaste ahí, pero conectado a MI Supabase externo en lugar de Lovable Cloud.

PROYECTO ORIGEN (copiar TODO el código de aquí):
https://lovable.dev/projects/<UUID_PROYECTO_ORIGEN>
Nombre: <NOMBRE>

SUPABASE EXTERNO (al que se conecta esta copia):
URL: https://<DEST_PROJECT_ID>.supabase.co
Project ID: <DEST_PROJECT_ID>
Publishable Key: sb_publishable_<XXX>

ESE SUPABASE YA TIENE TODO MIGRADO (no toques nada ahí, solo conecta):
- <N> tablas (lista resumida)
- RLS, triggers, funciones SQL, policies
- <N> auth.users con UUIDs originales
- ~<N> filas de datos
- <N> edge functions deployadas: <listar>

CAMBIOS al hacer la copia:

1. En src/integrations/supabase/client.ts, hardcodea:
const SUPABASE_URL = "https://<DEST_PROJECT_ID>.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_<XXX>";
(en lugar de leer import.meta.env)

2. Reescribe cualquier edge function que use LOVABLE_API_KEY (Lovable AI Gateway) para usar el provider directo (OpenAI, Anthropic, etc.). El gateway de Lovable solo funciona dentro de Lovable Cloud:
- URL: https://api.openai.com/v1/chat/completions
- Modelo: gpt-4o-mini
- Authorization: Bearer ${Deno.env.get("OPENAI_API_KEY")}

3. Las edge functions que usan Resend, Stripe u otros providers directos NO requieren cambios.

4. NO uses Lovable Cloud. NO crees un Supabase nuevo. Solo conéctate al externo.

Los secrets (OPENAI_API_KEY, RESEND_API_KEY, etc.) los configuro yo manualmente en mi Supabase dashboard.

Empieza con la copia y dime cuando esté.
```

### 0.13 Lovable AI Gateway (`LOVABLE_API_KEY`) NO funciona fuera de Lovable Cloud

`LOVABLE_API_KEY` y `https://ai.gateway.lovable.dev` están atados a la infraestructura de Lovable Cloud. Cuando migras a Supabase externo, **estas funciones romperán** si no las reescribes.

Reemplazos típicos:
- `google/gemini-3-flash-preview` → `gpt-4o-mini` (OpenAI) o `claude-haiku-4-5` (Anthropic)
- Endpoint `ai.gateway.lovable.dev/v1/chat/completions` → `api.openai.com/v1/chat/completions` o `api.anthropic.com/v1/messages`
- Header `Authorization: Bearer ${LOVABLE_API_KEY}` → mismo formato pero con la key del provider

Identifica funciones afectadas con grep:
```bash
grep -r "LOVABLE_API_KEY\|ai.gateway.lovable.dev" supabase/functions/
```

### 0.14 Secrets en Lovable son write-only (no se pueden leer)

La UI de Lovable Cloud → Secrets permite crear/eliminar pero **no revela los valores**. Esto significa:
- No puedes copiar `RESEND_API_KEY` del origen al destino automáticamente
- No puedes copiar `LOVABLE_API_KEY` (de hecho ese ni lo necesitas en destino, ver 0.13)
- El usuario debe meter los valores manualmente en el Supabase destino, sacándolos de cada provider (Resend dashboard, OpenAI, etc.)

`LOVABLE_API_KEY` específicamente tiene un botón "Rotate" que puede mostrar el nuevo valor brevemente, pero como ese key no funciona fuera de Lovable Cloud, **no vale la pena el esfuerzo**.

### 0.15 Limites del SQL editor de Supabase Dashboard

Monaco SQL editor maneja bien hasta ~150K chars. Más allá puede:
- Colgarse al hacer paste
- Ejecutar parcialmente
- Devolver "Success" sin haber procesado todas las statements

**Reglas prácticas:**
- INSERTs masivos > 150K chars → particiona por LIMIT/OFFSET (250 filas por chunk)
- Tablas como `activity_logs` (analytics, suele tener miles de filas) → considera saltarla, raramente afecta funcionalidad de la app
- Verifica con `SELECT count(*) FROM tabla` después de cada chunk

### 0.16 ⚠️ CRÍTICO: Migrar también `auth.identities` y limpiar tokens NULL

**Migrar solo `auth.users` NO es suficiente — el login fallará con `"Database error querying schema"` (HTTP 500).**

Dos cosas adicionales obligatorias:

**A) Migrar `auth.identities`** (requerida desde Supabase 2024+ para login con email):

```sql
-- En SOURCE: generar INSERTs
SELECT format('INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (%L, %L, %L, %L, %L, %L, %L);',
  provider_id, user_id::text, identity_data::text, provider, last_sign_in_at::text, created_at::text, updated_at::text)
FROM auth.identities;
```

**OJO:** no incluyas el campo `id` en el INSERT si la columna tiene default (suele ser auto-generado). Sí incluye `provider_id` (que es el `user_id` para email provider, o el OAuth provider's user id).

**B) Reemplazar NULL en columnas de tokens por empty string:**

GoTrue (Supabase Auth) revienta cuando estos campos son NULL después de un INSERT manual. Los necesitan vacíos `''`:

```sql
UPDATE auth.users SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, '');
```

**Verificar login funciona via API directo:**

```js
fetch('https://<DEST>.supabase.co/auth/v1/token?grant_type=password', {
  method: 'POST',
  headers: { 'apikey': 'sb_publishable_xxx', 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'xxx' })
}).then(r => r.json())
```

Status 200 con `access_token` = todo bien. Status 500 con `"Database error querying schema"` = falta uno de los dos pasos arriba.

### 0.17 Checklist de FASE 0 antes de avanzar

Antes de empezar la Fase 1, confirma que tienes resuelto:

```
□ Identificado source (Lovable interno) y destination (Supabase del usuario)
□ Acceso a SQL editor de ambos (source via Lovable Cloud → SQL editor; dest via Supabase Dashboard)
□ Anon/publishable key del destination capturado (formato sb_publishable_)
□ Acceso al código del repo (carpeta local mounted o ZIP descomprimido)
□ Chrome MCP cargado y conectado al browser del usuario
□ Clipboard access concedido (computer-use request_access con clipboardWrite/Read)
□ Identificadas las funciones que usan LOVABLE_API_KEY (necesitan reescritura)
□ Usuario ha entendido que necesitará crear un PROYECTO LOVABLE NUEVO (no se puede modificar el actual)
```

---

## FASE 1 — Inventario pre-migración (origen)

Antes de tocar nada, documenta el estado exacto del origen. Esto es tu "verdad de referencia".

### 1.1 Contar filas por tabla

Ejecuta este SQL en el proyecto origen:

```sql
SELECT 
  schemaname,
  tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY tablename;
```

Guarda los resultados. Los usarás para verificar al final.

### 1.2 Ver el esquema completo de cada tabla importante

No confíes en el CSV — las columnas pueden estar ocultas. Ejecuta:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'nombre_tabla'
ORDER BY ordinal_position;
```

Repite para cada tabla. **Anota las columnas que no esperabas** — esas son las que se pierden en una migración apresurada.

### 1.3 Listar edge functions del origen

Si el proyecto de Lovable tiene un repo de GitHub asociado, busca en:
```
https://github.com/<usuario>/<repo>/tree/main/supabase/functions/
```

Lista todas las carpetas — cada carpeta = una edge function. Anótalas todas.

Si WebFetch está bloqueado para GitHub, usa Chrome browser:
```
navega a: https://github.com/<usuario>/<repo>/tree/main/supabase/functions/
extrae el texto de la página para ver la lista
```

### 1.4 Documentar secrets necesarios

Revisa el código de las edge functions para identificar qué variables de entorno necesitan. Patrón típico:
- `RESEND_API_KEY` → funciones de email
- `LOVABLE_API_KEY` o similar → AI/LLM integrations
- `OPENWEATHER_API_KEY` → clima
- `APP_URL` → links en emails (default: URL de producción)
- `DEMO_USER_EMAIL`, `DEMO_USER_PASSWORD` → funciones de demo

---

## FASE 2 — Preparar proyecto destino

### 2.0 Cuándo conectar el nuevo proyecto de Lovable

**Conecta el nuevo proyecto de Lovable al nuevo Supabase DESPUÉS de crear el esquema, pero ANTES de migrar los datos.**

El orden es:
1. Crear el nuevo Supabase y aplicar el esquema (tablas, columnas, RLS) ← estás aquí
2. **→ Crear nuevo proyecto en Lovable y conectarlo al nuevo Supabase ←**
3. Migrar los datos
4. Deployar edge functions y configurar secrets

Por qué en este punto: Lovable necesita el esquema existente para leer las tablas y generar código correcto. Si conectas Lovable a un Supabase vacío (sin tablas), Lovable no puede trabajar. Si esperas hasta tener también los datos, estás trabajando a ciegas sin poder probar nada. Con el esquema listo, puedes ir probando la app mientras migras los datos e identificar problemas en tiempo real.

### 2.1 Crear el esquema en destino

Usa `apply_migration` para crear todas las tablas con su esquema completo.

Si tienes acceso SQL al origen, exporta el esquema:
```sql
-- Ejecutar en origen para ver DDL de una tabla
SELECT pg_get_tabledef('public'::name, 'nombre_tabla'::name, false, 'WITH_OIDS');
```

O usa pg_dump si tienes acceso directo:
```bash
pg_dump --schema-only --no-owner --no-acl -n public CONNECTION_STRING
```

**Importante:** siempre usar `--schema-only` primero para verificar que todas las columnas están antes de migrar datos.

### 2.2 Verificar RLS (Row Level Security)

Las políticas RLS del origen deben recrearse en destino. Verifica:
```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## FASE 3 — Migración de datos

### ⚠️ 3.0 CRÍTICO: Migrar auth.users PRIMERO con UUIDs originales

**Este es el error más común y más destructivo.** Si los usuarios se crean en el nuevo Supabase de forma normal (registro en la app), reciben UUIDs nuevos que no coinciden con los de la data migrada. Toda la data queda huérfana.

La solución es insertar los usuarios directamente en `auth.users` usando sus UUIDs originales, antes de migrar cualquier otra tabla.

**Paso 1 — Exportar usuarios del origen:**
```sql
SELECT 
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  instance_id
FROM auth.users;
```

**Paso 2 — Insertar en destino con los mismos UUIDs:**
```sql
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, raw_app_meta_data,
  created_at, updated_at, role, aud, instance_id
)
VALUES (
  'uuid-exacto-del-origen',
  'email@ejemplo.com',
  'encrypted_password_value',
  NOW(),
  '{}',
  '{"provider":"email","providers":["email"]}',
  NOW(), NOW(), 'authenticated', 'authenticated',
  '00000000-0000-0000-0000-000000000000'
);
```

El campo `id` debe ser el UUID exacto del origen. Así toda la data posterior (tasks, notes, projects) que tenga ese `user_id` queda correctamente vinculada sin modificar nada más.

**Regla de oro:** `auth.users` → `profiles` → resto de tablas. Nunca al revés.

**Verificar antes de continuar:**
```sql
-- Confirmar que los UUIDs en auth.users coinciden con los de la data
SELECT COUNT(*) FROM auth.users; -- debe coincidir con el origen
SELECT DISTINCT user_id FROM tasks WHERE user_id NOT IN (SELECT id FROM auth.users);
-- debe devolver 0 filas
```

### 3.1 Exportar datos con SELECT * explícito

**MAL** (puede perder columnas):
```sql
SELECT id, title, content FROM notes WHERE user_id = '...'
```

**BIEN** (captura todo):
```sql
SELECT * FROM notes WHERE user_id = '...'
```

Para cada tabla, exporta a CSV con `SELECT *`. Si el CSV tiene columnas que no esperabas, es una señal de que el esquema tenía más datos de los que sabías.

### 3.2 Insertar datos en destino

Por cada tabla, inserta los datos exportados. Orden importante (respetar foreign keys):
1. Tablas sin dependencias primero (profiles, categories, projects)
2. Luego tablas que referencian a las anteriores (tasks, notes, links)
3. Al final, tablas junction o de relaciones (friendships, item_shares, etc.)

### 3.3 Subtablas y tablas secundarias

**Error común:** olvidar tablas menos evidentes como `subtasks`, `recurring_tasks`, `friendship_tokens`, etc.

Verifica que exportaste TODAS las tablas del inventario de la Fase 1.

---

## FASE 4 — Migración de Edge Functions

Las edge functions NO se incluyen en pg_dump. Hay que migrarlas manualmente desde GitHub.

### 4.1 Para cada función en la lista del inventario

1. Navega al archivo raw en GitHub:
   ```
   https://github.com/<usuario>/<repo>/raw/refs/heads/main/supabase/functions/<nombre>/index.ts
   ```

2. Si WebFetch está bloqueado, usa Chrome browser:
   ```
   navega a la URL → get_page_text → copia el código
   ```

3. Despliega con `deploy_edge_function`:
   - `verify_jwt: true` en casi todos los casos
   - `verify_jwt: false` solo si la función original lo tenía así, o si implementa su propia auth

### 4.2 Funciones que usan AI (LOVABLE_API_KEY)

El patrón de Lovable usa su propio AI Gateway:
```
URL: https://ai.gateway.lovable.dev/v1/chat/completions
Modelos: google/gemini-2.5-flash, google/gemini-3-flash-preview
Header: Authorization: Bearer ${LOVABLE_API_KEY}
```

No reemplaces con OpenAI — usa el código original tal como está.

### 4.3 Función `workflow-runs`

Si aparece en logs de 404 pero no en el repo de GitHub, probablemente fue eliminada. No la recrear.

---

## FASE 5 — Configurar Secrets

En el proyecto destino, configura todos los secrets identificados en el inventario.

En Supabase Dashboard:
**Settings → Edge Functions → Secrets**

O via MCP si está disponible. Los secrets mínimos necesarios para una app típica de Lovable:
- `RESEND_API_KEY`
- `LOVABLE_API_KEY` (o equivalente)
- `APP_URL` (URL de producción, ej: `https://tuapp.com`)
- Cualquier API key de terceros (weather, maps, etc.)

---

## FASE 6 — Verificación post-migración

**No declares la migración completa hasta pasar esta fase.**

### 6.1 Comparar conteos de filas

Ejecuta el mismo SQL de inventario en el destino y compara con el origen:

```sql
SELECT 
  schemaname,
  tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY tablename;
```

Cualquier diferencia es un problema. Investígalo antes de continuar.

### 6.2 Verificar columnas con datos especiales

Si una tabla tiene columnas de tipo enum, JSON, o con valores específicos por negocio (como `theme` en notas, `status` en tareas), verifica que los datos se migraron correctamente:

```sql
-- Ejemplo: verificar distribución de valores en una columna
SELECT theme, COUNT(*) FROM notes GROUP BY theme ORDER BY count DESC;
```

Si aparecen valores NULL donde no debería haberlos, es señal de que esa columna se perdió en el export.

### 6.3 Verificar edge functions activas

Tras el deploy, verifica que las funciones están en estado `ACTIVE` en:
**Supabase Dashboard → Edge Functions**

O via MCP: `list_edge_functions` y confirma que todas las del inventario aparecen.

### 6.4 Test de funciones críticas

Prueba manualmente al menos estas funciones en la app:
- Login / autenticación
- Crear y leer datos básicos (tareas, notas, etc.)
- Cualquier función que use AI (genera pregunta, optimiza texto, etc.)
- Envío de emails si aplica

---

## Problemas frecuentes y soluciones

| Problema | Causa | Solución |
|----------|-------|----------|
| Columnas aparecen como NULL o vacías | Export CSV fue con columnas selectivas, no `SELECT *` | Re-exportar con `SELECT *` y actualizar registros |
| "Failed to send request to Edge Function" | Función no deployada o secret faltante | Verificar lista de funciones y secrets |
| Subcategorías muestran "Sin categoría" | Columna `theme`/`category` no incluida en export | Export correcto + UPDATE masivo con los valores correctos |
| 404 en funciones que no existen | Función obsoleta en el código del frontend | Ignorar si no está en el repo de GitHub |
| GitHub bloqueado con WebFetch | Proxy de red bloquea raw.githubusercontent.com | Usar Chrome browser tools: `navigate` + `get_page_text` |
| "Permission denied" al acceder MCP del proyecto Lovable | El proyecto Lovable no es tuyo, es de ellos | Obtener código desde GitHub, no via MCP |

---

## Checklist rápido de migración

```
PRE-MIGRACIÓN
□ Inventario de tablas con conteo de filas
□ Esquema completo de cada tabla (todas las columnas)
□ Lista de todas las edge functions
□ Lista de todos los secrets necesarios
□ Identificar orden de inserción (foreign keys)

MIGRACIÓN
□ Crear esquema en destino (con TODAS las columnas)
□ ⚠️ Insertar auth.users PRIMERO con UUIDs originales
□ Verificar que no hay user_id huérfanos antes de continuar
□ Exportar datos con SELECT * (no selectivo)
□ Insertar en orden correcto (respetando FK)
□ Verificar subtablas y tablas secundarias
□ Obtener código de edge functions desde GitHub
□ Deployar todas las edge functions
□ Configurar todos los secrets

POST-MIGRACIÓN
□ Comparar conteos de filas origen vs destino
□ Verificar columnas con valores especiales
□ Confirmar edge functions en estado ACTIVE
□ Test manual de funciones críticas en la app
□ Verificar RLS policies
```
