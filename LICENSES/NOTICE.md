# Avisos de terceros

## mGBA (motor de emulación)
- Proyecto: https://github.com/mgba-emu/mgba — Copyright © Jeffrey Pfau y colaboradores.
- Licencia: Mozilla Public License 2.0 (MPL-2.0), texto completo en `MPL-2.0.txt`.
- `core/mgba.wasm` es mGBA compilado a WebAssembly.

## @wasm-gaming/mgba-wasm 0.1.1 (compilación web de mGBA)
- Proyecto: https://github.com/wasm-gaming/mGBA-wasm — Licencia MPL-2.0.
- Archivos usados: `core/mgba.js`, `core/mgba.wasm`, `core/mgba.config.js`, `core/mgba.options.js`,
  `core/mgba.manifest.js`, `core/mgba.zip.js`, `core/mgba.sdk.js`.
- **Modificados para Ranura** (siguen bajo MPL-2.0; su código fuente es el propio archivo):
  - `core/mgba.sdk.js`: carga del procesador de audio desde un archivo propio, modo sin audio,
    entrada táctil, modo turbo, límite de velocidad por reloj real y lectura/escritura de la partida (SRAM).
  - `core/mgba-sink.js`: el procesador de audio, extraído sin cambios del SDK original.
- El código fuente de la parte en WebAssembly está en los repositorios anteriores.

## Tipografías
- Chakra Petch, Rubik e IBM Plex Mono, servidas por Google Fonts bajo SIL Open Font License 1.1.

## Código propio de Ranura
- `index.html`, `sw.js` y los cartuchos de prueba incluidos (homebrew escrito para Ranura) no contienen
  código ni recursos de juegos comerciales. Ranura no incluye juegos.
