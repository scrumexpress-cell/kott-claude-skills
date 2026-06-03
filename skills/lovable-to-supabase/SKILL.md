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

## REGLA #1 — TRABAJA AUTÓNOMO, NO PREGUNTES

**Lovable NO tiene API pública.** Nunca pidas al usuario que conecte Lovable, ni le preguntes credenciales de Lovable, ni le pidas que haga pasos manuales que tú puedes hacer con tus herramientas. Lovable solo se sincroniza con GitHub — eso es todo lo que necesitas.

Lo único que el usuario DEBE hacer manualmente (porque no hay forma de hacerlo via MCP/API):
1. **Configurar los secrets** de las edge functions en Supabase Dashboard → Settings → Edge Functions → Secrets (`RESEND_API_KEY`, `OPENAI_API_KEY`, etc.)
2. **Crear nuevo proyecto Lovable** si se está migrando un proyecto Lovable Cloud existente (ver 0.11 y 0.12 — Lovable Cloud no se puede desconectar)

**NUNCA pidas la cadena de conexión / service key del Supabase INTERNO de Lovable — Lovable NO la expone.** La ÚNICA forma de leer/extraer datos del interno es su **SQL editor** (`lovable.dev/projects/<UUID>?view=cloud&section=sql`, ver 0.3), vía Chrome MCP. Si te ves pidiéndole al usuario "pásame la conexión de Lovable", PARA — abre su SQL editor y consúltalo tú.

**Este skill también aplica a VERIFICAR/RECONCILIAR una migración YA hecha (Fase 10), no solo a la inicial.** Re-invócalo cuando el usuario diga "faltan datos", "antes eran más", "olvidarme de Lovable" o "migrar a Cloudflare".

**TODO lo demás lo haces tú** sin preguntar. Usa las herramientas disponibles en este orden de preferencia:

| Necesidad | Mejor tool | Fallback |
|---|---|---|
| Acceder al código del repo | `gh repo clone` (autenticado) | Chrome MCP + GitHub web |
| Aplicar schema en destino | `mcp__supabase__apply_migration` | Chrome MCP → SQL editor del dashboard |
| Deployar edge functions | `mcp__supabase__deploy_edge_function` | Chrome MCP → Functions UI |
| Ver tablas/funciones del destino | `mcp__supabase__list_*` + `execute_sql` | Chrome MCP → Dashboard |
| Obtener anon key del destino | `mcp__supabase__get_publishable_keys` | Chrome MCP → Settings → API |
| SQL editor del SOURCE (Lovable Cloud) | Chrome MCP → Lovable SQL editor | (no hay alternativa) |

**Decide el path al inicio:** si tienes MCP del destino y `gh` autenticado, usas el path rápido (todo via MCP + git). Si no, caes al path con Chrome MCP descrito en la Fase 0.

---

## Contexto importante

- Los proyectos de Lovable tienen su propia instancia de Supabase ("Lovable Cloud") que no controlas directamente — pero el código y el schema viven en el repo de GitHub que el usuario sí controla.
- Lovable auto-genera un repo con TODO: schema (`supabase/migrations/*.sql`), edge functions (`supabase/functions/*/index.ts`), código React, `.env`, etc.
- Las edge functions NO se incluyen en `pg_dump` — vienen del repo.
- **Lovable Cloud NO puede desconectarse** del proyecto Lovable original. Para usar Supabase externo necesitas crear un NUEVO proyecto Lovable que clone el original (ver 0.11–0.12).
- **`LOVABLE_API_KEY` NO funciona fuera de Lovable Cloud** — funciones que la usen deben reescribirse para usar OpenAI/Anthropic directo (ver 0.13).
- **Migrar `auth.users` no basta** — también necesitas `auth.identities` y limpiar tokens NULL (ver 0.16).

---

## FASE 0 — Setup obligatorio (NO le preguntes al usuario, hazlo tú)

**Esta fase es para evitar interrumpir al usuario con preguntas que tú mismo puedes responder con las herramientas que tienes.** Antes de pedir cualquier cosa, intenta resolverlo tú primero.

### 0.0 Verificar acceso a `gh` CLI (path rápido)

```bash
gh auth status
```

Si está autenticado y el repo es del usuario, **éste es tu path principal** para todo lo relacionado con código:

```bash
gh repo view <usuario>/<repo> --json name,isPrivate
gh repo clone <usuario>/<repo> <destino-local>
```

Una vez clonado, usas `Read`, `Glob`, `Grep` localmente — muchísimo más rápido que Chrome MCP. Si `gh auth status` falla, pídele al usuario que corra `gh auth login` (ÚNICA cosa que debes pedirle aparte de los secrets).

### 0.1 Obtener credenciales del Supabase destino

**Primera opción (path rápido):** si tienes MCP del proyecto destino:
```
mcp__supabase__get_project_url(id=<dest>)
mcp__supabase__get_publishable_keys(project_id=<dest>)
```
Esto te devuelve URL + ambos keys (legacy JWT `eyJ...` y nuevo `sb_publishable_...`). Usa el **legacy anon key (`eyJ...`)** para `VITE_*_KEY` en el repo, porque la mayoría del código React generado por Lovable lo espera en ese formato.

**Segunda opción (Chrome MCP):** si no tienes MCP del destino:
1. Carga `mcp__Claude_in_Chrome__*` tools (`ToolSearch` con `query: "chrome", max_results: 30`)
2. Conecta al browser activo y navega a `https://supabase.com/dashboard/project/<PROJECT_ID>/settings/api-keys`
3. Click en la tab "Publishable and secret API keys"
4. Extrae el key con `javascript_tool`:
   ```js
   Array.from(document.querySelectorAll('input, code, span, td'))
     .map(el => el.value || el.textContent)
     .filter(v => v && v.startsWith('sb_publishable_'))[0]
   ```
5. Si solo existe el legacy anon key (formato JWT `eyJ...`), **el filtro de privacidad bloqueará la lectura**. En ese caso usa el publishable key nuevo del primer tab. Si no existe, créalo via "New publishable key".

**Regla:** los keys con formato `sb_publishable_xxx` son SAFE de leer via Chrome. Los JWT (legacy `eyJ...`) están bloqueados por el filtro de privacidad cuando se lee desde Chrome — pero **sí los puedes leer via MCP `get_publishable_keys`**.

### 0.2 Identificar source y destination

Si el usuario te da una URL ambigua, navega tú mismo a `https://supabase.com/dashboard/projects` para ver TODOS sus proyectos. Si el "origen" no aparece, es el Supabase interno de Lovable (al que el usuario solo tiene acceso via Lovable).

### 0.3 Acceso al SOURCE (Lovable interno)

El proyecto interno de Lovable se accede vía `https://lovable.dev/projects/<UUID>?view=cloud&section=sql`. El SQL editor de Lovable da acceso completo al Supabase interno. **Úsalo como tu fuente de verdad para datos del origen.**

### 0.4 Acceso al CÓDIGO del repo

**Primera opción (path rápido):** `gh repo clone` (ver 0.0). Funciona con repos privados si `gh` está autenticado.

**Segunda opción:** si `gh` no está disponible, tres opciones en orden de preferencia:
1. Pedir acceso a la carpeta local con `mcp__cowork__request_cowork_directory`
2. Descargar el ZIP via Chrome: navegar a `https://github.com/<owner>/<repo>/archive/refs/heads/main.zip` (la sesión del usuario en Chrome autentica), luego pedirle que extraiga con UN comando de PowerShell:
   ```powershell
   Expand-Archive -Path "$env:USERPROFILE\Downloads\<repo>-main.zip" -DestinationPath "<ruta-mounted>" -Force; Move-Item "<ruta>\<repo>-main\*" "<ruta>\" -Force; Remove-Item "<ruta>\<repo>-main"
   ```
3. Como último recurso, leer archivos uno por uno via Chrome (extraer `rawLines` del JSON payload de cada blob). **Lento y susceptible al filtro de privacidad** — solo si las anteriores fallan.

### 0.5 Transferir SQL grande entre tabs (source ↔ destination)

**Solo aplica si no tienes MCP del destino.** Si tienes MCP, salta esto y usa `apply_migration` / `execute_sql` directamente.

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

### 0.9 Edge functions: deploy directo via MCP (preferido) o via dashboard UI

**Primera opción (path rápido):** si tienes MCP del destino:
```
mcp__supabase__deploy_edge_function(
  project_id=<dest>,
  name=<nombre>,
  entrypoint_path="index.ts",
  verify_jwt=<según matriz>,
  files=[{"name":"index.ts","content":<contenido>}]
)
```

**Segunda opción (Chrome MCP):** usa el dashboard si no tienes MCP:
1. Navegar a `https://supabase.com/dashboard/project/<DEST>/functions/new`
2. `Ctrl+A` → `Delete` en el editor (clear default code)
3. Escribir el código TS al clipboard via `mcp__computer-use__write_clipboard`
4. Click en editor → `Ctrl+V`
5. Triple-click en el field "Function name" → escribir nombre exacto
6. Click "Deploy function"

Repetir por cada función. Configurar secrets manualmente después en Settings → Edge Functions → Secrets.

#### Matriz de `verify_jwt`

| El código de la función... | verify_jwt |
|---|---|
| Lee `req.headers.get("Authorization")` y llama `supabaseUser.auth.getUser()` | **true** |
| Es un webhook público (forms, callbacks de servicios externos) | **false** |
| Es de setup inicial (ej. `setup-admin`) | **false** |
| Solo usa secrets sin chequear auth del usuario | depende: frontend autenticado → **true**; endpoint público → **false** |

#### Manejo de UTF-8 en el content

Caracteres como `ñ`, `é`, `í` deben pasarse correctamente:

- **Opción A (preferida):** escapa con `é`, `ñ`, `í` etc. en el JSON del parámetro `files`. Siempre funciona, no depende del shell.
- **Opción B:** crea un script Python con `json.dumps(..., ensure_ascii=False)` y `encoding='utf-8'`. (`cat | python` puede corromper UTF-8 en Windows.)

### 0.10 Actualizar `.env` y `config.toml` en el repo

**Primera opción (path rápido):** edita los archivos en el clone local + git push:
```bash
# Edit .env, supabase/config.toml, src/integrations/**/client.ts localmente
# Si "Author identity unknown" al commit:
git config user.email "<email-del-usuario>"
git config user.name "<github-username>"
git add .env supabase/config.toml src/integrations/**/client.ts
git commit -m "chore: migrate Supabase from Lovable to self-hosted ..."
git push origin main
```

Lovable recoge los cambios del repo automáticamente.

**Segunda opción:** edición directa via GitHub web UI (Chrome MCP):
- `https://github.com/<owner>/<repo>/edit/main/.env` → paste nuevas credenciales → Commit
- `https://github.com/<owner>/<repo>/edit/main/supabase/config.toml` → cambiar `project_id`

### 0.11 ⚠️ CRÍTICO: Lovable Cloud NO se puede "disconnect & reconnect"

**No pierdas tiempo intentando esto** — Lovable Cloud está atado al proyecto Lovable desde su creación. La UI no tiene un botón "Disconnect Cloud" ni "Switch to external Supabase". El proyecto siempre seguirá apuntando al Supabase interno de Lovable.

Tampoco funcionan estos enfoques:
- "Importar repo de GitHub a un proyecto Lovable existente" — Lovable no soporta importar a un proyecto que ya tiene scaffold
- Editar el `.env` en el repo y esperar que Lovable lo respete — Lovable inyecta sus propios valores de Cloud
- Modificar `client.ts` en el repo — Lovable lo sobrescribe en sus generaciones

**EXCEPCIÓN:** si el proyecto NUNCA estuvo en Lovable Cloud (fue creado conectándose directo a Supabase externo o GitHub desde el inicio), entonces editar `.env`/`client.ts` en el repo SÍ funciona. Es el caso típico de proyectos donde el usuario ya tenía Supabase propio. Verifica esto antes de asumir que necesitas el flujo 0.12.

### 0.12 ✅ La forma que SÍ funciona para Lovable Cloud: clonar el proyecto Lovable

Si el proyecto ESTÁ en Lovable Cloud, la estrategia correcta es **crear un nuevo proyecto Lovable que sea una copia del original**, pero conectado al Supabase externo desde el inicio:

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
- `google/gemini-3-flash-preview` o `google/gemini-2.5-flash` → `gpt-4o-mini` (OpenAI) o `claude-haiku-4-5` (Anthropic)
- Endpoint `ai.gateway.lovable.dev/v1/chat/completions` → `api.openai.com/v1/chat/completions` o `api.anthropic.com/v1/messages`
- Header `Authorization: Bearer ${LOVABLE_API_KEY}` → mismo formato pero con la key del provider

Identifica funciones afectadas con grep:
```bash
grep -r "LOVABLE_API_KEY\|ai.gateway.lovable.dev" supabase/functions/
```

**Decisión durante migración:** si vas a hacer el path de "clonar proyecto Lovable" (0.12), deja que Lovable reescriba estas funciones según la plantilla del prompt. Si vas a hacer el path "directo via MCP" (sin Lovable nuevo), reescribe tú las funciones antes de hacer `deploy_edge_function`. **Avísale al usuario explícitamente** que estas funciones no funcionarán hasta reescribirlas o hasta que él consiga un `LOVABLE_API_KEY` válido (que probablemente nunca conseguirá fuera de Lovable Cloud).

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
- **Si tienes MCP del destino**, `execute_sql` no tiene este límite (puedes pasar SQL más grande sin problemas)

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

### 0.17 Atajo: crear admin via `setup-admin` edge function

Muchos proyectos Lovable incluyen una edge function `setup-admin` específicamente para crear el primer admin sin pasar por el flujo de registro normal. Si la encuentras en `supabase/functions/setup-admin/index.ts`, deployala y úsala:

```bash
curl -s -X POST "https://<DEST>.supabase.co/functions/v1/setup-admin" \
  -H "Content-Type: application/json" \
  -H "apikey: <anon-key>" \
  -d '{"email":"<email-del-usuario>","password":"<password-fuerte>"}'
```

Espera `{"success":true,"message":"Admin user created","userId":"..."}`. Verifica:
```sql
SELECT u.email, ur.role FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = '<email>';
```
Debe mostrar el email con role `admin`. **Devuelve credenciales al usuario en el resumen final** — email y password en plain text, una sola vez.

Este atajo evita todo el flujo de migrar `auth.users` + `auth.identities` + cleanup de tokens NULL (sección 0.16) cuando el usuario va a crear data fresca en el destino.

### 0.18 Checklist de FASE 0 antes de avanzar

Antes de empezar la Fase 1, confirma que tienes resuelto:

```
□ Identificado el escenario:
  - Path A (rápido): MCP del destino + gh auth → todo via MCP/git
  - Path B (Chrome MCP): sin MCP del destino → todo via Chrome
  - Mixto: gh para código, Chrome para SQL del source (porque source es Lovable Cloud)
□ Identificado source (Lovable interno o externo) y destination
□ Anon/publishable key del destination capturado
□ Acceso al código del repo (gh clone preferido, ZIP fallback)
□ Si SOURCE es Lovable Cloud: acceso a SQL editor via lovable.dev
□ Chrome MCP cargado (solo si necesario para tu path)
□ Clipboard access concedido (solo si vas a pegar SQL cross-tab)
□ Identificadas las funciones que usan LOVABLE_API_KEY (necesitan reescritura)
□ Usuario ha entendido si necesita crear PROYECTO LOVABLE NUEVO o no
□ Plan de admin inicial: setup-admin function o migración de auth.users completa
```

---

## FASE 1 — Inventario pre-migración (origen y destino)

Antes de tocar nada, documenta el estado exacto del origen Y del destino. Esto es tu "verdad de referencia".

### 1.1 Inventario del SOURCE — contar filas por tabla

Ejecuta en el origen:

```sql
SELECT schemaname, tablename, n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY tablename;
```

Guarda los resultados. Los usarás para verificar al final.

### 1.2 Inventario del SOURCE — esquema completo de cada tabla

No confíes en el CSV — las columnas pueden estar ocultas. Ejecuta:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'nombre_tabla'
ORDER BY ordinal_position;
```

Repite para cada tabla. **Anota las columnas que no esperabas** — esas son las que se pierden en una migración apresurada.

### 1.3 Inventario del REPO — listar migraciones y edge functions

Una vez clonado el repo:

```bash
glob: <repo>/supabase/migrations/*.sql        # migraciones en orden cronológico
glob: <repo>/supabase/functions/*/index.ts    # edge functions
read:  <repo>/supabase/config.toml            # project_id origen
read:  <repo>/.env y .env.example             # vars custom (VITE_META_PIXEL_ID, etc.)
read:  <repo>/src/integrations/supabase/client.ts
glob:  <repo>/src/integrations/**/client.ts   # ¿hay más de un cliente Supabase?
```

### 1.4 Inventario del DESTINO

Antes de aplicar nada, mira qué ya hay en destino (especialmente si comparte Supabase con otros proyectos del usuario):

```
mcp__supabase__list_tables(project_id, ["public"], verbose=false)
mcp__supabase__list_edge_functions(project_id)
mcp__supabase__list_extensions(project_id)
mcp__supabase__execute_sql:
  SELECT routine_name FROM information_schema.routines WHERE routine_schema='public';
  SELECT trigger_name, event_object_table FROM information_schema.triggers
    WHERE trigger_schema IN ('public','auth');
  SELECT typname FROM pg_type WHERE typtype='e'
    AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname='public');
```

**Importante:** el destino puede tener tablas/funciones de OTROS proyectos del usuario — **no las toques**. Solo añade lo del proyecto que estás migrando.

### 1.5 Documentar secrets necesarios

```bash
grep -r "Deno.env.get" <repo>/supabase/functions/
```

Patrón típico:
- `RESEND_API_KEY` → funciones de email
- `LOVABLE_API_KEY` → AI/LLM integrations (ver 0.13 — necesita reescritura)
- `OPENAI_API_KEY` o `ANTHROPIC_API_KEY` → si ya reescribiste las funciones AI
- `OPENWEATHER_API_KEY` → clima
- `APP_URL` → links en emails
- `DEMO_USER_EMAIL`, `DEMO_USER_PASSWORD` → funciones de demo
- `STRIPE_SECRET_KEY` → pagos

---

## FASE 2 — Preparar proyecto destino (aplicar schema)

### 2.0 Cuándo conectar el nuevo proyecto de Lovable

**Conecta el nuevo proyecto de Lovable al nuevo Supabase DESPUÉS de crear el esquema, pero ANTES de migrar los datos.**

El orden es:
1. Crear el nuevo Supabase y aplicar el esquema (tablas, columnas, RLS) ← aquí
2. **→ Crear nuevo proyecto en Lovable (si aplica, ver 0.12) y conectarlo al nuevo Supabase ←**
3. Migrar los datos (si aplica)
4. Deployar edge functions y configurar secrets

Por qué en este punto: Lovable necesita el esquema existente para leer las tablas y generar código correcto. Si conectas Lovable a un Supabase vacío (sin tablas), Lovable no puede trabajar.

### 2.1 Aplicar schema vía MCP `apply_migration` (path rápido)

**Estrategia:** lee cada archivo `.sql` de `supabase/migrations/` en orden cronológico (por nombre de archivo) y aplícalo con `apply_migration`. No fusiones todo en un solo bloque — algunas operaciones (sobre todo `ALTER TYPE ... ADD VALUE`) tienen que estar en transacciones separadas de su uso.

```
read: <repo>/supabase/migrations/20260128223528_xxx.sql
mcp__supabase__apply_migration:
  project_id=<destino>
  name="prefix_01_<descripción>"   # prefijo del proyecto + número incremental
  query=<contenido del .sql>
```

Agrupa migraciones MUY cortas (1-3 líneas) en una sola call, pero respeta la regla del enum (siguiente sección).

### 2.2 Reglas críticas al aplicar el schema

1. **`ALTER TYPE ... ADD VALUE` no puede usarse en la misma migración donde se añade.** PostgreSQL requiere que el ADD VALUE esté commiteado antes de poder usarse en policies/funciones. Si una migración añade un valor de enum Y otra usa ese valor, ponlas en `apply_migration` calls SEPARADAS.

2. **Idempotencia para storage buckets:** siempre `ON CONFLICT (id) DO NOTHING`:
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('client-logos', 'client-logos', true)
   ON CONFLICT (id) DO NOTHING;
   ```

3. **Idempotencia para policies/triggers:** preferir `DROP POLICY IF EXISTS` + `CREATE POLICY` (las migraciones de Lovable a menudo ya hacen esto).

4. **Conflictos de nombres con otros proyectos:** si el usuario ya tiene tablas en el mismo Supabase (de otros proyectos), verifica si chocan. En la práctica casi nunca chocan. Las funciones genéricas como `update_updated_at_column` no chocan con `set_updated_at` u otras versiones.

5. **Storage policies con nombres genéricos:** si una policy como `"Public read access"` puede existir de otro bucket, dale un sufijo único: `"Public read access email-assets"`. Si no, fallará con duplicate.

6. **`UPDATE` con UUIDs específicos en migraciones:** Lovable a veces incluye `UPDATE deals SET ... WHERE id = '<uuid-específico>'` o `UPDATE user_roles SET role='crm' WHERE user_id='<uuid>'`. En un destino nuevo esos IDs no existen — los UPDATEs son no-op, lo cual está bien. **Aplica la migración tal cual.**

7. **Extensiones:** las migraciones de Lovable suelen incluir `CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;` y `CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;`. Aplícalas — son necesarias para cron jobs y webhooks.

### 2.3 Verificar después de aplicar el schema

```sql
-- Tablas creadas del proyecto
SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;

-- Storage buckets
SELECT id, name, public FROM storage.buckets;

-- RLS policies
SELECT schemaname, tablename, policyname, cmd FROM pg_policies
WHERE schemaname = 'public' ORDER BY tablename;
```

---

## FASE 3 — Migración de datos (opcional, solo si el usuario lo pide)

**Pregúntate antes de empezar:** ¿el usuario realmente quiere preservar la data del origen, o va a crear data fresca? El caso común con Lovable es "quiero el esquema y functions, pero voy a usar data nueva". Si es eso, **salta esta fase entera** y usa el atajo de `setup-admin` (0.17).

Solo migra datos si el usuario explícitamente lo pide.

### ⚠️ 3.0 CRÍTICO: Migrar auth.users PRIMERO con UUIDs originales

**Este es el error más común y más destructivo.** Si los usuarios se crean en el nuevo Supabase de forma normal (registro en la app), reciben UUIDs nuevos que no coinciden con los de la data migrada. Toda la data queda huérfana.

La solución es insertar los usuarios directamente en `auth.users` usando sus UUIDs originales, antes de migrar cualquier otra tabla.

**Paso 1 — Exportar usuarios del origen:**
```sql
SELECT 
  id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, raw_app_meta_data,
  created_at, updated_at, role, aud, instance_id
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

**Paso 3 — También migrar `auth.identities` y limpiar tokens NULL** (sección 0.16). Sin esto el login falla con HTTP 500.

**Regla de oro:** `auth.users` → `auth.identities` → cleanup tokens → `profiles` → resto de tablas. Nunca al revés.

**Verificar antes de continuar:**
```sql
SELECT COUNT(*) FROM auth.users; -- debe coincidir con el origen
SELECT COUNT(*) FROM auth.identities; -- también
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

### 3.2 Insertar datos en destino

Orden importante (respetar foreign keys):
1. Tablas sin dependencias primero (profiles, categories, projects)
2. Luego tablas que referencian a las anteriores (tasks, notes, links)
3. Al final, tablas junction o de relaciones (friendships, item_shares, etc.)

### 3.3 Subtablas y tablas secundarias

**Error común:** olvidar tablas menos evidentes como `subtasks`, `recurring_tasks`, `friendship_tokens`, etc.

Verifica que exportaste TODAS las tablas del inventario de la Fase 1.

---

## FASE 4 — Migración de Edge Functions

Las edge functions NO se incluyen en pg_dump. Vienen del repo de GitHub.

### 4.1 Para cada función en `supabase/functions/<nombre>/index.ts`

```
read: <repo>/supabase/functions/<nombre>/index.ts
mcp__supabase__deploy_edge_function:
  project_id=<destino>
  name=<nombre>
  entrypoint_path="index.ts"
  verify_jwt=<según matriz en 0.9>
  files=[{"name":"index.ts","content":<contenido>}]
```

### 4.2 Funciones que usan AI (LOVABLE_API_KEY)

⚠️ **NO funcionan fuera de Lovable Cloud** (ver 0.13). Decide:

**Opción A:** mantén el código tal cual y deja al usuario el problema. No es mi recomendación, pero ahorra tiempo si vas a usar el flow 0.12 (clonar proyecto Lovable, donde Lovable reescribe estas funciones).

**Opción B (recomendada si no usas 0.12):** reescribe ANTES de hacer deploy:

```ts
// ANTES
const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}` },
  body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: [...] })
});

// DESPUÉS (OpenAI)
const resp = await fetch("https://api.openai.com/v1/chat/completions", {
  headers: { Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}` },
  body: JSON.stringify({ model: "gpt-4o-mini", messages: [...] })
});
```

**Avisa al usuario** en el reporte final qué funciones requieren `OPENAI_API_KEY` (u otra) y cuáles ya están listas.

### 4.3 Función `workflow-runs` o similares fantasma

Si aparece en logs de 404 pero no en el repo de GitHub, probablemente fue eliminada. No la recrear.

### 4.4 Verificar deploy

```
mcp__supabase__list_edge_functions(project_id)
```
Todas deben aparecer con `status: "ACTIVE"`.

---

## FASE 5 — Actualizar repo (URL/key + hardcoded fallback)

**Esta fase siempre se hace.** Lovable se conecta a GitHub, así que basta con pushear cambios al repo y Lovable los recoge automáticamente.

### 5.1 Obtener URL y anon key del destino

```
mcp__supabase__get_project_url(id=<destino>)
mcp__supabase__get_publishable_keys(project_id=<destino>)
```

Usa la **legacy anon key** (formato JWT `eyJ...`) para los `VITE_*_KEY` porque es la que el código React generado por Lovable espera.

### 5.2 Actualizar `.env`

```
VITE_SUPABASE_PROJECT_ID="<nuevo-project-id>"
VITE_SUPABASE_PUBLISHABLE_KEY="<nueva-anon-key>"
VITE_SUPABASE_URL="https://<nuevo-project-id>.supabase.co"
```

Si el `.env` tiene vars secundarias (ej. `VITE_BOT_SUPABASE_*` para otro proyecto Supabase que ahora se consolida), apúntalos al mismo destino. Mantén vars custom como `VITE_META_PIXEL_ID` sin tocar.

### 5.3 Actualizar `supabase/config.toml`

```toml
project_id = "<nuevo-project-id>"
```

### 5.4 Hardcodear fallback en `src/integrations/supabase/client.ts`

**Esto es importante — y OJO con el matiz (lección de campo).** Si el proyecto SIGUE en Lovable Cloud, Lovable **INYECTA sus propias `VITE_SUPABASE_*` en el build**, así que un `import.meta.env.X || fallback` **NO sirve**: el env de Lovable gana y la app se queda apuntando al Supabase interno. Para FORZAR el externo aun estando en Lovable, **hardcodea SIN leer el env** (ignóralo por completo):

```ts
// Proyecto en Lovable Cloud: hardcodear DURO (ignorar import.meta.env; Lovable lo pisaría).
const SUPABASE_URL = "https://<nuevo>.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "<nueva-anon-key>";
```

Si el proyecto NO está en Lovable Cloud, el patrón `import.meta.env.X || "<fallback>"` sí es válido. Verifica tu caso (0.11). Confirma el resultado en el bundle desplegado: debe contener el project_id NUEVO y NINGUNA referencia al viejo (`grep` del bundle).

Aplica el mismo patrón a cualquier otro cliente Supabase que encuentres (`glob: src/integrations/**/client.ts`).

### 5.5 Verificar que no quedan referencias al project_id viejo

```bash
grep -r "<project-id-viejo>" <repo>/src <repo>/supabase
```
No debería quedar ninguna (excepto en migraciones históricas, donde está bien).

### 5.6 Commit y push

Si `git commit` falla con "Author identity unknown":
```bash
git config user.email "<email-del-usuario>"    # del CLAUDE.md o git log previo
git config user.name "<github-username>"
```

```bash
git add .env src/integrations/**/client.ts supabase/config.toml
git commit -m "chore: migrate Supabase from Lovable (<old-id>) to self-hosted (<new-id>)

- Update .env to point to <new-id>.supabase.co
- Update supabase/config.toml project_id
- Add hardcoded fallback URLs in client.ts to ensure connection
  works even if env vars are not injected

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push origin main
```

Lovable recoge el cambio del repo automáticamente.

---

## FASE 6 — Crear admin inicial

Si el proyecto tiene `setup-admin` edge function (ver 0.17), úsala:

```bash
curl -s -X POST "https://<DEST>.supabase.co/functions/v1/setup-admin" \
  -H "Content-Type: application/json" \
  -H "apikey: <anon-key>" \
  -d '{"email":"<email>","password":"<password-fuerte>"}'
```

Verifica con SQL que tenga role `admin`. Devuelve credenciales al usuario en el reporte final.

Si NO tiene `setup-admin`, crea el admin manualmente:
```sql
-- 1. Insertar en auth.users (con UUID generado o el del usuario si lo tienes)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, ...) VALUES (...);
-- 2. Insertar en auth.identities
-- 3. Limpiar tokens NULL (sección 0.16)
-- 4. Insertar role admin en user_roles
INSERT INTO public.user_roles (user_id, role) VALUES ('<uuid>', 'admin');
```

O crea el user vía la API de Supabase Auth con `supabase.auth.admin.createUser({email, password, email_confirm: true})` desde un script Node.

---

## FASE 7 — Configurar Secrets (manual por el usuario)

Lista los secrets identificados en 1.5 y dile al usuario que los configure en:
**Supabase Dashboard → Settings → Edge Functions → Secrets**

Si reescribiste funciones para usar OpenAI/Anthropic, incluye `OPENAI_API_KEY` o `ANTHROPIC_API_KEY` (no `LOVABLE_API_KEY`).

---

## FASE 8 — Verificación post-migración

```sql
-- Tablas
SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;

-- Conteos (si migraste data)
SELECT schemaname, tablename, n_live_tup FROM pg_stat_user_tables;

-- Storage buckets
SELECT id, name, public FROM storage.buckets;

-- Edge functions activas
-- mcp__supabase__list_edge_functions(project_id)

-- Advisors de seguridad
-- mcp__supabase__get_advisors(project_id, type='security')
```

Si `get_advisors` reporta warnings de `function_search_path_mutable` en funciones que tú creaste, corrígelas con `SET search_path TO 'public'`. Las warnings de funciones preexistentes (de otros proyectos del usuario) ignóralas.

Test manual mínimo:
- Login / autenticación
- Crear y leer datos básicos
- Cualquier función AI (genera, optimiza, clasifica)
- Envío de emails si aplica

---

## FASE 9 — Reporte final al usuario

Estructura del reporte (en español, directo):

```
✅ Migración completa

1. Schema: N tablas, M enums, K buckets, X funciones, triggers — todo en destino.
2. Edge functions deployadas (Y funciones, todas ACTIVE).
   ⚠️ Funciones que requieren reescritura/secrets: <lista>
3. Usuario admin creado:
   - Email: <email>
   - Password: <password>
4. Repo actualizado y pusheado (commit <sha>).
   Lovable lo recogerá automáticamente.

⚠️ Lo único que requiere TU mano (no puedo hacerlo vía MCP):
Configurar secrets en Supabase Dashboard → Settings → Edge Functions → Secrets:
- RESEND_API_KEY (para email)
- OPENAI_API_KEY o ANTHROPIC_API_KEY (si reescribiste las funciones AI)
- <otros secrets identificados>

(Si el proyecto estaba en Lovable Cloud y necesitas nuevo proyecto Lovable, ver guía 0.12)
```

**NO incluyas pasos que ya hiciste.** No digas "actualiza el .env" si ya lo actualizaste y pusheaste.

---

## FASE 10 — Reconciliación post-switch y cutover a Cloudflare (dejar Lovable del todo)

Las fases 0-9 asumen una migración LIMPIA de una sola vez. La realidad casi siempre es más sucia y esta fase la cubre. **Re-invoca este skill cuando el usuario diga: "faltan datos/empresas", "antes eran más", "verifica la migración", "quiero olvidarme de Lovable", "migremos a Cloudflare".** No asumas que la migración inicial dejó todo — reconcilia contra el interno (su SQL editor, 0.3).

**Escenario típico:** la app ya se cambió a apuntar al externo, PERO (a) la data quedó partida (unas tablas más completas en el interno, otras en el externo), y/o (b) el usuario SIGUIÓ trabajando en Lovable (su IA o equipo) después de migrar, y/o (c) el objetivo real es DEJAR Lovable por completo (mover hosting a Cloudflare), no solo repuntar.

### 10.1 Reconciliar datos partidos (interno vs externo) — por NOMBRE, no por id

Compara CONTEOS de tablas clave en AMBOS lados (interno via Lovable SQL editor 0.3; externo via MCP):
```sql
SELECT 'clients' t, count(*) FROM clients UNION ALL SELECT 'commissions', count(*) FROM client_commissions
UNION ALL SELECT 'companies', count(*) FROM companies UNION ALL SELECT 'templates', count(*) FROM email_templates;
```
- Si el EXTERNO tiene MÁS (ej. catálogo completo importado) → el externo gana, no toques.
- Si el INTERNO tiene más en CONFIG (comisiones, etc.) → puede ser data que capturaron en Lovable después de migrar… **pero también puede ser la data VIEJA/mal capturada que ya corregiste en el externo. NO importes a ciegas** (re-romperías lo verificado).
- Las llaves (`client_id`, `company_id`) NO coinciden entre interno y externo si el catálogo difiere. **Sincroniza config MATCHEANDO POR NOMBRE** del cliente/empresa, agregando solo lo que falte, sin sobrescribir lo verificado.

### 10.2 Schema drift: el externo puede tener MENOS columnas que la app espera

Una migración apresurada deja la tabla del externo SIN columnas que el código usa (ej. `companies` sin `domicilio_fiscal`, `estatus_empresa`) → la vista sale **EN BLANCO** o con error oculto. Compara columnas (`information_schema.columns`) interno vs externo, agrega las que falten:
```sql
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS estatus_empresa text, ADD COLUMN IF NOT EXISTS domicilio_fiscal text;
```
…y **recarga la caché** (10.3).

### 10.3 ⚠️ CRÍTICO: recargar la caché de PostgREST tras CUALQUIER DDL en el externo

Tras crear/migrar tablas o columnas, PostgREST mantiene la caché vieja: el front da **"Could not find the table/column X in the schema cache"** y los INSERT fallan **aunque la tabla/columna, grants y RLS estén bien**. Se ve como "no guarda", "no vincula", "pantalla en blanco". Fix (córrelo después de TODO ALTER/CREATE):
```sql
NOTIFY pgrst, 'reload schema';
```
Verifica con un INSERT real (HTTP 201) usando un JWT de un usuario con la RLS correcta.

### 10.4 Migrar ARCHIVOS de Storage (NO migran con la DB)

`pg_dump`/migraciones NO traen los archivos (logos, membretes, actas, PDFs). Lístalos en el interno:
```sql
SELECT bucket_id, count(*), round(sum((metadata->>'size')::bigint)/1048576.0,1) mb FROM storage.objects GROUP BY bucket_id;
```
Realidad: los buckets suelen ser PRIVADOS (no hay URL pública para curl) y los paths usan IDs internos (≠ externos, no "religan" solos). **Lo más rápido y limpio casi siempre: RE-SUBIR los pocos archivos importantes (logos/membretes) desde la propia app** — queda bien ligado a la entidad del externo. Migrar archivo-por-archivo por el navegador (download autenticado → re-upload) es lento; resérvalo para cuando son muchos y críticos.

### 10.5 Cutover de HOSTING a Cloudflare (dejar Lovable del todo)

Si el usuario quiere ABANDONAR Lovable (no solo repuntar):
1. **client.ts HARDCODEADO** (5.4 corregido) — para que Lovable deje de imponer su Cloud.
2. **Build + deploy:** `npx wrangler@3 pages deploy dist --project-name=<x>` (wrangler 4 necesita Node 22). **Quita assets > 25 MB** antes (`find dist -type f -size +25M -delete`) — límite de Cloudflare Pages.
3. **Ruteo SPA:** Cloudflare Pages YA hace fallback a index.html; las URLs directas (`/app/...`) funcionan sin `_redirects`. Verifica: `curl -o /dev/null -w "%{http_code}" https://<proj>.pages.dev/ruta/profunda` → 200.
4. **Auto-deploy** (reemplaza el auto-rebuild de Lovable): un proyecto Pages de "direct upload" (wrangler) NO se conecta a git desde el panel → usa una **GitHub Action** con `cloudflare/wrangler-action@v3` en push a main. El usuario agrega 2 secrets al repo: `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` (TÚ no los pongas — son credenciales en un servicio; instruye al usuario). Verifica: `gh run watch <id> --exit-status`.
5. **Dominio:** apuntar el dominio a Cloudflare (DNS, lo hace el usuario). Mientras, `*.pages.dev` sirve igual.

### 10.6 ⚠️ Hazard: edición en PARALELO (Lovable AI + tú)

Si la app ya apunta al externo PERO el usuario sigue pidiéndole cambios a la IA de Lovable, **ambos editan el MISMO repo + la MISMA base** → se pisan (los commits de Lovable caen al repo donde trabajas; uno revierte al otro; verás "Pushed from GitHub" o cambios que no hiciste, y `git push` rechazado por rebase). **Avísale al usuario: iniciado el cutover, TODOS los cambios (código y datos) por UN solo canal.**

### 10.7 Auth sin SMTP: autoconfirm + crear usuarios por SQL

Si no hay `setup-admin` ni SMTP:
- Activa auto-confirmación (Management API, Bearer = access token de Supabase): `PATCH https://api.supabase.com/v1/projects/<ref>/config/auth` con `{"mailer_autoconfirm": true}` → los registros entran sin verificar correo.
- Crea usuarios directo por SQL, confirmados: `INSERT auth.users` (con `encrypted_password = extensions.crypt('Temp!', extensions.gen_salt('bf'))`, `email_confirmed_at = now()`) + `INSERT auth.identities` (identity_data con `sub`+`email`+`email_verified:true`) + `UPDATE public.user_profiles SET role=..., office_id=...`. Entrega el password temporal para que lo cambien. (El trigger `handle_new_user` suele crear el profile solo; tú solo ajustas role/oficina.)

---

## Problemas frecuentes y soluciones

| Problema | Causa | Solución |
|---|---|---|
| WebFetch a GitHub da 404 | Repo privado | Usa `gh repo clone` autenticado |
| `git commit` falla con "Author identity unknown" | Git config local vacío | `git config user.email` + `git config user.name` |
| `ALTER TYPE ADD VALUE` falla en mismo migration | PostgreSQL requiere commit antes de usar | Separar en dos `apply_migration` calls |
| Edge function deploy falla con UTF-8 corrupto | `cat \| python` corrompe en Windows | Escapar manualmente con `\u00XX` o usar `json.dumps(ensure_ascii=False, encoding='utf-8')` |
| Lovable no toma la nueva URL después de push | Cache o env vars no inyectadas | Hardcodear fallback en `client.ts` (5.4) |
| Edge function da 401 | Falta secret configurado | Avisar al usuario que configure los secrets |
| Bucket ya existe error | Bucket de otro proyecto en mismo Supabase | `ON CONFLICT (id) DO NOTHING` en `INSERT INTO storage.buckets` |
| Storage policy duplicada error | Nombre genérico que choca | Renombrar con sufijo único (`"Public read access email-assets"`) |
| Función edge `workflow-runs` da 404 en logs | Función obsoleta del frontend | Ignorar si no está en el repo |
| Login da HTTP 500 "Database error querying schema" | Falta `auth.identities` o tokens NULL | Ver sección 0.16 |
| Columnas aparecen como NULL o vacías | Export con columnas selectivas | Re-exportar con `SELECT *` y UPDATE masivo |
| AI function da error de auth | `LOVABLE_API_KEY` no funciona fuera de Lovable | Reescribir con OpenAI/Anthropic (0.13) |
| Lovable sobrescribe `client.ts` o `.env` | Proyecto en Lovable Cloud, sigue conectado al interno | Crear NUEVO proyecto Lovable (0.12) |
| Trigger duplica filas en `profiles` al migrar | `on_auth_user_created` trigger | Usar `ON CONFLICT DO NOTHING` o UPDATE en lugar de INSERT (0.8) |
| EPERM al escribir SKILL.md | Archivo read-only por skill system | `chmod u+w SKILL.md` antes de editar, `chmod u-w` después |
| SQL editor cuelga con paste >150K chars | Límite del Monaco editor | Particionar en chunks de 250 filas / usar MCP `execute_sql` |
| "Could not find the table/column X in schema cache" / "no guarda" / "no vincula" tras migrar | Caché de PostgREST vieja tras DDL | `NOTIFY pgrst, 'reload schema'` en el externo (10.3) |
| Una vista sale EN BLANCO tras migrar | El externo no tiene columnas que la app espera | Comparar columnas + `ALTER ADD COLUMN IF NOT EXISTS` + recargar caché (10.2/10.3) |
| La app sigue en el Supabase interno pese al fallback `\|\|` | Lovable Cloud inyecta su env y gana sobre el `\|\|` | Hardcodear DURO sin leer env (5.4) |
| "Hay menos datos/empresas que antes" | Data partida interno/externo, o agregada en Lovable después de migrar | Reconciliar por NOMBRE; no importar a ciegas (10.1) |
| Commits "Pushed from GitHub" o `git push` rechazado que tú no hiciste | Edición en paralelo con la IA de Lovable sobre el mismo repo/base | Un solo canal de cambios tras el cutover (10.6) |
| Storage vacío en el externo / empresas sin logo | Los archivos no migran con la DB | Re-subir desde la app o migrar objects (10.4) |

---

## Checklist completo (versión autónoma)

```
FASE 0 — Setup
□ gh auth status OK (path rápido) o Chrome MCP cargado (path Chrome)
□ Acceso al código del repo (clone o ZIP)
□ Anon key del destino capturado (sb_publishable_xxx o legacy eyJ...)
□ Identificado si el proyecto está en Lovable Cloud (0.11) o externo
□ Si Lovable Cloud: usuario sabe que necesita crear NUEVO proyecto Lovable (0.12)
□ Funciones con LOVABLE_API_KEY identificadas (0.13)

FASE 1 — Inventario
□ Migraciones en supabase/migrations/ listadas en orden cronológico
□ Edge functions en supabase/functions/ listadas
□ project_id origen (supabase/config.toml)
□ .env leído (vars custom identificadas)
□ src/integrations/**/client.ts identificados (uno o varios)
□ Estado del destino: list_tables, list_edge_functions, list_extensions
□ Triggers/funciones del destino (conflictos potenciales)
□ Secrets necesarios (grep Deno.env.get)

FASE 2 — Schema
□ Cada migración aplicada en orden cronológico con apply_migration
□ ALTER TYPE ADD VALUE en transacciones separadas de su uso
□ Storage buckets con ON CONFLICT (id) DO NOTHING
□ Policies genéricas renombradas con sufijo único
□ Extensiones pg_cron + pg_net si las usa el proyecto
□ Verificación: SELECT tablename FROM pg_tables

FASE 3 — Datos (si aplica)
□ auth.users insertado con UUIDs originales
□ auth.identities insertado (CRÍTICO, ver 0.16)
□ Tokens NULL limpiados a '' (CRÍTICO, ver 0.16)
□ Login probado via API directo (status 200)
□ profiles + resto de tablas en orden de FK
□ Conteos origen vs destino comparados

FASE 4 — Edge functions
□ Cada función deployada con verify_jwt correcto (matriz 0.9)
□ Funciones con LOVABLE_API_KEY reescritas o flag al usuario
□ UTF-8 manejado (escape \uXXXX o ensure_ascii=False)
□ list_edge_functions → todas ACTIVE

FASE 5 — Repo
□ .env actualizado con nuevo project_id/URL/key
□ supabase/config.toml actualizado
□ client.ts con hardcoded fallback (todos los clientes)
□ grep del project_id viejo → 0 resultados en src/
□ git config user.email/name si hace falta
□ git commit + push origin main

FASE 6 — Admin
□ setup-admin llamada vía curl (o creación manual)
□ Verificación SQL: role admin asignado

FASE 7 — Secrets
□ Lista de secrets entregada al usuario (no la puedes configurar tú)

FASE 8 — Verificación
□ Tablas, edge functions, buckets verificados
□ get_advisors → fixes en funciones nuevas si search_path mutable
□ Login y data básica probados

FASE 9 — Reporte
□ Resumen al usuario con admin creds + lista de secrets a configurar
□ Funciones que requieren reescritura mencionadas explícitamente
□ NO incluir pasos que ya hiciste
```
