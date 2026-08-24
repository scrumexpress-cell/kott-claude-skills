---
name: cotizacion-saas
description: "Genera cotizaciones profesionales de software, plataformas SaaS o proyectos de desarrollo a la medida. Usa este skill siempre que el usuario mencione: cotización de software, propuesta técnica y económica, pricing de plataforma, modelo de suscripción para software, cotizar un ERP, cotizar un sistema, propuesta para cliente de desarrollo, estructura de cobro mensual/anual con código fuente, modelo win-win de software, penalización de salida anticipada, o cualquier variante de generar un documento de cotización formal para un proyecto de tecnología. También aplica cuando el usuario quiera revisar, mejorar o reestructurar una cotización existente de software/SaaS, o cuando pida análisis de huecos legales y oportunidades de mejora en una propuesta comercial de tecnología."
---

# Cotización Profesional de Software / SaaS

## PASO 0 — Verificar versión más reciente (OBLIGATORIO, antes de todo)

Antes de generar o revisar cualquier cotización, verifica que estás usando la ÚLTIMA versión de este skill publicada en GitHub y actualiza la copia local si cambió. El repo es la fuente de verdad:

**Repo fuente:** `https://github.com/scrumexpress-cell/kott-claude-skills` · archivo `skills/cotizacion-saas/SKILL.md`

1. Descarga el SKILL.md remoto (usa el que funcione):
   - `gh api repos/scrumexpress-cell/kott-claude-skills/contents/skills/cotizacion-saas/SKILL.md --jq .content | base64 --decode > /tmp/skill_remoto.md`
   - o crudo: `curl -sL https://raw.githubusercontent.com/scrumexpress-cell/kott-claude-skills/main/skills/cotizacion-saas/SKILL.md -o /tmp/skill_remoto.md`
2. Compáralo con este archivo local (`~/.claude/skills/cotizacion-saas/SKILL.md`). **Normaliza los saltos de línea antes de comparar** (`\r\n` → `\n`): si no, un archivo idéntico se reporta como completamente distinto y la comparación no sirve de nada.
3. **Averigua en qué dirección va la diferencia antes de tocar nada.** Mira qué contenido tiene uno que al otro le falta, no solo si difieren:
   - **El remoto trae secciones que el local no tiene** → el local está atrasado: sobrescríbelo, avisa en una línea ("actualicé el skill a la última versión del repo") y sigue con la versión actualizada.
   - **El local trae secciones que el remoto no tiene** → el REPO está atrasado. **NO sobrescribas: perderías reglas.** Avísale al usuario qué secciones se salvaron y ofrécele subir el local al repo.
   - **Cada uno tiene cosas del otro** → no elijas tú. Enséñale al usuario qué hay de cada lado y pregúntale con cuál seguir.
4. Si el repo no es accesible (sin red / sin `gh` / sin `curl`), continúa con la versión local y avísale al usuario que no pudo verificarse.

**Por qué el paso 3 es así (20-ago-2026):** el paso original decía "si difieren, sobrescribe el local con el remoto". Ese día el local tenía **34 líneas que el repo no tenía** — toda la sección *"PASO FINAL: registrar la cotización en Supabase"*, agregada el 9-ago justo porque `quotes` estaba vacía y el agente Steve repetía "falta cotizar" a clientes ya cotizados. Obedecer el paso al pie de la letra habría borrado esa regla y devuelto el problema. El repo es la fuente de verdad **cuando está al día**, no por decreto.

## Propósito

Este skill genera cotizaciones formales, estructuradas y profesionales para proyectos de software, plataformas SaaS o ERPs a la medida. Está diseñado para producir documentos que funcionen tanto como herramienta de venta como base para un contrato de servicios.

## Cuándo usar este skill

- El usuario quiere cotizar un proyecto de software para un cliente
- Necesita reestructurar una cotización existente
- Quiere definir un modelo comercial (suscripción, licencia, híbrido)
- Necesita analizar huecos legales o mejorar una propuesta
- Quiere crear una propuesta técnica y económica formal

## Estructura del documento de cotización

Toda cotización debe incluir estas secciones en este orden. Adaptar el contenido al proyecto específico pero mantener la estructura:

### 1. Portada
- Nombre del proyecto/plataforma como título principal
- Subtítulo: "Propuesta Técnica y Económica"
- Tabla visual de dos columnas (label en negrita / valor) con estos campos:
  - **Preparado para:** Cliente + Razón social + Atención a
  - **Preparado por:** Proveedor + Razón social + Responsable legal
  - **Fecha** (mes + año)
  - **Versión** (numeración decimal: 1.0, 2.0, 4.0)
  - **Vigencia** (típicamente 30 días naturales desde emisión)
- Logos del cliente (y proveedor) centrados arriba de la tabla
- Nota de confidencialidad al pie: "Documento confidencial. Prohibida su reproducción sin autorización."

**NO pongas en la portada la liga del demo ni la contraseña de acceso.** Un PDF circula, se reenvía y se guarda; una clave impresa ahí sobrevive al día en que deja de servir, y entonces el documento miente en la primera página. Pasó: la portada anunciaba un passcode compartido que se eliminó al poner login real, y el cliente que lo hubiera intentado no habría entrado.
El acceso se entrega **en el correo**, que va a una persona. Si el documento necesita decir algo, que diga que el acceso se entrega por cuenta personal — nunca la credencial.

### 2. Contenido / Índice
- Lista numerada de todas las secciones
- **El primer elemento del índice siempre es el One-Pager de Hallazgos** (sección 3 del documento, posterior a portada e índice, pero primer contenido sustantivo)

### 3. One-Pager de Hallazgos de la Exploración
- **Debe ser el primer contenido sustantivo del documento** (justo después de portada e índice, antes del Resumen Ejecutivo)
- Ocupa **una sola página** — es un resumen visual de alto impacto que conecta la conversación con el cliente con la propuesta que sigue
- Encabezado breve (1-2 líneas): "Esto es lo que escuchamos en nuestra exploración con [Cliente] y cómo lo resolvemos."
- **Infografía horizontal de 3 columnas** con estos bloques (en este orden):

  **Columna 1 — Dolores Detectados**
  - Icono de alerta/dolor (⚠️ o equivalente visual)
  - Header: "Dolores Detectados"
  - 3-5 bullets cortos con los dolores específicos mencionados por el cliente (verbatim del lenguaje del cliente cuando sea posible)
  - Cada bullet en una línea, máximo 12 palabras
  - Color de acento: rojo/naranja oscuro para denotar problema

  **Columna 2 — Hipótesis de Solución**
  - Icono de lámpara/idea (💡 o equivalente)
  - Header: "Hipótesis de Solución"
  - 3-5 bullets que respondan 1:1 a los dolores de la columna 1 (mismo orden)
  - Lenguaje de acción: "Automatización de X", "Portal único para Y", "Agente IA que Z"
  - Color de acento: naranja corporativo #E85D1F

  **Columna 3 — KPI que Impacta en tu Empresa**
  - Icono de gráfica/crecimiento (📈 o equivalente)
  - Header: "KPI que Impacta en tu Empresa"
  - 3-5 bullets con métricas concretas y cuantificables que mejorarán
  - Formato: "Reducción de X% en [métrica]", "Ahorro de Y horas/mes en [proceso]", "Tiempo de respuesta de Z días → W horas"
  - Si no se tienen cifras del cliente, usar rangos o benchmarks de industria con nota al pie ("Estimado base en proyectos similares")
  - Color de acento: verde para denotar resultado positivo

- **Reglas de la infografía:**
  - Las 3 columnas deben tener el **mismo número de bullets** y estar alineadas horizontalmente (dolor 1 → solución 1 → KPI 1)
  - Usar tabla de 3 columnas en docx con bordes sutiles o sin bordes, con headers de color diferente por columna
  - No saturar: máximo 5 puntos por columna; si hay más dolores, elegir los 5 de mayor peso estratégico
  - Cerrar la página con una línea de transición: "El resto de este documento detalla cómo lo construimos, qué incluye, cuánto cuesta y bajo qué condiciones."

- **Origen del contenido:**
  - Dolores: extraer de transcripciones de reuniones, notas de descubrimiento, correos previos
  - Hipótesis: derivar del alcance funcional de la sección 5; debe haber coherencia 1:1
  - KPIs: validar con el cliente cuando sea posible; si no, usar estimaciones conservadoras y marcarlas como tales

- **🚫 REGLA CRÍTICA — Nunca exponer bugs/defectos del sistema en el One-Pager:**
  Los dolores deben describir EXCLUSIVAMENTE la realidad operativa del cliente ANTES de tu sistema (procesos manuales, Excel, correos, llamadas, sin visibilidad). NUNCA listes como "dolor" un bug, defecto o regresión que TU sistema haya tenido y que después arreglaste. Frases como *"Bug: el sistema sobrescribía X"*, *"Antes el portal no validaba Y"*, *"Se rompía cuando Z"* leen como "el sistema viene con defectos" en la cabeza de un cliente que está decidiendo si firmar.
  - Si hay un fix relevante, va al **changelog interno** o a una sección de "Mejoras del último ciclo" como historial técnico, NUNCA en el documento de venta.
  - Si el bug refleja un proceso real del cliente que era confuso (ej. "no había claridad entre quién solicitó vs quién está asignado"), **reformúlalo desde la óptica operativa del cliente**: "Trazabilidad confusa entre ejecutivo del cliente y responsable de revisión" — eso sí es un dolor legítimo del cliente, no un bug del sistema.
  - Regla de oro: si lees el One-Pager poniéndote en los zapatos del que va a firmar, ninguna frase debería hacerlo dudar de la calidad de lo que ya está construido.

### 4. Resumen Ejecutivo
- Descripción de la solución en 1-2 párrafos
- Cifras clave en formato visual (súper-módulos, sub-módulos, usuarios, etc.)

#### Las cifras cuentan lo que ENTREGAMOS, nunca el volumen de los datos del cliente

**Éste es un error caro y se cuela con facilidad, porque las cifras grandes se ven bien.** Las tarjetas del resumen ejecutivo son lo primero que lee el cliente y son, implícitamente, la respuesta a *"¿qué estoy comprando?"*. Si ahí van `219 proyectos`, `8,748 movimientos`, `2,642 insumos`, `338 unidades` y `73 prototipos`, la respuesta que está dando el documento es **el volumen de la información que ellos mismos nos entregaron**. No compraron eso: eso ya era suyo. Es como si un arquitecto cobrara presumiendo cuántos muebles ya tenías.

Peor todavía: si el número viene de datos de prueba, el cliente que reconoce su propio archivo se pregunta por qué se lo están vendiendo — y con razón.

**Lo que sí va en las tarjetas**, porque es lo que se construye y lo que se cobra:

- **módulos** y **pantallas** que quedan operando
- **funcionalidades** o procesos cubiertos
- **automatizaciones**: cuántas cosas pasan solas que antes hacía una persona
- **puestos** con su propia vista y sus permisos
- **reportes** e **indicadores** que se entregan
- **integraciones** conectadas
- **pasos del recorrido guiado**, si se construyó

**Ni una cifra de infraestructura.** `142 tablas de datos`, `38 endpoints`, `12 edge functions` no son valor para quien firma: son cómo está hecho por dentro, y ya hay una regla en este skill que dice que se describe el resultado y jamás el motor. Al cliente no le vendes tablas.

**Qué hacer entonces con los datos reales, que sí son un diferenciador.** El hecho de que la plataforma esté cargada con su información —y no con datos inventados— es de lo más fuerte que tiene la propuesta, y **no se pierde**: se dice en prosa, en la sección que demuestra que no es una maqueta (*"el módulo administrativo está cargado con sus dos archivos reales"*). Ahí el volumen es **evidencia de que ya está funcionando**, y ahí sí se puede citar. Lo que no se hace es convertirlo en la cuenta de lo que se entrega.

Regla para decidir en un segundo: **si la cifra existiría igual sin nosotros, no va en las tarjetas.**

#### La regla no es solo de las tarjetas: aplica a CADA renglón del documento

Se arreglaron las tarjetas y el error reapareció **dentro de los bullets del alcance** — *"338 unidades en cuatro torres, con 73 prototipos y sus 4,056 ambientes"*, *"CRM que sustituye el Excel: 53 cuentas"*, y hasta en un pie de foto. Son el tamaño de la semilla, presentados como si fueran el producto.

Se reescriben describiendo **lo que la plataforma hace, y que sirve para cualquier tamaño**:

| ❌ Cuenta la semilla | ✅ Describe la capacidad |
|---|---|
| 338 unidades en cuatro torres, con 73 prototipos y sus 4,056 ambientes | Torres, departamentos y ambientes en un mapa coloreado por estatus: de un vistazo se sabe en qué va cada espacio |
| CRM que sustituye el Excel: 53 cuentas, embudo arrastrable | CRM que sustituye el Excel: cada cuenta con su etapa y su monto, embudo arrastrable |
| Flujo de efectivo con el histórico desde 2018 | Flujo de efectivo por mes, con todo el histórico que carguen |

Fíjate en lo que gana la columna derecha: **dice que sirve para cualquier desarrollo, no solo para el que cargamos.** El número no hacía eso.

#### 🔍 Y busca los números escritos CON LETRA

Un barrido de dígitos no los encuentra, y por ahí se coló *"Trescientos treinta y ocho departamentos"* después de que las cifras "ya estaban limpias". Busca en español: *trescientos, doscientos, ciento, cincuenta, cuarenta, treinta, veinte, mil, dos mil, ocho mil*…

**Pero no todo número con letra es malo.** *"Veinte módulos operando"* y *"nueve puestos con su propia vista"* cuentan lo que entregamos y se quedan. La prueba es la misma de siempre: ¿existiría sin nosotros?

#### La excepción, que no se toca

En la sección que demuestra que no es una maqueta —*"No es una demostración con datos de mentira"*— el volumen real **sí es evidencia y se queda**: *"cargado con sus dos archivos reales: 219 proyectos con su semáforo, 8,748 movimientos…"*. Ahí ese número trabaja a favor. Lo que nunca hace es fingir ser la cuenta de lo que están comprando.
- Resumen del modelo comercial en lenguaje ejecutivo (no técnico)
- Diferenciador principal (ej: propiedad del código, sin lock-in)

### 5. Alcance Funcional

#### El orden de los módulos es el del negocio, no el del menú ni el del desarrollo

**Ésta es la regla que más cambia cómo se lee el documento, y la que más fácil se rompe.** Los módulos van en **el orden en que la empresa opera y en que se va a usar el sistema**: se empieza por donde entra el cliente o el dinero, y de ahí se sigue el rastro de una venta hasta que se cobra.

En una fábrica de cocinas eso significa abrir por **marketing y prospección** —de ahí sale el cliente—, seguir con **el diseño de la cocina y su cotización**, después **producción**, luego **obra e instalación**, y cerrar con **cobranza y dirección**. En una distribuidora sería: el vendedor levanta el pedido → facturación → embarque → cobranza. En una consultoría: captación → propuesta → ejecución → facturación.

Por qué importa, y no es estética:

- **Se lee como su empresa, no como un catálogo de software.** El cliente va reconociendo su propio día en cada página; cuando el orden es arbitrario, tiene que reconstruir mentalmente dónde encaja cada módulo y deja de seguir el documento.
- **Cada módulo justifica al siguiente.** «…y cuando facturación lo libera, se va a producción» convierte una lista en una historia. Un módulo suelto invita a la pregunta cara: *«¿y esto para qué lo necesito?»*
- **Deja ver los huecos.** Si el recorrido salta de la cotización a la instalación sin pasar por producción, se nota de inmediato — en un orden alfabético o por tamaño, no.

Cómo se saca el orden, en este orden de preferencia:

1. **De sus juntas** (`biblio_reuniones_notas`): quién hace qué y en qué momento. Ahí se ve dónde nace el dinero, que casi nunca es el primer módulo del menú.
2. **Del rastro de una venta**: sigue una sola operación desde que aparece el prospecto hasta que se cobra, y numera lo que va tocando.
3. **Si no hay juntas**, dilo y usa el flujo natural de ese giro — pero jamás inventes un proceso que el cliente no describió: en la presentación se nota en tres segundos.

Lo que **no** define el orden: el orden del menú de la plataforma, el orden en que se desarrollaron los módulos, su tamaño, ni el orden alfabético.

Los módulos que no son una etapa de la operación —catálogos maestros, configuración, usuarios y permisos, tableros de dirección— van **al final**, agrupados, después del recorrido. Son el soporte del proceso, no un paso de él; la única excepción es el tablero de dirección, que cierra bien porque es donde desemboca todo.

Numera las etapas y nómbralas en la voz del negocio: **«1. Se consigue al cliente»**, no «Módulo CRM». El nombre técnico ya va en el encabezado del módulo.

#### Lo demás del alcance
- Organizar por módulos/súper-módulos, respetando el orden de operación de arriba
- Para cada módulo: nombre como header, sub-módulos con bullets de funcionalidades clave
- **Incluir screenshot real del módulo debajo de la descripción** — es el diferenciador visual más poderoso del documento. Si no hay capturas disponibles, solicitarlas al usuario antes de generar el .docx o dejar placeholder explícito.
- Ser específico en funcionalidades (no genérico): verbos de acción + entidad + beneficio
- **La inteligencia del sistema se menciona DENTRO de los módulos donde de verdad opera**, repartida a lo largo del alcance y no concentrada en una sección de "IA". Se nombra por lo que hace, nunca por cómo está hecha: *"clasificación automática por severidad"*, *"detector de anomalías en el gasto"*, *"predicción de la fecha crítica de reabastecimiento"*, *"el sistema escala solo el hallazgo hasta que alguien responde"*, *"resumen en lenguaje natural de la semana"*. Cada mención tiene que poder contestar **"¿qué hace el sistema solo, que antes hacía una persona?"** — si no la contesta, se va. Ver la regla dura más abajo, que explica por qué se describe el resultado y jamás el motor.
- Si algún módulo tiene integración futura pendiente (ej. nómina externa), aclarar que "la integración completa se cotizará por separado"

### 6. Infraestructura y Tecnología — ⚠️ OMITIR POR DEFAULT (el usuario pidió eliminarla)
- NO incluir esta sección salvo que el usuario la pida explícitamente para una cotización en particular (p. ej. cliente con área de TI que la exige).
- Si se pide: tabla "Componente / Detalle" (Base de datos, Autenticación y Roles, Almacenamiento, Edge Functions, Aplicación web, Repositorio GitHub, Seguridad), stack en una línea y nota de portabilidad ("tecnologías estándar y de código abierto, sin dependencia de proveedor propietario; el cliente puede migrar a cualquier infraestructura compatible").
- La garantía de propiedad/portabilidad que le importa al cliente vive en la sección de Modelo Comercial y Propiedad del Código.

### 7. Modelo Comercial y Propiedad del Código

- Filosofía del modelo (transparencia, sin dependencia)
- Garantías de propiedad del código
- Modelo de entrega (SaaS, licencia perpetua, híbrido)
- Sincronización de código (GitHub)

#### ⚠️ El documento no puede contradecirse a sí mismo

**Éste es el error más caro que ha salido, porque destruye la credibilidad de todo lo demás.** Una sección presumía:

> *"No hay renta de licencia ni dependencia de un proveedor. (…) Si algún día deciden seguir sin nosotros, se llevan todo y la plataforma sigue funcionando."*

…y tres páginas después el mismo PDF cobraba una **suscripción mensual** y traía una **tabla de penalización** por salir antes de tiempo. El cliente que lee las dos cosas no concluye que hubo un descuido: concluye que le están viendo la cara, y a partir de ahí desconfía de cada cifra del documento.

**Antes de cerrar cualquier cotización, lee el documento completo buscando afirmaciones que el resto desmienta.** Las tres que más se cuelan:

| Afirmación | Qué la desmiente |
|---|---|
| "No hay renta" / "sin mensualidad" | La tabla de suscripción |
| "Se llevan todo cuando quieran" | La penalización por terminación anticipada |
| "No hay permanencia obligatoria" | Que salir antes del corte cueste dinero |

**Cómo se arregla sin perder la venta:** la propiedad del código **sí es cierta y sí es un diferenciador**, pero se dice sin las dos mentiras alrededor. Vive bien en la cláusula de Condiciones generales y en "Qué se llevan si deciden salir". Lo que no se hace es una sección que lo presuma mezclándolo con "no hay renta".

Y si el cliente pide quitar el bloque entero, quítalo entero — no lo negocies a medias dejando la mitad que se contradice.

### 8. Inversión / Resumen Financiero

**El bloque económico se lee en tres golpes y en este orden: qué es el pago inicial, cómo se paga todo, y cuánto cuesta seguir.** Nada más. La versión anterior tenía cuatro tablas —inversión, suscripción con dos planes, comparativo de cuatro escenarios— y el cliente tenía que reconstruir mentalmente cuánto sale de su bolsa y cuándo.

#### La inversión inicial NO es "la plataforma completa"

Nunca la llames así: es falso y además abarata todo lo demás. Ese pago **no compra el sistema**, monta el ambiente donde va a vivir. Nómbralo por lo que es —**"Puesta en producción"**— y márcalo **obligatorio** en el mismo renglón, para que no se lea como opcional.

En el detalle va lo que de verdad cubre: infraestructura, base de datos, dominio, respaldos, control de accesos, activación del servidor de correos a nombre del cliente, y la carga inicial de su información.

#### Una tabla de "Cómo se paga", con momentos

Es la que contesta la pregunta que el cliente se está haciendo. Tres renglones:

| Momento | Concepto |
|---|---|
| **Contra firma** | 50 % de la puesta en producción, más el primer mes de suscripción |
| **Al término del primer mes** | 50 % restante de la puesta en producción |
| **A partir del segundo mes** | Suscripción mensual |

**El 50/50 es el esquema estándar**, salvo que Héctor diga otra cosa. Y el monto de "contra firma" **se calcula**: la mitad del inicio más la primera mensualidad, en una sola cifra, para que no tenga que sumarla él.

#### Una sola suscripción, no dos planes

Se presenta **únicamente la mensual**. El plan anual deja de ser un renglón de tabla y pasa a ser **una línea debajo**: *"Si prefieren cubrir el año completo por adelantado, se les regala un mes: pagan once en lugar de doce."*

Dos planes lado a lado obligan a comparar y a decidir antes de tiempo; una línea de regalo invita sin distraer.

#### 🚫 El comparativo se elimina

Nada de tablas "Año 1 mensual / Año 1 anual / Año 2 en adelante". Repiten cifras que ya están arriba, y su columna de totales pone al cliente a mirar el número más grande del documento justo cuando quieres que mire lo que recibe. **Decisión permanente.**

#### Cuida la coherencia con Condiciones generales

Si cambias el esquema de pago, **la cláusula de Facturación tiene que cambiar con él**. Se coló una cotización que decía "50 % contra firma" en la tabla y "100 % contra firma" en la cláusula. Búscalo siempre antes de cerrar.

- Nota sobre IVA (16 % si se requiere CFDI)
- Hora adicional con tarifa preferencial vs. mercado

### 9. Penalización por Terminación Anticipada
- Tabla con períodos y porcentajes decrecientes + **columna de "Máximo"** en MXN para dar certeza numérica
- Qué conserva el cliente al salir — **listar explícitamente como bullets**:
  - 100% del código fuente, base de datos y documentación
  - Respaldo completo de la base de datos en formato SQL
  - Documentación de despliegue para infraestructura propia
- Punto de corte donde la salida es libre ("Mes 19 en adelante: $0, con 30 días de aviso previo")

**El periodo por omisión es de 18 meses**, en tres tramos: meses 1-6 al 60 %, 7-12 al 40 %, 13-18 al 20 %, y libre del 19 en adelante. (Estuvo en 12; Héctor lo subió a 18 el 21-ago-2026.)

**El "Máximo" de cada tramo se CALCULA, no se copia**, y se recalcula entero si cambia la mensualidad: es el porcentaje por las mensualidades que faltan para cerrar el periodo, tomadas en el primer mes del tramo. Con periodo de 18 meses eso es 17, 11 y 5 mensualidades. Verifica tu fórmula reproduciendo los montos viejos antes de escribir los nuevos — si no cuadran, entendiste mal la regla y vas a publicar cifras inventadas.

**Y cuida la frase que va encima de la tabla.** "No hay permanencia obligatoria" justo arriba de una penalización de seis cifras es la misma contradicción de la sección 7 en miniatura. Si Héctor la quiere, se queda —es su decisión— pero díselo. La versión que no se desmiente: *"no están atados a un plazo forzoso, pero salir antes del mes 18 tiene un costo decreciente"*.

### 10. Qué Incluye la Suscripción

#### Va fusionada con el precio, en una sola sección

No pongas una tabla chica de "Plan / Qué incluye / Costo" y debajo otra sección titulada "Qué incluye la suscripción": **las dos dicen lo mismo y la primera lo dice peor**, resumiendo en un renglón lo que la segunda desglosa en nueve. El lector lo lee dos veces, y de paso queda media página en blanco entre ambas.

La sección abre con **el precio en grande**, luego la línea del año adelantado, y de ahí el desglose:

> **QUÉ INCLUYE LA SUSCRIPCIÓN MENSUAL**
> **$X al mes.**
> *Si prefieren cubrir el año completo por adelantado, se les regala un mes: pagan once en lugar de doce.*
> …y la tabla Servicio / Descripción.

#### Las horas: 40 el primer mes, 10 los siguientes

**Por omisión** (Héctor, 21-ago-2026): el primer mes van **40 horas de consultoría y desarrollo**, para sentarse con cada área y adaptar la plataforma a cómo trabajan de verdad. De ahí en adelante, **10 horas cada mes**.

Las 40 del primer mes **se mencionan también en la tabla de "Cómo se paga"**, en el renglón de contra firma: son parte de lo que justifica ese pago inicial más alto.

Cuidado al cambiar la cifra: aparece en **cuatro lugares** —el renglón de la tabla, el cronograma, la nota de cierre del cronograma y el bloque de pago— y si dejas uno suelto el documento se contradice.

#### Dos renglones que van siempre

- **Servidor de correos** — Las notificaciones salen a nombre del cliente **desde su propio dominio**, no desde un remitente prestado, e incluye el mantenimiento del envío y la vigilancia de que lleguen a la bandeja y no al spam. La activación va **también** en la puesta en producción: es trabajo real, y saltárselo deja el sistema mandando correo simulado. *(En Cucina, 1,965 de 1,971 notificaciones estaban en `simulado` porque nadie había verificado el dominio.)* Nunca uses el dominio transaccional de AED para el correo del cliente.
- **Procesamiento con inteligencia artificial** — *"La suscripción incluye un paquete mensual de procesamiento para las funciones que lo usan. Si alguna vez se rebasara, se avisa antes de cobrar nada: nunca llega un cargo sorpresa por consumo."* **Sin cifra**, salvo que Héctor la dé. Ese cierre es lo que hace que la línea sin número funcione: no promete infinito, promete que no hay sorpresa — y así respeta la regla dura de no prometer nada cuyo costo crezca con el uso.

- Tabla detallada "Servicio / Descripción" con filas: Infraestructura dedicada, Soporte técnico (horario + SLA de respuesta), Horas de mejora y adaptación, Actualizaciones de software, Inteligencia Artificial (API costs incluidos), Monitoreo y disponibilidad (SLA uptime), Capacitación continua
- Horas de mejora: cantidad mensual, ejemplos concretos de qué cubre (configurar nueva oficina, modificar reporte, ajustar campos, crear filtros)
- **Acumulación de horas**: las horas no utilizadas se acumulan **dentro del semestre en curso** y expiran al cierre del semestre (no es acumulación indefinida, pero tampoco "úsala o piérdela" mensual)
- **Módulo interno de tracking de horas y funcionalidades**: mencionar que la plataforma incluye un seguimiento transparente donde el proveedor registra cada funcionalidad desarrollada con complejidad estimada y tiempo real. Esto es diferenciador de transparencia.
- Horas adicionales: tarifa preferencial + comparación explícita con mercado (ej. "$850 MXN/hora vs. $1,200 MXN/hora de mercado")
- Lista de modificaciones mayores que se cotizan aparte (integraciones externas, portales nuevos, sistemas de notificaciones, módulos IA adicionales)

### 11. Cronograma de Implementación
- Fases con actividades y duración
- Si hay MVP disponible, indicar acceso inmediato
- Horas de adaptación incluidas en el primer mes
- Forma de pago ligada al cronograma

### 12. Condiciones Generales
**Presentarlas como tabla compacta de 2 columnas (Condición / Detalle) con ~6 filas AGRUPADAS**, no como subsecciones con encabezado. Agrupación estándar: (1) Propiedad y uso del código [PI + anti-reventa], (2) Confidencialidad y datos [confidencialidad + datos post-terminación], (3) Aceptación, vigencia y renovación [criterios de aceptación + vigencia/renovación + vigencia de la cotización], (4) Facturación y mora, (5) Nivel de servicio [SLA con crédito], (6) Disputas y fuerza mayor. Los temas a cubrir son los siguientes:

- **Propiedad Intelectual** — Código es propiedad del cliente desde su creación; proveedor cede derechos patrimoniales; repositorio GitHub siempre actualizado.
- **Confidencialidad** — Bidireccional, durante y después del contrato. Datos del cliente son del cliente.
- **Vigencia y Renovación** — Penalización decreciente durante los primeros 18 meses; cancelación libre desde el mes 19 con 30 días de aviso; renovación automática por periodos de 12 meses. (Ver la advertencia sobre "sin permanencia obligatoria" en la sección 9.)
- **Facturación** — Desglose de: puesta en producción (**50 % contra firma y 50 % al término del primer mes** — tiene que decir lo MISMO que la tabla "Cómo se paga"; se coló una cotización con 50/50 en la tabla y 100 % en esta cláusula), mensualidad (primeros 5 días del mes; la primera se cubre contra firma), año adelantado (factura única al inicio del periodo), precios antes de IVA (16% si CFDI), método de pago.
- **Datos para Pago** — Presentar **dos opciones claramente separadas**:
  - *Opción A — Sin CFDI* (persona física): beneficiario, banco, CLABE, cuenta, sucursal
  - *Opción B — Con CFDI* (persona moral): beneficiario (razón social), banco, CLABE, contrato, requisitos CFDI (constancia de situación fiscal, uso de CFDI, correo)
  - **Importante:** siempre presentar ambas opciones. Para montos grandes, recomendar persona moral por respaldo legal.
- **Mora en Pagos** — Cargo por mora de 5% mensual sobre monto vencido si no se paga dentro de los primeros 10 días naturales; suspensión de servicio a partir de 30 días de atraso; la suspensión no exime del pago de mensualidades del periodo de atraso.
- **Protección de Propiedad Intelectual Genérica** — Cliente se compromete a no comercializar, sublicenciar, distribuir ni revender el software (total o en partes sustanciales) a terceros, especialmente a empresas del mismo giro. Código es para uso interno exclusivo del cliente. Esta cláusula protege al proveedor sin limitar el uso interno del cliente.
- **Vigencia de la Cotización** — 30 días naturales desde la fecha de emisión; precios sujetos a cambio después.
- **Nota de Cotización ≠ Contrato** — Cerrar con: "El presente documento constituye una cotización y no un contrato. En caso de que ambas partes estén interesadas en llevar a cabo el proyecto, se procederá a la firma de un contrato de prestación de servicios que detalle todas las condiciones aquí descritas, así como cualquier aspecto adicional no especificado en esta cotización."

### 🚫 Secciones ELIMINADAS del formato (decisión permanente del usuario — NO incluirlas)
- **Glosario de Términos** — NO incluir nunca. Si un tecnicismo es imprescindible, explicarlo entre paréntesis en el mismo lugar donde aparece.
- **Cierre / Call to Action** ("¿Comenzamos?") — NO incluir. Los datos de contacto van completos en la PORTADA (Preparado por: nombre, correo, teléfono); el documento termina con Condiciones Generales / Datos para Pago.

## Modelos comerciales típicos

### Modelo A: Suscripción Pura (todo incluido)
- Sin inversión inicial fuerte
- Desarrollo amortizado en la mensualidad
- Permanencia mínima de 18-24 meses
- Penalización decreciente durante el período mínimo
- Después del período mínimo: salida libre

### Modelo B: Híbrido (inversión inicial + suscripción)
- Inversión inicial que cubre desarrollo e implementación
- Mensualidad más baja que cubre operación y mejoras
- Penalización más corta (12 meses) porque la inversión inicial ya cubre parte del desarrollo
- Recomendado cuando el cliente quiere un MVP inmediato

### Modelo C: Licencia Perpetua + Mantenimiento
- Pago único por el software
- Mantenimiento anual opcional (15-20% del costo de licencia)
- El cliente es dueño desde el día 1
- Menor recurrencia para el proveedor

## Estructura de penalización decreciente

La penalización protege la inversión de desarrollo del proveedor. El principio es: a medida que pasa el tiempo, el proveedor ya recuperó más de su inversión, así que la penalización baja.

Ejemplo para modelo híbrido (12 meses):
- Meses 1-6: 60% de mensualidades restantes hasta mes 12
- Meses 7-9: 40% de mensualidades restantes
- Meses 10-12: 20% de mensualidades restantes
- Mes 13+: $0, salida libre con 30 días de aviso

Ejemplo para modelo suscripción pura (24 meses):
- Meses 1-6: 75% del saldo restante
- Meses 7-12: 50% del saldo restante
- Meses 13-18: 25% del saldo restante
- Meses 19-24: 10% del saldo restante
- Mes 25+: $0, salida libre

Incluir siempre el monto máximo de penalización por rango para dar certeza al cliente.

## Checklist de huecos legales a cubrir

Al generar o revisar una cotización, verificar que estén cubiertos estos puntos. Si falta alguno, señalarlo al usuario:

1. **Criterios de aceptación del entregable** — ¿Qué define que el MVP/sistema está "listo"? Sin esto, el cliente puede rechazar indefinidamente.
2. **Mecanismo de resolución de disputas** — Mediación, arbitraje, jurisdicción. Sin esto, cualquier desacuerdo escala a litigio directo.
3. **Cláusula de mora** — Ya cubierta en la estructura (5% mensual + suspensión a 30 días). Verificar que esté presente con números concretos.
4. **Fuerza mayor** — Eventos fuera del control de ambas partes.
5. **Validación de horas consumidas** — Reporte transparente de horas de mejora usadas vs. disponibles (módulo interno de tracking).
6. **Definición de "mejora sencilla" vs. "módulo nuevo"** — Criterio objetivo para clasificar solicitudes. Usar ejemplos concretos en ambas direcciones.
7. **SLA con consecuencias** — Tiempos de respuesta sin penalización no sirven. Definir créditos o compensaciones si se incumple el uptime 99.5%.
8. **Acumulación de horas** — Regla clara: acumulación dentro del semestre en curso, expiran al cierre del semestre.
9. **Datos post-terminación** — ¿Cuánto tiempo conserva el proveedor los datos? ¿Obligación de borrarlos tras entrega del respaldo SQL?
10. **Persona jurídica vs. física para cobro** — Ofrecer ambas opciones (con/sin CFDI). Para montos grandes o clientes corporativos, recomendar siempre persona moral.
11. **Protección de IP genérica del proveedor** — Cláusula anti-reventa: el cliente no puede comercializar ni sublicenciar el código a terceros del mismo giro. Ya cubierta en la estructura.
12. **Documentación técnica** — Obligación de entregar y mantener actualizada la documentación para que un tercero pueda continuar el proyecto.
13. **IP preexistente** — Distinguir código personalizado (del cliente) de frameworks/herramientas genéricas del proveedor.
14. **Aclaración cotización ≠ contrato** — Siempre cerrar con la nota de que el documento no constituye contrato y que se firmará uno aparte.
15. **Coherencia One-Pager ↔ Alcance** — Verificar que cada dolor del one-pager tenga una hipótesis de solución reflejada en el alcance funcional, y que cada KPI prometido sea defendible con la funcionalidad ofrecida. Si hay un dolor sin solución en el alcance, o un KPI sin mecanismo claro para alcanzarlo, marcarlo.

15d. **El documento no se contradice** — Leer de corrido las afirmaciones fuertes y confrontarlas con las tablas: ¿alguna dice "no hay renta" habiendo suscripción, "se llevan todo" habiendo penalización, "sin permanencia" habiendo costo de salida? Ver sección 7.

15e. **Una cifra cambiada, cambiada en todas partes** — Cuando se mueve un precio, las horas o el plazo, barrer TODAS sus apariciones y sus derivadas: la mensualidad alimenta la tabla de penalización completa; el inicio alimenta los dos pagos; las horas viven en cuatro lugares; el esquema de pago vive en la tabla y en la cláusula de Facturación. Extraer del PDF final el conjunto de montos y compararlo contra el esperado.

15c. **Las tarjetas cuentan lo nuestro** — Leer una por una las cifras del resumen ejecutivo y preguntarse de cada una: *¿esto existiría igual sin nosotros?* Si la respuesta es sí (proyectos, movimientos, insumos, unidades, clientes, cualquier volumen que venga de sus archivos) sale de las tarjetas y se cita, si acaso, como evidencia en la sección que demuestra que no es una maqueta. Las cifras de infraestructura —tablas, endpoints, funciones— salen sin reemplazo. Ver la regla en la sección 4.

15b. **El alcance va en orden de operación** — Leer los encabezados de los módulos de corrido, en el orden en que aparecen, y preguntarse si eso describe cómo trabaja la empresa. El primero debe ser donde entra el cliente o el dinero; el último, donde se cobra o se mide. Si el recorrido salta una etapa, o si el orden resultó ser el del menú, el del desarrollo o el alfabético, reordenar. Los catálogos, la configuración y los permisos van al final. Ver la regla completa en la sección 5.
16. **Cada promesa existe y no cuesta por uso** — Recorrer bullets, tablas de "qué incluye" y condiciones, y confirmar una por una que (a) están construidas —archivo y línea, o tabla y consulta— y (b) su costo no crece con el uso del cliente. Ver la regla dura más abajo.
17. **Cotización registrada en `quotes`** — El PDF no basta: verificar que quedó la fila con `cliente_id` ligado. Ver "PASO FINAL" más abajo. Sin esto, los agentes seguirán reportando al cliente como "falta cotizar".
18. **PDF archivado fuera de la máquina** — `pdf_path` apunta al escritorio de Héctor; eso no es archivo, es una copia local. Verificar que `pdf_storage_path` quedó lleno vía `archivar-cotizacion`. Ver "PASO FINAL" más abajo.

## Formato de salida

- **Documento COMPACTO (objetivo: 5-6 páginas).** Agrupar secciones afines para que fluyan sin saltos de página forzados (p. ej. Hallazgos+Resumen Ejecutivo; Modelo Comercial+Inversión+Suscripción+Penalización+Cronograma). Omitir el índice si el documento queda corto. Condiciones Generales en tabla compacta de 2 columnas (Condición / Detalle), no como sub-secciones con encabezado.
- **El entregable FINAL siempre es un PDF.** Genera el documento como `.docx` (con el skill de docx) y luego conviértelo a PDF; el PDF es lo que se entrega al usuario. Conserva el `.docx` como archivo fuente editable, pero el output principal es el `.pdf`.
  - Conversión (elige según el sistema):
    - **Linux/macOS o sandbox:** `python <skill-docx>/scripts/office/soffice.py --headless --convert-to pdf cotizacion.docx` (LibreOffice). OJO: ese script usa `socket.AF_UNIX` y FALLA en Windows.
    - **Windows:** si hay Microsoft Word instalado, `python -c "from docx2pdf import convert; convert('cotizacion.docx','cotizacion.pdf')"` (usa Word por COM; alta fidelidad). Si no hay Word pero sí LibreOffice, llamar `soffice.exe --headless --convert-to pdf` directamente (no el script del skill).
  - Nombra el archivo `Cotizacion_<Cliente>_v<N>.pdf` y déjalo en el working dir del usuario.
  - Si la conversión a PDF falla, entrega el `.docx` e indícalo explícitamente, pero intenta el PDF primero.
- Tipografía: Arial (o sans-serif limpio equivalente)

#### Marca compartida: los dos logos, y el naranja es el de AED

**Decisión de Héctor (24-ago-2026), y es regla dura, no nota de formato.** La cotización es un documento comercial de AED, pero se lee del lado del cliente. Por eso lleva las dos marcas:

- **Los dos logos en la portada**, juntos y del mismo tamaño visual: el de AED y el del cliente. Si sólo aparece uno, está mal.
- **El acento de los encabezados es el naranja de AED**, `#E85D1F`. No el color del cliente.
- **El color del cliente vive como acento secundario**: filetes, viñetas, encabezados de tabla. Presente, pero sin gobernar el documento.
- Gris oscuro `#333` para texto, blanco de fondo.

**Por qué se escribió esto:** las cotizaciones habían derivado, cada una por su lado. Cucina y Mr. Cocoa usaban el naranja de AED; lPet, NIXGO y Promasa usaban el color del cliente como acento principal — y **ninguna de las cinco traía logo**. El resultado no era una postura ni la otra, era una mezcla inconsistente. Eso sí es un defecto, se elija lo que se elija.

**De dónde salen los logos.** No hay un archivo maestro del logo de AED en el repo: el único disponible es `https://www.agilidadendigital.com/favicon.png` (el árbol, 77×71 px, PNG con transparencia). Alcanza para una portada a ~40 px de alto, pero si aparece uno de mayor resolución, úsalo. El del cliente se saca de su propio sitio.

**Muestrea el color del logo, no lo supongas.** Al hacerlo salieron dos discrepancias vigentes:
- El árbol de AED es **`#F26C4E`**, no `#E85D1F`. Son parecidos y conviven, pero no son el mismo. `#E85D1F` sigue siendo el corporativo de los encabezados; si algún día se unifican, se decide aquí.
- lPet es **`#77933C`** (verde olivo) con gris `#595959`. Su cotización usaba `#0E7C5A`, que no es su verde.

Si el logo no se puede obtener, **dilo y entrega la portada sin él** — nunca lo sustituyas por texto imitando la marca, que es el mismo error que se cometió con la firma de Outlook: un remedo se ve peor que la ausencia.
- Tablas con bordes suaves, headers con fondo oscuro + texto blanco, filas alternadas
- Headers y footers: "Agilidad en Digital · Propuesta Confidencial" en izquierda, número de página en derecha
- Portada con espaciado generoso, logo grande centrado, tabla label/valor
- Screenshots de módulos insertados a ancho completo debajo de cada descripción funcional
- Cifras clave del resumen ejecutivo en formato de "tarjetas" horizontales. Cuentan lo que se entrega, no el volumen de los datos del cliente ni detalles de infraestructura — ver la regla en la sección 4 (ej: "20 módulos operando | 9 puestos con su vista | 14 automatizaciones | 6 reportes")

## PASO FINAL — Registrar la cotización en Supabase (OBLIGATORIO)

**No des la cotización por entregada hasta haber insertado su fila en `quotes`.** Generar el PDF no es el último paso: si la cotización no queda registrada, para el resto del sistema **nunca existió**.

**Por qué existe esta regla (9-ago-2026):** la tabla `quotes` tenía **una sola fila** en toda la base, porque las cotizaciones se entregaban como PDF y nadie las registraba. El agente Steve deduce "clientes por cotizar" de *cliente en etapa cotizable sin cotización ligada*, así que marcó a CCR - Silver Breeze MX como "listo para cotizar" el **6, 7, 8 y 9 de agosto** — cuatro días seguidos — cuando la cotización ya se había enviado. El fundador tuvo que corregirlo a mano. Un pendiente falso repetido entrena a ignorar el feed completo, incluidos los pendientes reales.

Inmediatamente después de generar el PDF, con el MCP de Supabase (`execute_sql`, proyecto `clnirhdxsohtrcjsuntw`):

```sql
insert into quotes (
  quote_number, client_name, client_company, client_email,
  subtotal, total, currency, setup_fee, monthly_fee,
  valid_until, status, notes, pdf_name, pdf_path, cliente_id, deal_id
) values (
  'COT-2026-XXXX',            -- consecutivo; revisa el último con: select quote_number from quotes order by created_at desc limit 1
  '<persona que la recibe>', '<empresa>', '<correo o null>',
  <subtotal>, <total>, 'MXN', <inversion inicial o null>, <mensualidad o null>,
  (current_date + 30),        -- vigencia estándar de 30 días naturales
  'sent',                     -- 'draft' si aún no se manda; 'sent' al entregarla; luego 'accepted' / 'rejected'
  '<versión, modelo comercial y qué incluye, en una línea>',
  '<Cotizacion_Cliente_v1.pdf>', '<ruta local o del repo donde quedó el PDF>',
  '<cliente_id de public.clientes, o null>', '<deal_id, o null>'
) returning id, quote_number;
```

Reglas:

- **`cliente_id` es lo que apaga el falso positivo.** Búscalo con `select id, company from clientes where deleted_at is null and company ilike '%<cliente>%'`. Sin él, la fila existe pero Steve sigue sin ver la liga y vuelve a marcar al cliente.
- Si el cliente **no está** en `clientes`, dilo en el resumen final para que el fundador lo dé de alta — **no lo crees tú** (misma regla que el Bibliotecario).
- **Versión nueva de una cotización existente** (v2, v3…): inserta una fila nueva con su propio `quote_number`, no sobrescribas la anterior. El histórico de versiones es evidencia comercial.
- **Cotización en USD**: pon `currency='USD'` y deja los montos en USD, sin convertir.
- Al terminar, dile al usuario en una línea qué quedó registrado: folio, cliente y total.

### Archivado recuperable del PDF — llamar `archivar-cotizacion` (parte del PASO FINAL)

**Por qué existe esta regla (20-ago-2026):** `pdf_path` guarda hoy una ruta del escritorio de Héctor (`C:\Users\Kotty\Desktop\...`). Una cotización que solo existe en una máquina no está archivada, está **guardada**. Si esa máquina se formatea, se pierde el documento exacto que el cliente recibió — y ese PDF es evidencia comercial: qué se prometió, a qué precio, con qué vigencia y en qué versión. La fila en `quotes` dice que la cotización existe; el archivado es lo único que dice dónde recuperarla.

**Solo se archiva la versión FINAL, la que se le entrega al cliente.** Los borradores intermedios no se suben: llenan el bucket de documentos que nadie va a volver a abrir y, peor, vuelven ambiguo cuál fue el que se mandó. Si dudas si ese PDF es el definitivo, no lo archives todavía — archívalo cuando se entregue.

**La llave es el FOLIO, no el uuid.** La función busca la fila por `quote_number` y hace upsert: si el folio ya existe la actualiza, si no la crea. Por eso llamarla dos veces con el mismo folio **no duplica** — reemplaza el PDF y borra el anterior del bucket. Mandar `quote_id` no sirve de nada: la función lo ignora y contesta `400 quote_number (folio) es obligatorio`.

**Va autenticada con el header `x-archivar-secret`.** Sin él la función contesta `401 Falta el header x-archivar-secret` antes de mirar el cuerpo. El secreto vive en el Vault de Supabase como `ARCHIVAR_COTIZACION_SECRET`; se lee con el MCP y se pasa por variable de ambiente. **Nunca lo escribas dentro del script, ni en el repo, ni en un archivo del escritorio.**

```sql
-- Léelo justo antes de usarlo; no lo guardes en ningún lado.
select decrypted_secret from vault.decrypted_secrets where name = 'ARCHIVAR_COTIZACION_SECRET';
```

Después del `insert ... returning id`, con el **folio** de la cotización:

```bash
# Sube el PDF final al bucket y sella la fila. Ajusta las rutas y el folio.
# El secreto entra por ambiente para que no quede escrito en el script.
ARCHIVAR_SECRET='<el del Vault>' python - <<'PY'
import base64, json, os, urllib.request
FOLIO = "COT-2026-XXXX"          # el mismo que insertaste en quotes
PDF   = r"C:\Users\Kotty\Desktop\Cotizacion_Cliente_v1.pdf"
URL   = "https://clnirhdxsohtrcjsuntw.supabase.co/functions/v1/archivar-cotizacion"
payload = {
    "quote_number": FOLIO,       # OBLIGATORIO: es la llave del upsert
    "pdf_name": os.path.basename(PDF),
    "pdf_base64": base64.b64encode(open(PDF, "rb").read()).decode(),
    "es_final": True,            # solo la que se entrega; un borrador jamás va con true
    "version": "1.0",            # TEXTO, no número. Ver la regla de formato abajo.
    # Si el folio es NUEVO para la función, además son obligatorios:
    # "client_company": "...",   # sin esto contesta 400
    # "cliente_id": "<uuid>",    # el que apaga el falso positivo de Steve
}
req = urllib.request.Request(URL, data=json.dumps(payload).encode(),
                             headers={"Content-Type": "application/json",
                                      "x-archivar-secret": os.environ["ARCHIVAR_SECRET"]})
print(urllib.request.urlopen(req).read().decode())
PY
```

Respuesta buena: `ok:true`, `pdf_storage_path`, `bytes` y una `url_firmada` de 1 hora. Revisa también `versiones_degradadas_del_mismo_cliente`: si trae un número mayor a 0, acabas de marcar como no-final esa cantidad de cotizaciones viejas de ESE cliente. Si esperabas 0 y salió otra cosa, párale y revisa antes de seguir.

**Cómo recuperar el PDF después** (esto es para lo que sirve todo lo anterior):

```bash
# Por folio exacto devuelve ESE documento aunque ya no sea la versión final.
# Por nombre de cliente devuelve la FINAL vigente.
curl -s -H "x-archivar-secret: $ARCHIVAR_SECRET" \
  "https://clnirhdxsohtrcjsuntw.supabase.co/functions/v1/archivar-cotizacion?buscar=COT-2026-XXXX"
```

Devuelve la fila, `url_firmada` (1 hora) y un `aviso` que avisa solo cuando el folio ya fue superado por una versión más nueva, o cuando la fila existe pero **nunca se archivó el PDF**. Ese aviso es el que hay que leer antes de decirle a alguien que la cotización está respaldada.

Reglas:

- **La función escribe `pdf_storage_path`, `es_final`, `version` y `archivada_en`. No las escribas tú por SQL.** Si las llenas a mano queda la ruta apuntando a un archivo que nunca se subió, que es peor que dejarlas nulas: miente diciendo que sí hay respaldo.
- **`pdf_path` no se toca.** Sigue siendo la ruta local y sigue sirviendo para abrir el archivo en la máquina de Héctor. El archivado se suma, no reemplaza.
- **`version` se manda SIEMPRE y como texto, con el formato `"1.0"`, `"2.0"`.** Si lo omites, la función lo adivina del nombre del archivo y escribe `"v1"` — y entonces la tabla acaba con dos formatos conviviendo (`1.0` junto a `v1`), que es exactamente lo que vuelve inútil ordenar por versión. Mandarlo explícito cuesta un renglón y evita el desorden.
- Si la función responde 404 o se queja de un campo, **no inventes el contrato**: revísalo con el MCP de Supabase (`get_edge_function`, slug `archivar-cotizacion`) y usa los nombres reales. Si todavía no está desplegada, deja la fila registrada en `quotes`, dilo en el resumen final y **no des la cotización por archivada**.
- **Verifica que de verdad quedó, no que el POST no dio error.** Un `ok:true` dice que subió; lo que prueba el archivado es bajarlo. Consulta `select quote_number, respaldada from public.v_cotizaciones_finales` — la columna `respaldada` dice de un vistazo qué filas todavía no tienen PDF en el bucket.
- **Versión nueva → archivo nuevo.** Igual que con la fila: la v2 se archiva aparte, nunca encima de la v1. El histórico es exactamente lo que sirve el día que el cliente pregunta "¿esto no era otro precio?".
- Al terminar, la línea de cierre del paso menciona las dos cosas: folio registrado y PDF archivado.

## PASO DE APRENDIZAJE — Qué se lleva el skill de esta cotización

Entregado el PDF, registrada la fila y archivado el documento, queda una pregunta: **¿pasó algo aquí que habría cambiado el resultado de la SIGUIENTE cotización, con otro cliente?**

Casi siempre la respuesta es no, y está bien. **Cero aprendizajes es un resultado honesto y frecuente.** El filtro es exigente a propósito: un skill que engorda en cada corrida deja de leerse completo, y un skill que no se lee completo no gobierna nada. Se prefiere un skill corto que se obedece a uno largo que se hojea.

### Qué SÍ entra — los tres filtros, y hay que pasar los tres

1. **Es general.** Aplica a cotizaciones de otros clientes, no solo a éste.
2. **Habría cambiado el resultado.** Si la regla hubiera estado escrita, el documento habría salido distinto. No basta con que "hubiera estado bueno saberlo".
3. **No está ya escrita.** Lee completa la sección donde iría antes de agregar. Si ya está dicha con otras palabras, no se agrega nada; a lo mucho se le suma el caso nuevo como evidencia de que reincide.

Ejemplo real de algo que sí entró (20-ago-2026): la cotización de Mr. Cocoa prometía *"IA incluida"* en una plataforma que no llama a ningún modelo. De ahí salió la regla *"Solo se promete lo que está construido y no cuesta por uso"* — general, habría cambiado el documento, y no estaba escrita en ningún lado.

### Qué NO entra

- El precio de este cliente, su mensualidad, su descuento, su plazo.
- El nombre de un módulo, un dolor, un KPI, una fase del cronograma.
- Cualquier dato del caso. **Eso vive en `quotes` y en el PDF archivado, no aquí.** El skill dice *cómo* se cotiza; la base dice *qué* se le cotizó a quién.
- Una preferencia que Héctor pidió una sola vez para un cliente en particular. Si la vuelve a pedir en otra cotización, ahí ya es regla y ahí sí se escribe.
- Un error de dedo, un archivo que no abrió, una conversión de PDF que falló. Eso es ruido de la corrida, no conocimiento.

### Cómo se escribe

- **Solo se AGREGA. Nunca se reescribe ni se borra lo que ya está.** El 20-ago-2026 este mismo archivo estuvo a un comando de perder las 34 líneas del PASO FINAL porque una instrucción decía "sobrescribe". Una regla vieja que estorba se marca, se discute con Héctor y él decide; no se retira en automático al vuelo de una corrida.
- **Va en la sección temática que le toca**, no al final. Una regla de qué prometer va en *"Solo se promete lo que está construido y no cuesta por uso"*; una de redacción o diseño en *"Formato de salida"*; una de riesgo legal como renglón nuevo del *"Checklist de huecos legales"*; algo que nunca debe hacerse, en *"Anti-patrones"*. **No abras un cajón de "notas" al final**: un cajón de notas es donde las reglas se mueren sin que nadie las lea.
- **Cada aprendizaje trae FECHA y CASO.** Sin el caso, en tres meses la regla parece arbitraria y alguien la quita. El caso es la defensa de la regla.
- Formato del renglón, una línea o dos:
  `- **<La regla, en imperativo y sin rodeos>.** <Qué habría cambiado si hubiera estado escrita.> *(DD-mmm-AAAA · <cliente o caso que la produjo>)*`
- Si el aprendizaje necesita más de dos líneas para entenderse, es una sección, no un bullet: escríbelo como sección corta con su propio encabezado y su párrafo de **Origen (fecha · caso)**, igual que las que ya existen.
- Máximo **dos aprendizajes por corrida**. Si te salieron cinco, no son aprendizajes: es una lista de detalles del caso. Quédate con el que más habría cambiado el documento.

## PASO DE PUBLICACIÓN — Subir el skill aprendido a GitHub

**Si no hubo aprendizajes, aquí termina: NO hay commit.** Un repo con veinte commits vacíos esconde los tres que sí cambiaron algo. No se sube un "sin cambios", no se toca la fecha, no se hace commit vacío.

Si sí hubo, se publica sobre `skills/cotizacion-saas/SKILL.md` del repo `scrumexpress-cell/kott-claude-skills`:

1. **Compara primero contra el remoto, exactamente igual que en el PASO 0.** Aunque el PASO 0 ya haya corrido al principio: entre el inicio y el cierre de una cotización pueden pasar horas y otra máquina pudo publicar. **Normaliza `\r\n` → `\n` de ambos lados antes de comparar**; sin eso un archivo idéntico se reporta como completamente distinto y la comparación no sirve.
   - **El remoto trae algo que el local no tiene → intégralo al local ANTES de subir.** Nunca lo pises: se perderían reglas ajenas que ya se estaban usando.
   - Solo cuando el local sea el remoto **más** los aprendizajes de hoy, se sube.
2. Clona somero, copia el local **normalizado a LF**, y sube:

```bash
gh repo clone scrumexpress-cell/kott-claude-skills /tmp/kott-skills -- --depth 1
python - <<'PY'
src = r"C:\Users\Kotty\.claude\skills\cotizacion-saas\SKILL.md"
dst = "/tmp/kott-skills/skills/cotizacion-saas/SKILL.md"
# LF de un solo lado: el repo guarda LF y así el diff muestra los renglones que
# de verdad cambiaron, no el archivo entero por un cambio de fin de línea.
open(dst, "wb").write(open(src, "rb").read().replace(b"\r\n", b"\n"))
PY
cd /tmp/kott-skills
git diff --stat            # si sale vacío, NO hay nada que subir: detente aquí
git add skills/cotizacion-saas/SKILL.md
git commit -F - <<'MSG'
skill(cotizacion-saas): <la regla aprendida, en una línea>

<Qué habría cambiado si la regla hubiera estado escrita, en 1-2 líneas.>
Caso: <cliente o cotización que lo produjo>, <fecha>.
MSG
git push
```

- **El mensaje del commit dice QUÉ se aprendió y DE QUÉ CASO, nunca "update skill" ni "mejoras".** El `git log` de este archivo es la historia de por qué el skill es como es; un log de "update" la borra.
- El caso sí se nombra en el mensaje y en la nota de origen (es la procedencia de la regla). Lo que nunca entra al skill son los **parámetros** del caso: precios, montos, nombres de módulos.
- Si `gh` falla o no hay red, **no dejes el aprendizaje solo en la máquina**: dile a Héctor que quedó en el local sin publicar, para que se suba en la siguiente corrida.
- **Vigila el tamaño.** Si el SKILL.md pasa de ~500 líneas, lo que toca es mover material a `references/` (p. ej. los modelos comerciales o el checklist legal, como archivo aparte referenciado desde aquí), **no seguir apilando**. Un skill que ya no cabe en la cabeza de quien lo lee es un skill que se ignora.

**Cierre, siempre una línea a Héctor:** o *"Aprendí X del caso Y y ya está subido al repo"*, o *"De esta cotización no salió nada general; no hubo commit"*. Las dos son respuestas buenas; el silencio no.

## Solo se promete lo que está construido y no cuesta por uso (REGLA DURA)

**La cotización lista exactamente lo que la plataforma hace hoy. Nada más.** Ni funcionalidad que "sería fácil de agregar", ni servicios cuyo costo crezca con el uso del cliente. Este documento se vuelve contrato: cada renglón es algo que hay que sostener con la mensualidad ya firmada.

**Dos verificaciones antes de generar el PDF, siempre:**

1. **¿Existe?** Cada promesa —bullets del alcance, filas de "qué incluye", condiciones— tiene que poder señalarse con archivo y línea del repo, o con la tabla y la consulta. Si el respaldo es "me acuerdo que lo pensamos", se quita. El que escribe la cotización suele ser el que construyó la plataforma, y ése es el peor auditor posible: da por hecho lo que recuerda haber diseñado.

2. **¿Su costo crece con el uso?** Si la respuesta es sí, no va en una mensualidad fija. Casos que hay que revisar uno por uno:
   - Llamadas a modelos de IA (tokens)
   - Correo transaccional por volumen
   - Almacenamiento de archivos e imágenes
   - Transcripción, OCR, geocodificación, SMS, WhatsApp
   - Cualquier API de terceros que cobre por evento
   - Tráfico y filas de base de datos, cuando el plan contratado tiene tope

**Cómo se redacta cuando el cliente sí pidió algo de costo variable:** va en "qué se cotiza aparte", descrito por lo que hace, con su propio precio o con la nota de que se cotiza al definir el volumen. **Nunca se explica en el documento el motivo del recorte.** El cliente lee lo que la plataforma hace; no lee la contabilidad interna del proveedor ni frases como "esto consume tokens" o "esto nos cuesta por llamada". Es una regla de qué prometer, no un tema de conversación con el cliente.

**Origen (20-ago-2026):** la cotización de Mr. Cocoa Food Service prometía *"el costo de las llamadas a los modelos de IA está incluido en la mensualidad"* en la tabla de qué incluye la suscripción, y *"IA incluida"* en el plan mensual. La plataforma **no llama a ningún modelo de IA**: no tiene edge functions y la importación de órdenes en PDF es análisis de texto con expresiones regulares. Esa línea comprometía un costo variable y sin tope, contra una mensualidad fija de $7,900, por una funcionalidad que además no existía. La frase entró sola, por inercia de otras cotizaciones donde sí aplicaba.

### La IA SÍ se presume, y en varios puntos del documento

**Instrucción directa de Héctor (21-ago-2026):** *"la gente quiere ver que sus sistemas tienen inteligencia. Donde hagamos automatizaciones (n8n, etc.) aprovecha y menciona en las cotizaciones que es IA. La gente no sabe bien qué sí es y qué no, y no le importa: quiere presumir que es IA."*

Tiene razón, y además es correcto en el idioma del mercado: **un flujo que clasifica, prioriza, escala, detecta lo que se sale de la norma o decide el siguiente paso ES inteligencia artificial** para cualquier comprador de software. Cómo esté implementado por dentro —un modelo, un motor de reglas, un flujo de automatización— es una distinción de ingeniería que al cliente no le sirve para nada.

Así que la regla NO es callarla. La regla es:

- **Búscala activamente y menciónala en varios puntos**, no una vez de pasada. Donde el sistema haga algo solo, eso se nombra como la capacidad inteligente que es: en el one-pager, en los módulos del alcance, y en el resumen ejecutivo.
- **Es de los mejores argumentos de venta que tiene la propuesta.** Un ERP que "guarda información" compite por precio; uno que "detecta, avisa y prioriza solo" compite por valor. Si el documento sale sin una sola mención de inteligencia habiendo automatización real, se desaprovechó.

Y de ahí salen las tres reglas de cómo se escribe:

1. **Nunca nombres la tecnología.** Ni "GPT", ni "Claude", ni "OpenAI", ni "modelo de lenguaje", ni "tokens", ni "n8n", ni "reglas". Nombrar el motor hace dos daños a la vez: ata al proveedor a una implementación que quizá cambie, e invita al cliente a comparar proveedores por su stack en vez de por su resultado.

2. **Descríbela como capacidad, en la voz del cliente.** No "módulo de IA": *"clasificación automática de hallazgos por severidad"*, *"detector de anomalías en el gasto"*, *"predicción de la fecha crítica de reabastecimiento"*, *"el sistema te avisa antes de que se venza"*, *"resumen en lenguaje natural de lo que pasó esta semana"*. Cada una es verificable en pantalla y ninguna promete un costo por evento.

3. **Que se sienta a lo largo del documento, no en una sección aparte.** Una fila llamada "Inteligencia artificial" en la tabla de qué incluye es justo la que se vuelve un cheque en blanco. En cambio, mencionar la capacidad inteligente dentro de cada módulo donde de verdad opera —el que clasifica, el que alerta, el que prioriza— la hace parte del producto en vez de un extra facturable.

**El único límite:** que detrás haya algo que de verdad pasa solo. No se le pone "inteligente" a una tabla que alguien llenó a mano y que el sistema únicamente muestra — eso no es prudencia excesiva, es que el cliente lo descubre el día que abre la pantalla y ahí se cae la credibilidad de todo el documento, incluidas las menciones que sí eran ciertas.

Pero el listón es bajo y a propósito: **si el sistema hace algo solo que antes hacía una persona, cuenta.** Clasificar, ordenar por urgencia, calcular, avisar, escalar, sugerir, detectar un faltante, disparar un correo — todo eso cuenta y todo eso se presume.

**Regla práctica antes de mandar:** por cada mención de inteligencia, contesta *"¿qué hace el sistema solo, que antes hacía una persona?"*. Casi siempre hay respuesta. Y si al terminar el documento no hay ninguna mención, no des por hecho que no había: regresa al alcance y búscala, porque en una plataforma con automatizaciones seguro la hay y dejarla fuera es regalar el argumento.

## Anti-patrones — NUNCA hacer

- **Que el documento se contradiga.** "No hay renta" con una suscripción; "se llevan todo" con una penalización; "sin permanencia" con un costo de salida. Ver sección 7.
- **Llamar "plataforma completa" al pago inicial.** No lo es: monta el ambiente de producción. Ver sección 8.
- **Tabla comparativa de escenarios.** Eliminada de forma permanente.
- **Dos planes de suscripción lado a lado.** Solo el mensual; el año adelantado es una línea.
- **Cifras que cuentan los datos de prueba** en tarjetas, bullets o pies de foto — incluidas las escritas con letra.
- **Cifras de infraestructura** (tablas, endpoints, funciones) como valor. Al cliente no le vendes tablas.
- **Ligas de acceso o contraseñas en el PDF.** Envejecen y el documento acaba mintiendo.
- **Cambiar una cifra sin barrer sus repeticiones.** Las horas viven en cuatro lugares; el esquema de pago en dos; la mensualidad alimenta toda la tabla de penalización.

- **Exponer defectos del propio sistema en el documento de venta.** Los pain points del One-Pager describen la realidad del cliente ANTES de la plataforma, no fixes hechos sobre tu propio código. Ver regla crítica en sección 3 del documento.
- **Mezclar el changelog del producto con la cotización.** El cliente que firma no quiere leer "v1.2 arregló X, v1.3 mejoró Y". Quiere leer "esto resuelve tu problema operativo Z". El changelog va en una página interna del producto (ej. `/changelog`), no en el PDF de venta.
- **Listar "limpieza de warnings", "fix de bug", "refactor" como entregables.** Si vas a presentar mejoras hechas, frasealas en términos de outcome para el cliente, no de actividad técnica del proveedor.
- **Nombrar el motor en vez del resultado.** Escribir "integración con GPT-4", "usa Claude" o "flujos de n8n" ata al proveedor a una implementación y pone al cliente a comparar stacks en vez de resultados. Se describe lo que el sistema hace solo; cómo lo hace es asunto del proveedor.
- **Adornar con "inteligente" o "automático" un módulo que no automatiza nada.** Es la misma falta que "IA incluida", con otro disfraz. Si no puedes contestar "¿qué hace el sistema solo, que antes hacía una persona?", el renglón va sin adjetivo.
- **Prometer KPIs sin mecanismo claro para alcanzarlos.** Si dices "−40% de llamadas al ejecutivo", debe haber una funcionalidad concreta en el alcance que justifique esa reducción. Si no, baja el KPI o quítalo.
- **Copiar renglones de una cotización anterior sin verificarlos contra ESTA plataforma.** Así fue como "IA incluida" acabó en una propuesta de un sistema que no llama a ningún modelo. Las filas de "qué incluye la suscripción" son las que más se arrastran de un documento a otro; revísalas una por una.
- **Meter en una mensualidad fija cualquier cosa que se pague por uso.** Ver la regla dura arriba. Y si hay que dejarlo fuera, se deja fuera en silencio: el documento describe lo que la plataforma hace, nunca por qué algo no está incluido.

## Cotizaciones en USD con cliente mexicano

Cuando la cotización vaya en dólares (USD) y el cliente sea mexicano:

- **Aclarar moneda explícitamente en cada precio**: "$18,000 USD" no solo "$18,000" — para evitar confusión con MXN.
- **Nota obligatoria sobre IVA y CFDI**: "Precios expresados en USD antes de IVA. Si Grupo X requiere CFDI, se factura en MXN al tipo de cambio Banxico (DOF) del día de emisión + IVA 16%. Si el pago se realiza a cuenta extranjera en USD, no se emite CFDI mexicano."
- **Opción A (sin CFDI)** puede ser cuenta USD (US bank account, Wise, Mercury). **Opción B (con CFDI)** siempre es cuenta MXN de persona moral mexicana.
- **Tabla de penalización**: mantener los montos máximos en la misma moneda de la cotización (USD si es USD), no convertir.
- **Hora adicional**: también en USD con comparativo de mercado en USD (ej. "$50 USD/hora vs $80 USD/hora de mercado para senior comparable").
- **Forma de pago anual**: si es plan anual, ofrecer pago en USD a cuenta extranjera con descuento mantenido. Si requieren CFDI anual, la conversión MXN se hace una sola vez al firmar.

## Notas importantes

- Los montos siempre deben ir antes de IVA con nota explícita ("+ IVA si se requiere factura")
- Incluir vigencia de la cotización (30 días es estándar)
- Si el cliente pidió propiedad del código, el modelo debe garantizarlo desde el día 1, no al final del contrato
- La penalización debe ser justa para ambos: protege al proveedor sin ser abusiva para el cliente
- Siempre recomendar que la cotización se acompañe de un contrato de prestación de servicios formal
- **Control de versiones**: numerar la cotización (1.0, 2.0, 3.0...) y mencionar la versión en la portada. Si el cliente pide cambios, sube de versión.
- **Datos bancarios**: nunca ocultar la opción sin CFDI si el cliente la pide, pero siempre ofrecer ambas.
- **Screenshots reales > mockups > placeholders**: la credibilidad del documento depende en gran medida de mostrar la plataforma real en funcionamiento.

## Análisis dual (si el usuario lo solicita)

Cuando el usuario pida revisar la cotización "como cliente y como proveedor":

**Perspectiva del cliente — buscar:**
- Ambigüedades que puedan usarse en su contra
- Compromisos del proveedor sin consecuencias por incumplimiento
- Costos ocultos o no claros
- Dependencias que limiten su libertad de salida
- Falta de mecanismos de verificación (horas, calidad, SLA)

**Perspectiva del proveedor — buscar:**
- Riesgos de no recuperar inversión
- Scope creep potencial (horas de mejora abiertas a interpretación)
- Falta de protección ante impago (verificar cláusula de mora)
- Vulnerabilidades de propiedad intelectual (verificar anti-reventa)
- Compromisos operativos insostenibles (SLA muy agresivo sin equipo)
