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

## Sobre Claude.ai web

Los skills de este marketplace **NO funcionan en Claude.ai chat web** — solo en Claude Code y Claude Cowork. Para Claude.ai chat, los skills se suben por un mecanismo aparte desde el panel de Anthropic.

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
