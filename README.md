# kott-claude-skills

Marketplace personal de skills de Claude Code, sincronizados entre máquinas vía GitHub.

## Qué incluye

| Skill | Para qué |
|---|---|
| **cotizacion-saas** | Genera cotizaciones profesionales de software y SaaS con estructura win-win. |
| **granolanotes-to-mvp** | Toma transcript de discovery call → plan técnico + plan de demo para arrancar un MVP nuevo. |
| **granolanotes-to-requirements** | Toma transcript de reunión con cliente existente → identifica pain points y AUTO-EJECUTA cambios en Supabase + repo. |
| **lovable-to-supabase** | Migra un proyecto Supabase hosteado en Lovable a tu propia instancia. |

## Cómo instalar (en cualquier máquina)

### En Claude Code o Claude Cowork

```
/plugin marketplace add scrumexpress-cell/kott-claude-skills
/plugin install kott-skills@kott-skills
```

Con eso obtienes los 4 skills en una sola instalación.

O desde terminal:

```bash
claude plugin marketplace add scrumexpress-cell/kott-claude-skills
claude plugin install kott-skills@kott-skills
```

### Cómo invocarlos

Cada skill queda namespaceado bajo `kott-skills:`:

```
/kott-skills:cotizacion-saas
/kott-skills:granolanotes-to-mvp
/kott-skills:granolanotes-to-requirements
/kott-skills:lovable-to-supabase
```

(También se auto-activan cuando el contexto del chat coincide con su descripción — no siempre hay que invocarlos con slash.)

### Actualizar a la última versión

Cada commit a `main` cuenta como nueva versión:

```
/plugin marketplace update kott-skills
```

Reinicia Claude Code después y los cambios quedan activos.

## Flujo end-to-end con estos skills

```
Discovery call (primera vez)
  └─► granolanotes-to-mvp → Plan técnico + Plan de demo

Cotizar formal
  └─► cotizacion-saas → Propuesta con pricing y términos

Construir e iterar (cliente con sistema vivo)
  └─► granolanotes-to-requirements → Cambios aplicados en Supabase + frontend

Self-hostear cuando crezca
  └─► lovable-to-supabase → Migración de instancia
```

## Dónde funcionan estos skills (IMPORTANTE)

Claude Desktop maneja **DOS sistemas de skills separados**:

- **Sesiones "code" (Claude Code):** leen este repo directamente desde el disco
  (instalado como plugin marketplace —ver arriba— o como enlaces/junctions en
  `~/.claude/skills/`). Se **auto-actualizan con git** (`git pull` /
  `/plugin marketplace update`).

- **Sesiones "chat" y "design" (sincronizadas desde tu cuenta de Claude):** NO
  leen el disco; solo ven skills que estén **subidas a tu cuenta**. Para que
  aparezcan ahí:
  1. claude.ai o Claude Desktop → **Settings → Capabilities → Skills**.
  2. **Upload / Create skill** → sube un `.zip` por skill (un zip de la carpeta
     `skills/<nombre>/`, que contiene su `SKILL.md`).
  3. ⚠️ **Estas NO se auto-actualizan con git.** Cada vez que edites un skill en
     este repo, **re-genera su `.zip` y vuélvelo a subir a la cuenta**. Sin ese
     paso, chat y design seguirán usando la versión vieja.

> Recordatorio rápido en cada update: `git pull` cubre **code**; para **chat/design**
> hay que **re-subir el ZIP** del skill que cambió.

## Estructura del repo

```
kott-claude-skills/
├── .claude-plugin/
│   ├── marketplace.json       ← Manifest del marketplace
│   └── plugin.json            ← Manifest del plugin (repo = plugin)
└── skills/
    ├── cotizacion-saas/SKILL.md
    ├── granolanotes-to-mvp/SKILL.md
    ├── granolanotes-to-requirements/SKILL.md
    └── lovable-to-supabase/SKILL.md
```
