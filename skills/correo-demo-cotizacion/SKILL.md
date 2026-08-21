---
name: correo-demo-cotizacion
description: "Arma en Outlook el borrador del correo con el que Héctor le entrega a un cliente su demo terminada y su cotización. Recibe el nombre del cliente o la URL del portal/demo, averigua de quién se trata, junta sus datos de las bases (liga del demo, clave, folio de cotización) y la inteligencia de sus juntas, y deja el borrador listo con un texto casual y personalizado con los dolores que ESE cliente contó. Úsalo siempre que Héctor diga cualquier variante de: mándale la cotización a X, arma el correo de la demo, ya quedó la cotización de X hay que mandarla, el correo para presentarle el demo, redacta el correo de entrega, prepárame el mail para agendar con X, ya terminamos el demo de X, o cuando pase una URL de un portal (mrcocoa.pages.dev, cucina-capitale.pages.dev, etc.) junto con la intención de contactar al cliente. También cuando acabe de generarse una cotización y pregunte cómo se la manda. Nunca envía nada: solo deja el borrador."
---

# Correo de entrega: demo lista + cotización

Este skill escribe **un borrador en Outlook**, nunca lo manda. Héctor lo abre, le adjunta el PDF, y decide si lo envía y cuándo. Esa frontera es la misma regla de oro de toda la Oficina de Agentes: ningún agente le manda nada a un cliente.

El correo tiene un solo trabajo: que el cliente entienda que **no está comprando un producto de cajita, sino un compromiso de Héctor**. Todo lo demás —los datos del demo, el folio— es logística alrededor de esa idea.

## Lo que recibes como entrada

Héctor va a decir algo corto: *"mándale la cotización a Checo"*, *"arma el correo de Cucina"*, o simplemente pegar `https://mrcocoa.pages.dev`. Tu primer trabajo es resolver de quién habla.

- **Si te da un nombre o empresa:** búscalo en `clientes` (proyecto Supabase `clnirhdxsohtrcjsuntw`) con `company ilike` y `name ilike`. Los nombres se dicen de muchas formas — "Checo" es `Mister Cocoa Food Service`, "Ale" es `Farmasi by Ale`.
- **Si te da una URL:** busca por `demo_url ilike` en `clientes`. Si no aparece ahí, pruébala contra `quotes.pdf_path` y contra las notas.
- **Si hay más de un candidato:** pregúntale cuál, con las opciones en pantalla. Mandarle una cotización al cliente equivocado no tiene deshacer.

## Los datos que tienes que juntar

Corre esto primero — una sola consulta te da casi todo:

```sql
select c.id, c.name, c.company, c.email, c.phone, c.stage::text,
       c.demo_url, c.demo_passcode, c.notes, c.next_step,
       q.quote_number, q.total, q.setup_fee, q.monthly_fee, q.pdf_name, q.pdf_path, q.status
from clientes c
left join quotes q on q.cliente_id = c.id
where c.deleted_at is null and c.id = '<id>'
order by q.created_at desc limit 1;
```

Y la inteligencia de sus juntas, que es de donde sale la personalización:

```sql
select titulo, fecha_reunion::date, resumen, notas_importantes, contactos
from biblio_reuniones_notas
where cliente_id = '<id>'
order by fecha_reunion desc limit 3;
```

`notas_importantes` es el oro: son frases con dato duro sacadas del transcript real de la junta. De ahí salen los dolores que vas a citar.

## Encontrar el correo del cliente

**Este es el paso que más falla, y el que no puedes resolver adivinando.** Al día de hoy (20-ago-2026) **ninguno de los clientes en `clientes` tiene correo capturado** — la columna existe y está vacía en los siete. Así que casi siempre vas a tener que buscarlo. En orden:

1. `clientes.email` — rápido de descartar.
2. `biblio_reuniones_notas.contactos` — jsonb con `[{nombre, rol, organizacion}]` de gente real del transcript. Trae nombres, rara vez correos, pero te dice **a quién** buscar.
3. **El historial de correo, que es la fuente que sí sirve.** Con `outlook_email_search` busca, y los resultados no traen destinatarios: toma el `uri` del más relevante y ábrelo con `read_resource` para sacar el correo de la contraparte.

   **Búscalo con varios nombres, no solo con el que trae `clientes.company`.** Casi siempre la junta está agendada a nombre del grupo o de la persona, no del producto. Prueba en este orden: el grupo corporativo, el apellido del contacto, su nombre de pila **real** —los apodos no aparecen en un correo: Checo es Sergio, Pepe es José, Lalo es Eduardo— y por último la empresa.

   El caso que enseñó esto: buscar *"Cocoa"* y *"Montesinos Checo"* devolvió **cero**, y el correo llevaba semanas ahí. Estaba en dos invitaciones tituladas *"Grupo Montesinos - Requerimientos"*, dirigidas a `sergio@grupomontesinos.com`. Una búsqueda vacía casi nunca significa que no existe; significa que buscaste con el nombre equivocado.

   Un atajo que sirve cuando no atinas: lista los **Sent Items** recientes (`folderName: 'Sent Items'`, `order: 'newest'`) y revisa los destinatarios. En una operación de este tamaño, el cliente casi siempre está en los últimos veinte correos.
4. `leads` con `empresa ilike` — pero **desconfía**: ahí hay correos genéricos y sembrados (`operador@`, `gerente@`) que no son de nadie.

**Y cuidado con una trampa peor que no encontrarlo:** las demos llevan usuarios sembrados con correos que *parecen* reales (`direccion@mrcocoafoodservices.com`). Son inventados al armar el demo. Si sale uno de esos, no es el correo del cliente.

**Si después de todo eso no lo encuentras, deja el campo `to` VACÍO y dilo en tu resumen final.** Un borrador sin destinatario es un inconveniente de diez segundos; una cotización con precios enviada a la dirección equivocada es un problema real. Nunca construyas un correo "probable" del tipo `nombre@empresa.com`.

## El cuerpo del correo

> **Si dudas del ritmo o de qué tan largo va cada bloque, abre `references/ejemplo-mrcocoa.md`.** Trae el correo completo que quedó para Checo Montesinos después de cuatro rondas de correcciones de Héctor, la tabla de cómo cada frase del transcript se volvió una viñeta, y los cuatro errores que costó corregir. No es plantilla para rellenar —el contenido cambia entero con cada cliente— pero sí es la referencia de la forma.

Va en **español mexicano, tuteando, casual pero con oficio**. Héctor escribe como habla: directo, sin corporativismos, sin "quedo a sus órdenes".

La estructura tiene cinco partes y este orden importa:

**1. El saludo y la noticia.** Corto. Que ya quedó su demo y que va también la cotización.

**2. Lo que va a ganar, en viñetas. Máximo cinco.** Aquí es donde este correo se separa de una plantilla, y donde más fácil se echa a perder.

Sacas de `notas_importantes` los problemas que ESE cliente contó —de ahí viene la personalización— pero **en el correo no escribes el problema: escribes lo que va a tener.** El dolor es tu materia prima, no tu texto.

Ésta es la diferencia, y es toda la diferencia:

| Lo que dijo en la junta | ❌ Nombra el dolor | ❌ Explica de más | ✅ Así SÍ |
|---|---|---|---|
| Facturación recaptura cada pedido código por código | Capturar el mismo pedido dos veces | Agilidad para que tus vendedores levanten pedidos rápido y sin errores, desde donde estén y con el catálogo completo en la mano | Tus vendedores levantando pedidos en minutos, desde donde estén |
| El Excel de Contpaq no tomaba el 5 % de línea más el 5 % adicional | Precios y descuentos que no cuadran | Los precios y descuentos de cada cliente aplicados al momento, exactamente como los negociaste | El precio de cada cliente, aplicado solo y sin errores |
| Pide BI sin esperar el estado de resultados del contador | Saber la rentabilidad sin esperar al contador | La rentabilidad de tu negocio al día, cliente por cliente y producto por producto, sin esperar a que cierre el mes | Tu rentabilidad al día, sin esperar el cierre de mes |
| Su página tiene 2 años sin actualizar | Una página que no vende | Que tu página se vuelva una fuente constante de ingresos, vendiendo caja cerrada las 24 horas | Tu página vendiendo caja cerrada las 24 horas |

**Por qué la primera columna falla:** el cliente ya vive su problema todos los días; recordárselo no le enseña nada y pone el correo en tono de auditoría. Lo que no tiene claro es cómo se ve su día cuando eso ya no pasa — y eso es lo que va a comprar.

**Por qué la segunda falla:** son correctas, pero se leen como folleto. Una viñeta con tres subordinadas ya no se escanea, se estudia — y nadie estudia un correo. Cuando explicas de más, el lector deja de imaginarse la escena y empieza a leer texto.

**Cómo se escriben:**
- **Cortas, de seis a diez palabras.** Si necesita coma en medio, que sea una sola.
- **Empieza por lo que él tiene**, no por un sustantivo abstracto. "Tus vendedores levantando pedidos" tiene una imagen; "agilidad en la captura" no tiene ninguna.
- **De frente a él, tuteando.** "Tus vendedores", "tu página", "tu rentabilidad". Nunca "el vendedor" ni "la empresa".
- **Corta el matiz, quédate con el golpe.** "Sin esperar el cierre de mes" pega; "sin esperar a que cierre el mes y sin pedirle nada al contador" ya no.
- **Concretas, no publicitarias.** "El precio de cada cliente, aplicado solo" vende; "solución integral de gestión comercial" no vende nada.
- **Que cada una se pueda señalar en la demo.** Si prometes algo que no se ve en pantalla, el correo trabaja en tu contra en cuanto él entre.

Prueba rápida antes de mandar: léelas de corrido. Si suenan a lista, van bien. Si suenan a párrafo partido en pedazos, están largas.

Cierra el bloque con una línea diciendo que eso es justo lo que va a ver. **Si el cliente no tiene juntas registradas, omite el bloque completo.** Inventarle beneficios que no pidió es peor que no personalizar: se nota, y desmiente justo la idea de que lo escuchaste.

**3. La promesa. Es el corazón del correo.**

Esto es lo que Héctor de verdad vende, y es lo único del correo que **no se adapta a cada cliente**: va idéntico para todos, en un solo párrafo corrido, sin encabezado ni negritas.

**Este párrafo es de Héctor. Va literal:**

```html
<p>Es importante dejar claro que lo que te estamos ofreciendo no es un software de caja: estás contratándome a mí, a Héctor personalmente, para trabajar contigo en la creación de un sistema digital a la medida de tu compañía. La cuota de inicio y la mensualidad incluyen horas mensuales mías para juntarme con tu equipo y desarrollar la plataforma, evolucionándola hasta convertirse en la herramienta que empodere a tu gente con la última tecnología. La mensualidad incluye además la garantía de soporte especializado de mi equipo para las personas que la usan todos los días.</p>
```

**Cópialo tal cual. No lo mejores.** Sobre lo único que puedes pasar la mano es la ortografía y la puntuación; las palabras son suyas y así las quiere.

Vale la pena saber por qué está subrayado esto: este párrafo se reescribió **cuatro veces** antes de quedar. Cada versión "mejorada" —más pulida, más profesional, mejor rematada— se alejaba de lo que él quería decir, hasta que lo dictó palabra por palabra. Es el bloque donde Héctor vende lo que solo él puede vender, y ahí su redacción vale más que cualquier arreglo. Lo mismo aplica a cualquier otro texto que él dicte: **si te da las palabras, ésas son las palabras.**

Si algún día pide cambiarlo, cámbialo aquí en el skill para que valga para todos, no solo en el correo de ese cliente.

**4. Los datos del demo y el cierre.** Liga, usuario si aplica, clave. Y que la cotización va adjunta. Cierra agradeciendo y diciendo que esperan pronto empezar a trabajar con ellos.

**Los datos van pelones: la liga y la clave, nada más.** Nada de "al entrar te pide la clave y luego eliges tu puesto", ni "te sugiero empezar por Dirección", ni un recorrido de por dónde ver qué. Ese acompañamiento lo da Héctor en vivo, y es parte de lo que vende: si el correo ya explicó cómo moverse, la sesión pierde su razón de ser y el cliente entra solo, se pierde, y se lleva una peor impresión de la que le habrías dado tú enseñándosela.

**Tampoco metas condiciones comerciales en el correo** — nada de "pruébalo sin compromiso", "esto es un piloto", "la cotización es para cuando decidas". Aunque se haya dicho en la junta, negociar por escrito en el mismo correo que entrega la cotización le quita fuerza a las dos cosas, y amarra a Héctor a una postura que quizá ya no quiere sostener. Los términos están en el PDF; lo demás se habla hablando.

**Nunca inventes credenciales.** Si `demo_url` o `demo_passcode` vienen vacíos, no te los imagines: deja el bloque señalado como pendiente y avísale a Héctor en el resumen. Un cliente que intenta entrar con una clave inventada pierde la confianza en el primer minuto.

**5. La firma de Grupo AED. Va siempre, en todos los correos.**

Outlook **no** le pega su firma a un borrador creado por esta vía —eso solo pasa cuando él escribe el correo a mano—, así que si no la pones, el correo sale sin ella. Ésta es la real, tomada de su correspondencia:

```html
<hr>
<p><strong>Héctor Morales Kott</strong><br>
Director Comercial<br>
<strong>Agilidad en Digital</strong></p>
<p>Automatizamos con agentes IA, desarrollamos software a la medida, apps móviles, dashboards y flujos inteligentes.</p>
<p>+52 55 8065 7691<br>
<a href="mailto:hector@agilidadendigital.com">hector@agilidadendigital.com</a><br>
<a href="https://www.agilidadendigital.com/">agilidadendigital.com</a></p>
<p><a href="https://cal.com/grupoaed/30min">Agenda una videollamada</a> &nbsp;·&nbsp; <a href="https://wa.me/525580657691">Mándame un WhatsApp</a></p>
```

Como va la firma, **el correo ya no se despide con "Héctor Morales / Agilidad en Digital" escrito a mano**: cierras con el agradecimiento y de ahí pasa a la firma. Repetir el nombre dos veces se ve descuidado.

Su firma original trae color naranja y los dos enlaces como botones, pero **la lista blanca de Outlook rechaza `style=` y `span`**, así que por esta vía sale en texto plano con las ligas vivas. Dilo en tu resumen: si la quiere con su diseño, borra ese bloque y usa *Insertar → Firma* en Outlook, que le pone la buena.

## Cómo se crea el borrador

Usa `outlook_create_draft` — la cuenta firmada ya es `hector@agilidadendigital.com`, no hay que configurar nada.

Manda `bodyType: 'html'` porque el correo tiene párrafos y ligas, y en texto plano se ve como un bloque. **La lista blanca de HTML es estricta y rechaza el borrador completo si te sales**: puedes usar `p`, `br`, `hr`, `div`, `a`, `b`, `i`, `strong`, `em`, `strike`, `ul`/`ol`/`li`, `h1`-`h6`, `table`, `code`, `pre`. **No pasa** `span`, `font`, `blockquote`, `img`, estilos en línea ni comentarios. Nada de `style="..."`: para resaltar usa `<strong>`.

El asunto es de una línea, sin adornos ni corchetes. Algo como *"Tu plataforma ya está lista, Checo"* o *"Mister Cocoa: demo terminada y cotización"*.

### El `webLink` que devuelve la creación NO sirve. Búscalo otra vez.

Ésta es la trampa más molesta de todo el flujo, y hace quedar mal el trabajo entero: `outlook_create_draft` regresa un `id` y un `webLink`, **pero Outlook le cambia el identificador al guardar el borrador en el buzón**. El enlace que te devolvió apunta a algo que ya no existe con ese id, así que Héctor le da clic y no ve nada — aunque el borrador esté perfectamente creado.

Por eso, **después de crear o actualizar, siempre búscalo de nuevo** y usa el `webLink` de ese resultado:

```
outlook_email_search  folderName: 'Drafts'  order: 'newest'  limit: 5
```

Ese paso hace dos cosas a la vez: te da el enlace bueno y te confirma que el borrador de verdad quedó. Y si vas a rehacer un correo, **borra el anterior con `outlook_delete_draft` antes de crear el nuevo** — dos borradores casi idénticos en la bandeja son peores que ninguno, porque manda el equivocado.

Detalle relacionado: si actualizas un borrador con `outlook_update_draft` usando el id viejo y Outlook ya lo movió, la herramienta responde que está en Elementos eliminados. No es un error tuyo: es el mismo cambio de identificador. Búscalo en Borradores y trabaja con el id de ahí.

## Lo que NO puede hacer este skill, y cómo se resuelve

**Outlook no permite adjuntar archivos por esta vía** — el parámetro no existe en la herramienta. No hay forma de meterle el PDF al borrador desde aquí, y fingir que sí lo hiciste sería mentirle a Héctor sobre algo que va a descubrir al abrirlo.

Como él de todos modos va a abrir el borrador para mandarlo, la solución es simplemente decírselo: entrégale **la ruta exacta del PDF** (viene en `quotes.pdf_path`) para que lo arrastre. Un renglón en tu resumen final, no una disculpa.

## Cómo cierras

Después de crear el borrador, dile a Héctor en pocas líneas:

- Que el borrador ya está, con **el enlace sacado de la búsqueda en Borradores**, no el que devolvió la creación (ver arriba).
- **La ruta del PDF que tiene que adjuntar.**
- A quién va dirigido — o que quedó sin destinatario y por qué.
- Cualquier hueco: sin clave del demo, sin cotización registrada, sin juntas para personalizar.

Sé breve. Él va a abrir el borrador de todas formas; tu resumen solo tiene que decirle qué le falta antes de darle enviar.

**Si te dice que no lo ve**, no le repitas el mismo enlace ni des por hecho que se equivocó de carpeta. Búscalo en Borradores para comprobar que existe, dale el enlace bueno, y menciónale que Outlook de escritorio a veces tarda en bajar un borrador creado desde fuera —en outlook.office.com aparece de inmediato— y que puede forzarlo con *Enviar y recibir → Actualizar carpeta*.

## Cuando falta lo esencial

No todos los caminos terminan en un borrador, y forzarlo hace daño:

- **Sin cotización en `quotes` para ese cliente:** avísale antes de escribir nada. Probablemente hay que generarla primero con el skill `cotizacion-saas`, o quedó el PDF sin registrar. Ofrece hacerlo.
- **Sin demo (`demo_url` vacío):** pregúntale si de verdad hay demo. El correo entero se apoya en que el cliente pueda entrar a verlo.
- **Cliente que no existe en `clientes`:** dilo y ofrece darlo de alta, pero **no lo crees por tu cuenta** — es la misma regla que sigue el Bibliotecario, y existe porque una mención no es un cliente.

## Después de mandarlo

Cuando Héctor confirme que ya lo envió, actualiza el estado de la cotización, para que los agentes dejen de reportarla como pendiente:

```sql
update quotes set status = 'sent' where quote_number = '<folio>';
```

Solo hazlo cuando él lo confirme. `sent` significa "se la mandé al cliente", no "el borrador está listo".
