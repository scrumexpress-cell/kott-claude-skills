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
```

Después instala los skills que quieras (uno por uno):

```
/plugin install cotizacion-saas@kott-skills
/plugin install granolanotes-to-mvp@kott-skills
/plugin install granolanotes-to-requirements@kott-skills
/plugin install lovable-to-supabase@kott-skills
```

O desde terminal:

```bash
claude plugin marketplace add scrumexpress-cell/kott-claude-skills
claude plugin install cotizacion-saas@kott-skills
```

### Actualizar a la última versión

Cada commit a `main` cuenta como nueva versión. Para jalar cambios:

```
/plugin marketplace update kott-skills
/plugin install <skill-name>@kott-skills
```

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
│   └── marketplace.json       ← Manifest del marketplace
└── skills/
    ├── cotizacion-saas/
    │   ├── .claude-plugin/plugin.json
    │   └── SKILL.md
    ├── granolanotes-to-mvp/
    │   ├── .claude-plugin/plugin.json
    │   └── SKILL.md
    ├── granolanotes-to-requirements/
    │   ├── .claude-plugin/plugin.json
    │   └── SKILL.md
    └── lovable-to-supabase/
        ├── .claude-plugin/plugin.json
        └── SKILL.md
```
