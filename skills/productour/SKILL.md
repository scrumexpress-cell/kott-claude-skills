---
name: productour
description: "Construye el módulo Product Tour dentro de una plataforma de AED: un recorrido interactivo que cuenta cómo opera el negocio del cliente, módulo por módulo, en el orden real en que trabaja — no en el orden del menú. Sirve para dos cosas a la vez: darle a Héctor un guion para presentar la demo sin perderse, y que un usuario nuevo aprenda la plataforma sin leer un manual. Úsalo siempre que se hable de: product tour, tour de producto, recorrido guiado, onboarding, walkthrough, demo guiada, guion de demo, presentar la plataforma, tutorial interactivo, que el cliente aprenda a usar el sistema, o cuando pida un tour para alguna de sus plataformas (Cucina Capitale, lPet, Mr. Cocoa, DonPan, NIXGO, Trasenda, Jovi, Promasa, Solarium…). También cuando una demo esté lista y haya que prepararla para enseñarla."
---

# Product Tour: la plataforma contando cómo trabaja el negocio

Este skill construye un módulo llamado **Product Tour** dentro de cada plataforma, hasta abajo del menú. Adentro hay recorridos interactivos que van resaltando pantallas y explicando qué hace cada una — pero **el orden no es el del menú: es el orden en que el negocio del cliente opera de verdad**.

En Cucina Capitale eso significa empezar por marketing —cómo se arma un post de Instagram— porque ahí nace el cliente; seguir con el prospecto que pide informes, el diseño de su cocina, la cotización, la producción en planta, la instalación en obra, y terminar cuando se cobra la última estimación y queda registrada en administración. Ese recorrido *es* el negocio. El menú, en cambio, está ordenado por conveniencia técnica.

## Por qué existe, y por qué son dos cosas distintas

**Uno: que Héctor no se pierda presentando.** Una demo con veinte módulos se presenta mal si se navega improvisando. El tour le da un guion con orden, y cada paso trae qué decir. Deja de ser "déjame busco dónde estaba eso" y pasa a ser una historia que avanza.

**Dos: que el usuario nuevo no lea un manual.** Nadie lee manuales. Un recorrido que le va enseñando su propia pantalla, con sus propios datos, sí se termina.

Los dos usan el mismo recorrido, pero **la narración cambia de destinatario** y eso hay que respetarlo:

| | Modo demo (Héctor presentando) | Modo aprendizaje (usuario solo) |
|---|---|---|
| A quién le habla | Al dueño que está decidiendo comprar | Al empleado que va a usarlo mañana |
| Qué resalta | Qué problema suyo resuelve esta pantalla | Qué botón toca y qué pasa después |
| Tono | "Esto es lo que nos contaste que te dolía" | "Aquí capturas tu pedido" |
| Duración | 8–12 minutos, la historia completa | Por módulo, 60–90 segundos cada uno |

Un mismo paso se escribe distinto para cada modo. Ese par de textos es el trabajo real de este skill; lo técnico es la parte fácil.

## Lo primero: reconstruir el flujo del negocio

**Aquí es donde este tour se gana la vida, y es el paso que no se puede saltar.** Antes de escribir un solo paso, hay que saber cómo trabaja ese negocio — y eso no se deduce del código, se lee de sus juntas.

```sql
select titulo, fecha_reunion::date, resumen, notas_importantes, contactos
from biblio_reuniones_notas
where cliente_id = '<id>'
order by fecha_reunion;
```

De ahí sale lo que importa:

1. **Dónde empieza el dinero.** ¿Un post de Instagram? ¿Un vendedor en la calle? ¿Una licitación? Ése es el paso 1, aunque en el menú esté hasta abajo.
2. **Por dónde pasa después.** Sigue el rastro de una venta desde que aparece hasta que se cobra. Ese rastro es el recorrido.
3. **Quién toca qué.** En las juntas cada persona habla de su parte: Jennifer del CRM, Miguel de compras, Juan Carlos de administración. Esos nombres y esas frases son el guion.
4. **Qué les dolía.** Cada paso del tour debería poder decir, sin inventar, "esto es lo que nos contaste".

**Si el cliente no tiene juntas registradas, dilo y construye el tour desde la plataforma.** Sale más plano, pero es honesto. Lo que nunca se hace es inventarle al cliente un proceso que nunca describió: en la presentación se nota en tres segundos y se pierde la sala.

## Cómo se escribe cada paso

Cada paso apunta a un elemento real de la pantalla y trae su narración. Reglas que salieron de lo que funciona:

- **Título corto, en la voz del negocio.** "Aquí nace el cliente", no "Módulo de Contenido". El nombre del módulo ya está en el menú.
- **Dos o tres frases, no más.** Un tour que hay que leer no se termina. Si algo necesita cinco líneas, es dos pasos.
- **Habla de lo que la persona va a hacer**, no de lo que el sistema tiene. "Desde aquí mandas el pedido a facturación sin recapturarlo" pega; "módulo de captura con integración" no.
- **Encadena.** Cada paso termina insinuando el siguiente: *"…y cuando facturación lo libera, se va a producción"*. Eso es lo que convierte una lista de pantallas en una historia.
- **Nombra la inteligencia donde la haya**, con lo que hace: *"el sistema detecta solo si este hallazgo ya lo levantó otra área"*. Y solo donde de verdad algo pasa solo — un adorno falso aquí se descubre en vivo, frente al cliente, que es el peor lugar posible.

### Antes de escribir un paso, abre el código de esa pantalla

No basta con que la frase suene defendible: hay que ver qué hace la función que está detrás. Los tres engaños que salieron en la primera tanda, todos en pantallas que se veían perfectas:

- **Un banco de textos fijos disfrazado de IA.** Un `setTimeout` de 700 ms pintando *"Redactando…"* y luego un texto de un objeto literal. Se detecta buscando si existe **alguna** llamada a un modelo: si el único `fetch(` del repo sirve la página, no hay IA.
- **Una columna sembrada que parece un cálculo.** `score`, `prioridad`, `confianza` a veces son datos de la semilla y el código solo ordena por ellos. Un tour que dice *"el sistema clasifica solo"* sobre un `ORDER BY` se cae con una pregunta.
- **Una vista previa presentada como envío.** *"Ver correo: el mensaje tal cual le llegó al cliente"*, cuando la función lo **dibuja** en ese momento. Compruébalo con lo que no puede fingirse: ¿hay emisor, edge function, cron? Si no hay ninguno, no salió nada.

**Y lee lo que queda alrededor del resaltado.** El caso más caro fue una narración que afirmaba *"lo escribe la IA"* mientras el panel de abajo —dentro del mismo recuadro iluminado— decía *"Demo: en producción la IA generará…"*. El cliente lee el descargo mientras Héctor afirma lo contrario. Un paso puede ser falso **por lo que tiene al lado**, no solo por lo que dice.

Casi siempre lo verdadero vende igual de bien: *"el correo ya viene escrito con la voz del despacho, nadie se sienta a redactarlo el día del cumpleaños"* es tan fuerte como la mentira, y aguanta la pregunta que sigue.

## Qué se construye, en concreto

Tres piezas. La estructura vive completa en `references/implementacion.md`, con el código listo para copiar.

**1. El motor.** `driver.js` (MIT, cero dependencias, ~5 KB). Se instala con `npm i driver.js`. Nada de servicios de terceros: Userpilot, Appcues y Pendo cuestan cientos de dólares al mes, hospedan los datos fuera y contradicen la promesa de que el código es del cliente.

**2. La definición de los tours**, en un archivo de datos separado del código: `src/tours/<modulo>.ts`, más un `src/tours/index.ts` que los registra. Que sean datos y no componentes importa: así se corrigen sin tocar la aplicación, y Héctor puede pedir un cambio de texto sin que sea un desarrollo.

**3. La pantalla `/product-tour`**, hasta abajo del menú. Cómo se arma, abajo.

## La pantalla es un proceso numerado, no una rejilla de módulos

**Éste es el error que hay que evitar, y es el que salió en la primera versión de todas.** La pantalla quedó como una cuadrícula de tarjetas —"Un módulo a la vez", once recuadros— y una cuadrícula no dice en qué orden pasan las cosas. El lector ve once cosas sueltas y no sabe cuál va primero, que es justo lo que el tour existe para contar.

La pantalla tiene que verse como **el proceso de la empresa, numerado y en orden**:

```
ETAPA 1 · Se consigue al cliente
   Pantallas: Contenido → CRM → Agenda del showroom
   ▸ Recorrer esta etapa (3 pantallas · 4 pasos · 2 min)

ETAPA 2 · El cliente arma su cocina y se cotiza
   Pantallas: Cotizador → Cotizaciones → Administración (anticipo)
   ▸ Recorrer esta etapa …

ETAPA 3 · Entra a producción
   …
```

Reglas que hacen que se lea como una historia:

- **Las etapas van numeradas y en el orden en que ocurren**, con un título que dice qué pasa en el negocio ("Se consigue al cliente"), no cómo se llama el módulo.
- **Cada etapa nombra las pantallas que la componen**, en su orden. Así se ve que la etapa 2 usa tres pantallas y que una de ellas es Administración, aunque en el menú esté lejos.
- **Los pasos se numeran de corrido a lo largo de todo el recorrido**: "paso 7 de 20", no "paso 2" reiniciando en cada módulo. El número es lo que le dice a quien mira cuánto falta.
- **Cada tour de etapa dice dónde está parado**: "Etapa 2 de 6 · después de esto sigue Producción". Un tour de módulo nunca es un callejón sin salida: termina insinuando la etapa siguiente y ofreciendo entrar a ella.
- **Arriba, el recorrido completo**, que es la suma de las etapas de corrido — para presentar. Las etapas son el mismo camino en tramos, para aprender.

El recorrido completo y las etapas **son la misma lista de pasos**, cortada. No se escriben dos veces: los tours de etapa se derivan del recorrido del negocio marcando dónde empieza y termina cada tramo. Si se escriben aparte, se desincronizan a la primera corrección.

## El tour jamás se cierra por puesto

**Cualquier usuario de cualquier plataforma tiene acceso al tour completo. Sin excepción.** Un botón "Ver" deshabilitado con la leyenda *"Este módulo no es de tu puesto"* es un defecto, no una medida de seguridad: el tour existe para **enseñar cómo trabaja la empresa entera**, y alguien de compras necesita entender de dónde le llega el pedido tanto como el director.

El problema real que lo provocó es legítimo: si la ruta está protegida por rol, el tour rebota a media demostración. La solución **no** es bloquear el tour, es que **el tour cambie el puesto por su cuenta**:

1. Antes de entrar a una pantalla que el puesto activo no abre, el tour cambia el rol al que sí la abre.
2. Lo dice en la narración, en una línea, porque es parte de la historia: *"esta pantalla la abre compras — te pongo en ese puesto para que la veas"*.
3. **Al terminar el tour se restaura el puesto original**, siempre, incluso si el usuario lo cierra a media marcha (en el `onDestroyed`).

Si la plataforma no tiene forma de cambiar de rol en el cliente, entonces el tour se recorre en modo lectura y se dice; lo que nunca se hace es esconder la etapa.

- Un **interruptor Demo / Aprender** que cambia la narración.
- Marca de cuáles ya vio el usuario (en `localStorage`, sin tabla nueva).

## El detalle que rompe todo si se ignora

Un tour resalta elementos del DOM por selector. **Un selector que apunta a una clase de Tailwind o a una posición se rompe la próxima vez que alguien toque el diseño**, y se rompe en silencio: el paso simplemente no resalta nada, y se descubre presentando.

Por eso: **cada elemento que el tour toca lleva su propio `data-tour="nombre"`** en el componente, y el paso apunta a `[data-tour="nombre"]`. Es un atributo que nadie borra por accidente al reacomodar clases, y deja escrito en el código que ese elemento es parte de un recorrido.

Los pasos que cambian de ruta necesitan esperar a que la pantalla cargue. El patrón está resuelto en `references/implementacion.md`; no lo reinventes.

## Cómo se prueba

**Un tour no está listo hasta que se corrió completo en la plataforma viva.** Es la diferencia entre esto y un archivo de texto bonito.

Hay un script listo en `references/verificar-tour.mjs`. Con Playwright recorre cada paso, navega a su ruta y verifica que el elemento **existe y es visible** — existir no basta: un elemento con `display:none` o dentro de una pestaña cerrada existe y no se puede resaltar. Sale con código distinto de cero si algo falla, así que sirve tal cual en CI.

```bash
# desde el proyecto de la plataforma (de ahí toma playwright)
npm i --no-save playwright && npx playwright install chromium

node ~/.claude/skills/productour/references/verificar-tour.mjs \
  https://cucina-capitale.pages.dev ./src/tours --pass cucina2026

# plataformas con login de usuario:
node ~/.claude/skills/productour/references/verificar-tour.mjs \
  https://lpet.lovable.app ./src/tours --correo demo@lpet.mx --clave ***** [--ruta-login /auth]

# ver qué entendió el parser sin abrir navegador (rutas, selectores, cuántos pasos):
node ~/.claude/skills/productour/references/verificar-tour.mjs <url> ./src/tours --listar
```

Tres cosas que hay que saber para creerle al reporte:

- **`--listar` primero.** Si ahí faltan pasos, el reporte de la corrida los daría por buenos sin haberlos mirado nunca. El total tiene que cuadrar con los pasos del archivo.
- **Resuelve constantes de ruta.** Un paso con `ruta: FOLIO_DEMO` se verifica contra la ruta real, no contra la pantalla del paso anterior.
- **Lo que no puede verificar lo dice.** Si una ruta no se resuelve, el paso sale como `RUTA NO RESUELTA` y se cuenta aparte de las fallas — nunca se hereda la pantalla anterior, porque eso inventa rotos que en vivo funcionan.

Y después, **recórrelo tú como si estuvieras presentando**: lee la narración de corrido y pregúntate si cuenta una historia o si es una lista de pantallas. Ese juicio no lo hace un script.

## Cuando la plataforma no está lista

No todas dan para un tour completo, y forzarlo produce algo peor que nada:

- **Módulo vacío**: si una pantalla no tiene datos sembrados, no la incluyas. Un paso que resalta una tabla en blanco resta.
- **Demo sin backend vivo**: verifica que la plataforma de verdad responde antes de empezar. Un tour sobre pantallas en ceros es una demostración de que el sistema no funciona.
- **Sin juntas y sin datos**: haz el tour técnico —qué hace cada módulo— y dile a Héctor que con una junta de descubrimiento se vuelve el bueno.

## Al terminar

Dile a Héctor, corto:
- Qué plataformas quedaron con tour y cuántos pasos tiene cada una.
- El recorrido del negocio en una línea, para que confirme que así opera el cliente. **Ese es el punto que más vale que revise**: si el orden está mal, el tour cuenta una historia falsa.
- Qué módulos se dejaron fuera y por qué.
- Que puede cambiar cualquier texto pidiéndolo, porque viven en archivos de datos.
