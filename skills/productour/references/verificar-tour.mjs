/**
 * Verifica que un tour de verdad funciona sobre la plataforma VIVA.
 *
 * POR QUÉ EXISTE: un tour se rompe en silencio. Si un selector deja de encontrar
 * su elemento —porque alguien reacomodó el diseño, porque el módulo cambió de
 * ruta, o porque la pantalla sale vacía— driver.js no lanza error: simplemente no
 * resalta nada. Y eso se descubre presentando, enfrente del cliente, que es el
 * peor lugar posible.
 *
 * Este script recorre los pasos uno por uno, navega a su ruta, y comprueba que el
 * elemento existe y es VISIBLE (existir no basta: un elemento con display:none o
 * dentro de una pestaña cerrada existe y no se puede resaltar).
 *
 * REGLA DE HONESTIDAD DEL REPORTE: lo que no se pudo verificar se dice. Un paso
 * cuya ruta no se resolvió NO se comprueba contra la pantalla del paso anterior:
 * eso produce fallas falsas (y las produjo). Se marca aparte y se cuenta aparte.
 *
 * USO:
 *   node verificar-tour.mjs <url-base> <dir-o-archivo-de-tours> [opciones]
 *
 * Opciones:
 *   --pass <clave>              portón de contraseña única (PasscodeGate)
 *   --correo <x> --clave <y>    login de usuario/contraseña
 *   --ruta-login <ruta>         pantalla de login (por omisión /auth)
 *   --listar                    imprime lo que el parser ve y termina (sin navegador)
 *
 * Ejemplos:
 *   node verificar-tour.mjs https://cucina-capitale.pages.dev ./src/tours --pass cucina2026
 *   node verificar-tour.mjs https://lpet.lovable.app ./src/tours --correo demo@lpet.mx --clave ***
 *
 * Necesita playwright. Lo busca primero junto a este script y, si no está —el
 * caso normal, porque este archivo vive en ~/.claude/skills— lo resuelve desde el
 * node_modules del proyecto que se está verificando.
 */

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const [BASE_CRUDA, TOURS_ARG] = process.argv.slice(2)
const bandera = (n) => {
  const i = process.argv.indexOf(n)
  return i > -1 ? process.argv[i + 1] : null
}
const PASSCODE = bandera('--pass')
const CORREO = bandera('--correo')
const CLAVE = bandera('--clave')
const RUTA_LOGIN = bandera('--ruta-login') ?? '/auth'

if (!BASE_CRUDA || !TOURS_ARG) {
  console.error(
    'uso: node verificar-tour.mjs <url-base> <dir-o-archivo-de-tours> [--pass clave] [--correo x --clave y] [--ruta-login /auth]',
  )
  process.exit(1)
}

const BASE = BASE_CRUDA.replace(/\/$/, '')
const DIR_TOURS = fs.statSync(TOURS_ARG).isDirectory() ? TOURS_ARG : path.dirname(TOURS_ARG)

/* ────────────────────────────────────────────────────────────── el parseo ── */

/**
 * Se leen los tours del ARCHIVO FUENTE, no de la aplicación compilada, para poder
 * verificar cambios antes de desplegarlos. Importar TypeScript desde Node exigiría
 * un transpilador y aquí solo hacen falta selectores y rutas — pero el parseo NO
 * puede ser tosco: un paso que el parser no ve es un paso que nadie verificó y que
 * el reporte da por bueno, que es exactamente el fallo que este archivo arregla.
 */

/** Devuelve el índice justo después de la cadena que abre en `i`, respetando `\`. */
function finDeCadena(txt, i) {
  const comilla = txt[i]
  for (let j = i + 1; j < txt.length; j++) {
    if (txt[j] === '\\') {
      j++
      continue
    }
    if (txt[j] === comilla) return j + 1
  }
  return txt.length
}

/**
 * Índice del cierre que hace juego con el `{` o `[` que está en `inicio`.
 * Salta cadenas y comentarios: una llave dentro de un texto en español («{ }» o
 * un `//` de una URL) no debe contar como estructura.
 */
function cierreDe(txt, inicio) {
  const abre = txt[inicio]
  const cierra = abre === '{' ? '}' : ']'
  let nivel = 0
  let i = inicio
  while (i < txt.length) {
    const c = txt[i]
    if (c === '"' || c === "'" || c === '`') {
      i = finDeCadena(txt, i)
      continue
    }
    if (c === '/' && txt[i + 1] === '/') {
      const fin = txt.indexOf('\n', i)
      i = fin < 0 ? txt.length : fin + 1
      continue
    }
    if (c === '/' && txt[i + 1] === '*') {
      const fin = txt.indexOf('*/', i + 2)
      i = fin < 0 ? txt.length : fin + 2
      continue
    }
    if (c === abre) nivel++
    else if (c === cierra && --nivel === 0) return i
    i++
  }
  return -1
}

/** Los objetos de primer nivel dentro del array que abre en `inicio`. */
function objetosDelArray(txt, inicio) {
  const fin = cierreDe(txt, inicio)
  if (fin < 0) return []
  const objetos = []
  let i = inicio + 1
  while (i < fin) {
    const c = txt[i]
    if (c === '"' || c === "'" || c === '`') {
      i = finDeCadena(txt, i)
      continue
    }
    if (c === '/' && txt[i + 1] === '/') {
      const n = txt.indexOf('\n', i)
      i = n < 0 ? fin : n + 1
      continue
    }
    if (c === '/' && txt[i + 1] === '*') {
      const n = txt.indexOf('*/', i + 2)
      i = n < 0 ? fin : n + 2
      continue
    }
    if (c === '{') {
      const cierre = cierreDe(txt, i)
      if (cierre < 0) break
      objetos.push(txt.slice(i, cierre + 1))
      i = cierre + 1
      continue
    }
    i++
  }
  return objetos
}

/**
 * Lee `campo: 'valor'` emparejando la comilla de apertura con la MISMA de cierre.
 *
 * POR QUÉ BACKREFERENCE Y NO CLASE DE CARACTERES: la versión anterior usaba
 * /elemento:\s*['"`](.+?)['"`]/, que cierra en la primera comilla de CUALQUIER
 * tipo. Como el skill obliga a que todo selector sea [data-tour="algo"], el valor
 * '[data-tour="crm-tablero"]' se cortaba en la comilla doble interna y quedaba
 * como `[data-tour=`, con lo que Playwright tronaba con «Unexpected token "" while
 * parsing css selector» en el PRIMER paso de cualquier tour bien construido.
 * Con \1 la comilla de cierre tiene que ser la misma que abrió, y las internas
 * son texto. El (?:\\.|(?!\1).) además respeta comillas escapadas dentro del valor.
 */
function leerCampo(bloque, campo) {
  const re = new RegExp(`${campo}\\s*:\\s*(['"\`])((?:\\\\.|(?!\\1)[\\s\\S])*)\\1`)
  const m = bloque.match(re)
  return m ? m[2].replace(/\\(['"`\\])/g, '$1') : undefined
}

/** `campo: IDENTIFICADOR` — el valor es una constante, no un literal. */
function leerIdentificador(bloque, campo) {
  const m = bloque.match(new RegExp(`${campo}\\s*:\\s*([A-Za-z_$][\\w$]*)\\s*(?=[,}\\n])`))
  return m ? m[1] : undefined
}

function leerTours(dir) {
  const omitir = new Set(['tipos.ts', 'useTour.ts', 'index.ts'])
  const archivos = fs
    .readdirSync(dir)
    .filter((f) => /\.(ts|tsx|js|mjs)$/.test(f) && !omitir.has(f))
    .sort()

  // Las constantes de ruta pueden vivir en otro archivo del directorio y llegar
  // importadas, así que primero se junta el mapa completo y luego se resuelve.
  const constantes = {}
  const textos = new Map()
  for (const f of archivos) {
    const txt = fs.readFileSync(path.join(dir, f), 'utf8')
    textos.set(f, txt)
    for (const m of txt.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(['"`])((?:\\.|(?!\2)[\s\S])*)\2/g)) {
      constantes[m[1]] = m[3].replace(/\\(['"`\\])/g, '$1')
    }
  }

  const tours = []
  for (const [archivo, txt] of textos) {
    // Un archivo puede declarar varios tours (modulos.ts trae once). Agruparlos
    // todos bajo el nombre del primero volvía ilegible el reporte.
    const cabeceras = [...txt.matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)\s*(?::\s*Tour\s*)?=\s*\{/g)]
    const cuerpos = []
    for (const c of cabeceras) {
      const llave = c.index + c[0].length - 1
      const fin = cierreDe(txt, llave)
      if (fin < 0) continue
      const cuerpo = txt.slice(llave, fin + 1)
      if (/\bpasos\s*:\s*\[/.test(cuerpo)) cuerpos.push({ variable: c[1], cuerpo })
    }
    // Red de seguridad: si el archivo declara `pasos:` con otra forma (default
    // export, objeto sin anotar) y ninguna cabecera lo cubrió, se avisa en vez de
    // ignorarlo en silencio.
    const pasosEnArchivo = (txt.match(/\bpasos\s*:\s*\[/g) || []).length
    if (pasosEnArchivo > cuerpos.length) {
      console.warn(
        `  ! ${archivo}: se encontraron ${pasosEnArchivo} listas de pasos y solo ${cuerpos.length} tours exportados. Revisa el archivo a mano.`,
      )
    }

    for (const { variable, cuerpo } of cuerpos) {
      const nombre = leerCampo(cuerpo, 'nombre') ?? variable
      const inicioPasos = cuerpo.search(/\bpasos\s*:\s*\[/)
      const corchete = cuerpo.indexOf('[', inicioPasos)
      const pasos = []
      for (const b of objetosDelArray(cuerpo, corchete)) {
        const titulo = leerCampo(b, 'titulo')
        const elemento = leerCampo(b, 'elemento')
        const rutaLiteral = leerCampo(b, 'ruta')
        const rutaVariable = rutaLiteral === undefined ? leerIdentificador(b, 'ruta') : undefined

        let ruta = rutaLiteral
        let rutaSinResolver = null
        if (rutaVariable !== undefined) {
          // SEGUNDO DEFECTO ARREGLADO: antes solo se leían literales, así que un
          // paso con `ruta: FOLIO_DEMO` se quedaba sin ruta y se verificaba contra
          // la pantalla del paso anterior. En Cucina eso produjo dos «rotos» que
          // en vivo funcionan.
          if (constantes[rutaVariable] !== undefined) ruta = constantes[rutaVariable]
          else rutaSinResolver = rutaVariable
        } else if (ruta !== undefined && ruta.includes('${')) {
          // Plantilla con sustitución: el valor real depende de la ejecución.
          rutaSinResolver = ruta
          ruta = undefined
        }

        if (elemento || ruta || rutaSinResolver) pasos.push({ ruta, rutaSinResolver, elemento, titulo })
      }
      if (pasos.length) tours.push({ archivo, nombre, pasos })
    }
  }
  return tours
}

const tours = leerTours(DIR_TOURS)
if (!tours.length) {
  console.error('No se encontró ningún tour en', DIR_TOURS)
  process.exit(1)
}

// Ver lo que el parser entendió antes de gastar un navegador: si aquí falta un
// paso, el reporte de más abajo lo daría por bueno sin haberlo mirado nunca.
if (process.argv.includes('--listar')) {
  for (const t of tours) {
    console.log(`\n── ${t.nombre}  (${t.archivo})  ${t.pasos.length} pasos`)
    for (const [i, p] of t.pasos.entries()) {
      const ruta = p.rutaSinResolver ? `SIN RESOLVER:${p.rutaSinResolver}` : (p.ruta ?? '(misma pantalla)')
      console.log(`  ${String(i + 1).padStart(2)}. ${(p.elemento ?? '(sin elemento)').padEnd(40)} ${ruta}`)
    }
  }
  console.log(`\n${tours.length} tours · ${tours.reduce((n, t) => n + t.pasos.length, 0)} pasos en total.`)
  process.exit(0)
}

/* ──────────────────────────────────────────────────────────── el navegador ── */

/** Playwright del proyecto verificado: este script vive fuera de todo node_modules. */
async function cargarChromium() {
  const intentos = ['playwright', 'playwright-core']
  // playwright es CommonJS: importado por ruta, Node no siempre expone sus
  // exports con nombre, y `.chromium` llega undefined mientras `.default` sí trae
  // todo. Se prueban los dos antes de darlo por bueno.
  const sacar = (mod) => mod?.chromium ?? mod?.default?.chromium
  for (const paquete of intentos) {
    try {
      const c = sacar(await import(paquete))
      if (c) return c
    } catch {
      /* sigue */
    }
  }
  const req = createRequire(pathToFileURL(path.join(path.resolve(DIR_TOURS), 'resolver.js')))
  for (const paquete of intentos) {
    try {
      const c = sacar(await import(pathToFileURL(req.resolve(paquete)).href))
      if (c) return c
    } catch {
      /* sigue */
    }
  }
  console.error(
    'No se encontró playwright. Instálalo en el proyecto que vas a verificar:\n' +
      '  npm i --no-save playwright && npx playwright install chromium',
  )
  process.exit(1)
}

const chromium = await cargarChromium()
const navegador = await chromium.launch()
const ctx = await navegador.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

const salir = async (codigo) => {
  await navegador.close()
  process.exit(codigo)
}

/** Navega y espera lo razonable. `networkidle` a secas se cuelga en apps con
 *  websocket abierto (Supabase realtime), así que se le pone tope y se sigue. */
async function ir(url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
  await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {})
  await page.waitForTimeout(700)
}

// Entrar. Si no se puede, se dice y se corta: un reporte hecho contra la pantalla
// de acceso diría que TODO está roto, que es peor que no reportar nada.
if (CORREO && CLAVE) {
  await ir(BASE + RUTA_LOGIN)
  await page.fill('input[type="email"]', CORREO).catch(() => {})
  await page.fill('input[type="password"]', CLAVE).catch(() => {})
  await page.click('button[type="submit"]').catch(() => {})
  await page.waitForTimeout(3000)
  if (page.url().includes(RUTA_LOGIN)) {
    console.error(`No se pudo entrar con ${CORREO}. Sin sesión todas las rutas rebotan a ${RUTA_LOGIN}.`)
    await salir(1)
  }
} else {
  await ir(BASE)
}

// El portón de contraseña única se pasa TECLEÁNDOLA, no sembrando la llave de
// localStorage a mano: sembrarla entra aunque la contraseña sea la equivocada, y
// entonces el script deja de avisar el día que la cambien.
if (PASSCODE) {
  const campo = page.locator('input[type="password"]').first()
  if (await campo.isVisible().catch(() => false)) {
    await campo.fill(PASSCODE)
    await page.click('button[type="submit"]').catch(() => page.keyboard.press('Enter'))
    await page.waitForTimeout(1500)
    if (await page.locator('input[type="password"]').first().isVisible().catch(() => false)) {
      console.error('El portón de acceso sigue ahí: la contraseña de --pass no fue aceptada.')
      await salir(1)
    }
  }
}

/* ─────────────────────────────────────────────────────────────── el paseo ── */

let fallas = 0
let sinVerificar = 0
let total = 0
const rotos = []
const noVerificados = []

for (const t of tours) {
  console.log(`\n── ${t.nombre}  (${t.archivo})`)
  let rutaActual = null

  for (const [i, p] of t.pasos.entries()) {
    total++
    const etiqueta = `  ${String(i + 1).padStart(2)}. ${(p.titulo ?? p.elemento ?? '').slice(0, 48).padEnd(50)}`

    if (p.rutaSinResolver) {
      // No se hereda la ruta del paso anterior: comprobar el elemento en una
      // pantalla que no es la suya inventa fallas que en vivo no existen.
      console.log(etiqueta + `RUTA NO RESUELTA (${p.rutaSinResolver}) — paso sin verificar`)
      noVerificados.push(`${t.nombre} · paso ${i + 1}: ruta '${p.rutaSinResolver}' no se pudo resolver`)
      sinVerificar++
      rutaActual = null
      continue
    }

    if (p.ruta && p.ruta !== rutaActual) {
      await ir(BASE + p.ruta)
      rutaActual = p.ruta
    } else if (!p.ruta && rutaActual === null) {
      // Sin ruta propia y sin pantalla conocida: se dice, no se adivina.
      console.log(etiqueta + 'SIN PANTALLA CONOCIDA — paso sin verificar')
      noVerificados.push(`${t.nombre} · paso ${i + 1}: no trae ruta y no se sabe en qué pantalla va`)
      sinVerificar++
      continue
    }

    if (!p.elemento) {
      console.log(etiqueta + 'sin elemento (paso de intro)')
      continue
    }

    // Visible, no solo presente: un elemento oculto existe y no se puede resaltar.
    // waitFor y no isVisible() porque isVisible() no espera, y en una SPA que aún
    // está pintando eso reporta roto lo que sí funciona.
    const visible = await page
      .locator(p.elemento)
      .first()
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false)

    if (visible) {
      console.log(etiqueta + 'OK')
    } else {
      const existe = await page
        .locator(p.elemento)
        .count()
        .catch(() => 0)
      const motivo = existe > 0 ? 'EXISTE PERO NO SE VE' : 'NO ENCONTRADO'
      console.log(etiqueta + motivo + `  ${p.elemento}`)
      rotos.push(`${t.nombre} · paso ${i + 1} (${p.titulo ?? ''}): ${motivo} ${p.elemento} en ${rutaActual ?? '?'}`)
      fallas++
    }
  }
}

await navegador.close()

const buenos = total - fallas - sinVerificar
console.log(`\n${buenos}/${total} pasos resaltan correctamente.`)
if (sinVerificar) {
  console.log(`${sinVerificar} paso(s) NO se pudieron verificar (no son fallas, son huecos del reporte):`)
  for (const n of noVerificados) console.log(`   · ${n}`)
}
if (fallas) {
  console.log(`${fallas} paso(s) rotos: el tour NO está listo para presentarse.`)
  for (const r of rotos) console.log(`   · ${r}`)
}
if (fallas || sinVerificar) process.exit(1)
