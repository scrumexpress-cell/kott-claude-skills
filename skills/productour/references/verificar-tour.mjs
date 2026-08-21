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
 * USO:
 *   node verificar-tour.mjs <url-base> <ruta-al-tours-index.ts> [--pass clave]
 *
 * Ejemplo:
 *   node verificar-tour.mjs https://cucina-capitale.pages.dev ./src/tours/index.ts
 */

import { chromium } from 'playwright'
import fs from 'node:fs'

const [BASE, ARCHIVO_TOURS] = process.argv.slice(2)
const idxPass = process.argv.indexOf('--pass')
const PASSCODE = idxPass > -1 ? process.argv[idxPass + 1] : null

if (!BASE || !ARCHIVO_TOURS) {
  console.error('uso: node verificar-tour.mjs <url-base> <src/tours/index.ts> [--pass clave]')
  process.exit(1)
}

/**
 * Se leen los tours del ARCHIVO FUENTE, no de la aplicación compilada, para poder
 * verificar cambios antes de desplegarlos. Es un parseo tosco a propósito: importar
 * TypeScript desde Node exigiría un transpilador y aquí solo hacen falta los
 * selectores y las rutas.
 */
function leerTours(ruta) {
  const dir = ruta.replace(/[^/\\]+$/, '')
  const archivos = fs.readdirSync(dir).filter((f) => /\.ts$/.test(f) && !/tipos|useTour|index/.test(f))
  const tours = []
  for (const f of archivos) {
    const txt = fs.readFileSync(dir + f, 'utf8')
    const nombre = (txt.match(/nombre:\s*['"`](.+?)['"`]/) || [])[1] ?? f
    const pasos = []
    // Cada paso puede traer ruta y/o elemento; se capturan en el orden del archivo.
    const bloques = txt.split(/\{\s*$/m)
    for (const b of bloques) {
      const ruta = (b.match(/ruta:\s*['"`](.+?)['"`]/) || [])[1]
      const elemento = (b.match(/elemento:\s*['"`](.+?)['"`]/) || [])[1]
      const titulo = (b.match(/titulo:\s*['"`](.+?)['"`]/) || [])[1]
      if (elemento || ruta) pasos.push({ ruta, elemento, titulo })
    }
    if (pasos.length) tours.push({ archivo: f, nombre, pasos })
  }
  return tours
}

const tours = leerTours(ARCHIVO_TOURS)
if (!tours.length) {
  console.error('No se encontró ningún tour en', ARCHIVO_TOURS)
  process.exit(1)
}

const navegador = await chromium.launch()
const ctx = await navegador.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

// Se siembra el acceso antes de navegar. Cada plataforma guarda su passcode en
// una llave distinta; se prueban las conocidas, que es más rápido que abrir el
// portón a mano y funciona igual.
await page.goto(BASE, { waitUntil: 'domcontentloaded' })
if (PASSCODE) {
  await page.evaluate((clave) => {
    for (const k of ['cucina.acceso', 'cocoa.passcode_ok', 'acceso', 'demo.acceso']) {
      localStorage.setItem(k, k.includes('passcode') ? '1' : 'ok')
    }
    localStorage.setItem('passcode', clave)
  }, PASSCODE)
}

let fallas = 0
let total = 0

for (const t of tours) {
  console.log(`\n── ${t.nombre}  (${t.archivo})`)
  let rutaActual = null

  for (const [i, p] of t.pasos.entries()) {
    total++
    const etiqueta = `  ${String(i + 1).padStart(2)}. ${(p.titulo ?? p.elemento ?? '').slice(0, 48).padEnd(50)}`

    if (p.ruta && p.ruta !== rutaActual) {
      await page.goto(BASE.replace(/\/$/, '') + p.ruta, { waitUntil: 'networkidle' }).catch(() => {})
      await page.waitForTimeout(1200)
      rutaActual = p.ruta
    }

    if (!p.elemento) {
      console.log(etiqueta + 'sin elemento (paso de intro)')
      continue
    }

    // Visible, no solo presente: un elemento oculto existe y no se puede resaltar.
    const visible = await page
      .locator(p.elemento)
      .first()
      .isVisible({ timeout: 4000 })
      .catch(() => false)

    if (visible) {
      console.log(etiqueta + 'OK')
    } else {
      const existe = (await page.locator(p.elemento).count()) > 0
      console.log(etiqueta + (existe ? 'EXISTE PERO NO SE VE' : 'NO ENCONTRADO') + `  ${p.elemento}`)
      fallas++
    }
  }
}

await navegador.close()

console.log(`\n${total - fallas}/${total} pasos resaltan correctamente.`)
if (fallas) {
  console.log(`${fallas} paso(s) rotos: el tour NO está listo para presentarse.`)
  process.exit(1)
}
