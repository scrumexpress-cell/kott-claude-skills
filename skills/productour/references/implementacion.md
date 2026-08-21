# Implementación del módulo Product Tour

Código listo para copiar. Está pensado para el stack que usan todas las plataformas de AED: React + Vite + TypeScript + Tailwind + React Router + shadcn/ui. Si una plataforma usa otra cosa, la estructura de datos (`src/tours/`) no cambia; solo el componente que la consume.

---

## 1. Instalar

```bash
npm i driver.js
```

MIT, cero dependencias, ~5 KB. No hay servicio que contratar ni cuenta que crear.

**Shepherd.js está descartado por licencia**: es AGPL-3.0, y ese copyleft contamina el código que Héctor le entrega al cliente como propiedad suya. Es una trampa que solo se ve al leer el `package.json`.

---

## 2. Los tipos

`src/tours/tipos.ts`

```ts
/**
 * Un paso apunta a un elemento REAL de la pantalla y trae sus dos narraciones.
 *
 * El texto se guarda por separado para demo y para aprendizaje porque el mismo
 * paso le habla a dos personas distintas: al dueño que está decidiendo comprar,
 * y al empleado que va a usarlo mañana. Escribir uno solo y reusarlo produce un
 * texto que no le sirve a ninguno de los dos.
 */
export interface PasoTour {
  /** Selector del elemento a resaltar. SIEMPRE [data-tour="..."], nunca una clase. */
  elemento?: string
  titulo: string
  /** Narración para cuando Héctor presenta: qué problema del cliente resuelve. */
  demo: string
  /** Narración para el usuario que aprende: qué toca y qué pasa. */
  aprender: string
  /** Si el paso vive en otra pantalla, la ruta a la que hay que navegar antes. */
  ruta?: string
  lado?: 'top' | 'bottom' | 'left' | 'right'
}

export interface Tour {
  id: string
  /** Nombre en la voz del negocio: "Así nace un cliente", no "Módulo CRM". */
  nombre: string
  descripcion: string
  /** Minutos estimados. Se calcula ~20 s por paso; sirve para que nadie lo empiece a destiempo. */
  minutos: number
  /** 'negocio' = el recorrido completo. 'modulo' = uno dedicado. */
  tipo: 'negocio' | 'modulo'
  pasos: PasoTour[]
}
```

### Las etapas se derivan del recorrido, no se escriben aparte

Una etapa es **un tramo del recorrido del negocio**, marcado por índices. Escribir los pasos dos veces —una en el recorrido completo y otra en el tour de módulo— es lo que hace que se desincronicen a la primera corrección.

```ts
export interface Etapa {
  /** 1, 2, 3… El número que ve el usuario. */
  numero: number
  /** Qué pasa en el negocio: "Se consigue al cliente". No el nombre del módulo. */
  titulo: string
  descripcion: string
  /** Índices dentro de tourNegocio.pasos: [desde, hasta) */
  rango: [number, number]
}

/** El tour de una etapa: los mismos pasos del recorrido, cortados. */
export function tourDeEtapa(negocio: Tour, e: Etapa, total: number): Tour {
  const pasos = negocio.pasos.slice(...e.rango)
  return {
    id: `etapa-${e.numero}`,
    nombre: `${e.numero}. ${e.titulo}`,
    // El tour de etapa nunca es un callejón sin salida: dice dónde está parado.
    descripcion: `Etapa ${e.numero} de ${total}. ${e.descripcion}`,
    minutos: Math.max(1, Math.round((pasos.length * 20) / 60)),
    tipo: 'modulo',
    pasos,
  }
}
```

Y la numeración que ve el usuario es **continua sobre el recorrido completo**, no reiniciada por etapa: es el número lo que le dice cuánto falta.

```ts
// driver.js numera dentro del tour que está corriendo, así que el desplazamiento
// se pasa explícito para que la etapa 3 empiece en "paso 8 de 20" y no en "1 de 4".
progressText: `paso {{current}} de ${negocio.pasos.length}`,
// …con los pasos de la etapa desplazados por e.rango[0] al construir los DriveStep.
```

### Cambiar de puesto en vez de bloquear

Si una pantalla está protegida por rol, el tour **cambia el rol y lo devuelve**. Nunca deshabilita el botón.

```ts
const rolOriginal = useRef<Rol | null>(null)

// Antes de resaltar: si el paso declara un puesto y no es el activo, se cambia.
onHighlightStarted: (_el, _step, opts) => {
  const p = tour.pasos[opts.state.activeIndex ?? 0]
  if (p?.rol && p.rol !== rol) {
    if (rolOriginal.current === null) rolOriginal.current = rol   // guardar UNA vez
    setRol(p.rol)
  }
  …
},

// Se restaura SIEMPRE, incluso si el usuario cierra a media marcha: onDestroyed
// corre también al oprimir Esc o la ✕, que es justo cuando se quedaba cambiado.
onDestroyed: () => {
  if (rolOriginal.current !== null) {
    setRol(rolOriginal.current)
    rolOriginal.current = null
  }
},
```

El cambio se cuenta en la narración, porque es parte de la historia y no un tecnicismo: *"esta pantalla la abre compras — te pongo en ese puesto para que la veas"*.

---

## 3. El hook que corre el tour

`src/tours/useTour.ts`

```ts
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import type { Tour } from './tipos'

const VISTOS = 'tour.vistos'

export function useTour() {
  const navigate = useNavigate()

  const correr = useCallback(
    (tour: Tour, modo: 'demo' | 'aprender' = 'demo') => {
      const pasos: DriveStep[] = tour.pasos.map((p) => ({
        element: p.elemento,
        popover: {
          title: p.titulo,
          description: modo === 'demo' ? p.demo : p.aprender,
          side: p.lado ?? 'bottom',
          align: 'start',
        },
      }))

      const d = driver({
        showProgress: true,
        allowClose: true,
        overlayOpacity: 0.65,
        // En español: driver.js viene en inglés y "Next" en una demo a un cliente
        // mexicano desentona lo suficiente como para que valga la pena.
        nextBtnText: 'Siguiente',
        prevBtnText: 'Atrás',
        doneBtnText: 'Terminar',
        progressText: '{{current}} de {{total}}',
        steps: pasos,

        // Los pasos que viven en otra pantalla necesitan que la ruta cambie ANTES
        // de que driver busque el elemento. Sin esto el paso no resalta nada y el
        // recorrido se rompe en silencio — justo enfrente del cliente.
        onHighlightStarted: (_el, step, opts) => {
          const i = opts.state.activeIndex ?? 0
          const ruta = tour.pasos[i]?.ruta
          if (ruta && window.location.pathname !== ruta) {
            navigate(ruta)
          }
        },

        onDestroyed: () => {
          const vistos: string[] = JSON.parse(localStorage.getItem(VISTOS) ?? '[]')
          if (!vistos.includes(tour.id)) {
            localStorage.setItem(VISTOS, JSON.stringify([...vistos, tour.id]))
          }
        },
      })

      // Si el primer paso vive en otra pantalla, se navega primero y se espera a
      // que React pinte. 400 ms alcanza para un cambio de ruta con datos en caché;
      // para pantallas que consultan al servidor, el propio driver reintenta.
      const primera = tour.pasos[0]?.ruta
      if (primera && window.location.pathname !== primera) {
        navigate(primera)
        setTimeout(() => d.drive(), 400)
      } else {
        d.drive()
      }
    },
    [navigate],
  )

  const vistos = (): string[] => JSON.parse(localStorage.getItem(VISTOS) ?? '[]')

  return { correr, vistos }
}
```

---

## 4. Marcar los elementos

En cada componente que el tour toca:

```tsx
<Card data-tour="crm-embudo"> … </Card>
<Button data-tour="pedido-nuevo">Nuevo pedido</Button>
```

**Esto no es opcional y es la diferencia entre un tour que aguanta y uno que se rompe.** Un selector como `.grid > div:nth-child(2)` o `.bg-white.rounded-lg` funciona hoy y muere la próxima vez que alguien reacomode clases de Tailwind — y muere en silencio, sin error en consola. El `data-tour` además deja escrito en el código que ese elemento es parte de un recorrido, para que el siguiente que lo edite lo piense dos veces.

---

## 5. La pantalla

`src/pages/ProductTour.tsx` — la estructura mínima:

```tsx
const { correr, vistos } = useTour()
const [modo, setModo] = useState<'demo' | 'aprender'>('aprender')
const yaVistos = vistos()

// El recorrido del negocio va arriba y solo o casi solo: es la historia completa
// y lo que Héctor usa para presentar. Los de módulo son consulta puntual.
const negocio = TOURS.filter((t) => t.tipo === 'negocio')
const modulos = TOURS.filter((t) => t.tipo === 'modulo')
```

Con:
- Interruptor **Demo / Aprender** arriba, explicando en una línea qué cambia.
- El recorrido del negocio como tarjeta grande, con sus minutos.
- Los de módulo en rejilla, con palomita en los ya vistos.
- Botón para reiniciar el progreso (limpia `localStorage`).

Registro en el router y en el menú, **hasta abajo**:

```tsx
<Route path="/product-tour" element={<ProductTour />} />
```

```ts
// navegacion.ts — siempre el último, separado del resto
{ to: '/product-tour', label: 'Product Tour', icon: Compass, alFinal: true }
```

---

## 6. Dónde vive cada tour

```
src/tours/
├── tipos.ts
├── useTour.ts
├── index.ts          ← exporta TOURS: Tour[]
├── negocio.ts        ← el recorrido completo, en orden de operación
├── crm.ts
├── cotizaciones.ts
└── …                 ← uno por módulo
```

Que sean **datos y no componentes** es deliberado: un cambio de texto no es un desarrollo, es editar un archivo. Héctor puede pedir "cambia esa frase" y se resuelve en un minuto sin tocar la aplicación.

---

## 7. Ejemplo real — Cucina Capitale

El recorrido del negocio, en el orden en que ellos trabajan (sacado de sus cuatro juntas, no del menú):

```ts
export const tourNegocio: Tour = {
  id: 'negocio',
  nombre: 'Cómo se ve un proyecto de principio a fin',
  descripcion: 'De la publicación que atrae al cliente hasta la última estimación cobrada.',
  minutos: 10,
  tipo: 'negocio',
  pasos: [
    {
      ruta: '/contenido',
      elemento: '[data-tour="contenido-estudio"]',
      titulo: 'Aquí nace el cliente',
      demo: 'Todo empieza antes de que alguien llame. La residente sube la foto desde la obra, se etiqueta, y de ahí sale la publicación. Nada se publica sin que alguien la apruebe: eso lo pidieron ustedes explícitamente.',
      aprender: 'Desde aquí armas la publicación. Escoges el material que subió la residente, redactas y la mandas a aprobación.',
    },
    {
      ruta: '/crm',
      elemento: '[data-tour="crm-embudo"]',
      titulo: 'El prospecto pide informes',
      demo: 'Este tablero reemplaza el Excel que hoy se revisa los viernes. Cada tarjeta trae su monto, su siguiente acción y cuántos días lleva sin moverse — que es lo que hoy no se ve.',
      aprender: 'Arrastra la tarjeta conforme avanza el prospecto. Si lleva más de 30 días quieto, se marca solo.',
    },
    {
      ruta: '/cotizador',
      elemento: '[data-tour="cotizador-fuentes"]',
      titulo: 'Se arma la cotización',
      demo: 'Las cotizaciones no nacen aquí: nacen en Teowin y en Lancaster. Esta pantalla las junta con equipos y piedra en la propuesta que ve el cliente, agrupada como ustedes la entregan.',
      aprender: 'Traes la cotización de fábrica, agregas equipos y cubiertas, y el sistema arma el documento final.',
    },
    // …producción, obra, instalación, cobro, administración
  ],
}
```

Fíjate en tres cosas del ejemplo:

1. **Empieza en `/contenido`**, que en el menú está a media lista. Empieza ahí porque ahí empieza el dinero.
2. **La narración de demo cita lo que ellos dijeron** ("eso lo pidieron ustedes explícitamente", "el Excel que hoy se revisa los viernes"). Eso sale de las juntas y es lo que hace que el cliente asienta.
3. **El paso del cotizador respeta el límite de alcance** que ellos mismos pusieron: no promete que el ERP arme el mueble. Un tour que promete de más es igual de caro que una cotización que promete de más — y se descubre más rápido.
