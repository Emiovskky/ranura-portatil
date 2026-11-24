# Avisos de terceros

## mGBA (motor de emulación)
- Proyecto: https://github.com/mgba-emu/mgba — Copyright © Jeffrey Pfau y colaboradores.
- Licencia: Mozilla Public License 2.0 (MPL-2.0), texto completo en `MPL-2.0.txt`.
- `core/mgba.wasm` y `core/mgba.js` son mGBA (revisión c034660f007c543233f1cadeb0ca13c71afd8f41) compilado a
  WebAssembly por Ranura con Emscripten. La capa de enlace (`mgba_shim.c`, de wasm-gaming, MPL-2.0) está
  **modificada**: añade trucos (el motor de trucos del propio mGBA) y lectura/escritura de memoria. El archivo
  modificado y la receta de compilación están en `LICENSES/source/`.

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

## PS2 muy experimental (`ps2.html`, carpeta `ps2/`)
- **Play!** — https://github.com/jpd002/Play- — licencia BSD 2-Clause (texto en `Play-BSD-2-Clause.txt`).
  `ps2/Play.js` y `ps2/Play.wasm` son la compilación web oficial, sin modificar, descargada de https://playjs.purei.org
  (versión 0.77-17-g1f272327). Incluye bibliotecas de terceros con sus propias licencias (libchdr, zlib, zstd, entre otras).

## Otras consolas y PSP (`consola.html`, `psp.html`, carpeta `psp/ejs/`)
- Núcleos de `@emulatorjs/core-*@4.2.3` sin modificar: fceumm (NES, GPL-2.0), snes9x (SNES, licencia Snes9x:
  uso no comercial), genesis_plus_gx (Mega Drive, licencia propia: uso no comercial), mupen64plus_next y parallel_n64 (N64, GPL-2.0;
  el segundo es el que EmulatorJS usa en Safari de iPhone),
  melonDS (DS, GPL-3.0), pcsx_rearmed (PS1, GPL-2.0). Fuentes: https://github.com/EmulatorJS (un repositorio por núcleo).
  Ranura es un proyecto personal sin fines comerciales.
- `psp/ejs/src/emulator.js` está **modificado por Ranura**: entrega la imagen del juego al sistema de archivos sin
  copiarla de más (menos memoria con discos grandes). El archivo publicado es el propio código fuente.
  Los juegos grandes no pasan por ahí: `consola.html` los monta en el sistema de archivos del motor y los lee por partes.
- **EmulatorJS 4.2.3** — https://github.com/EmulatorJS/EmulatorJS — licencia GPL-3.0 (texto en `GPL-3.0.txt`).
  Archivos de `@emulatorjs/emulatorjs@4.2.3` sin modificar (`loader.js`, `src/`, `compression/`, `localization/`).
- **PPSSPP** (núcleo `ppsspp` de EmulatorJS, `@emulatorjs/core-ppsspp@4.2.3`) — https://github.com/hrydgard/ppsspp —
  licencia GPL-2.0 o posterior. Código fuente del núcleo compilado: https://github.com/EmulatorJS/ppsspp y
  scripts de compilación en https://github.com/EmulatorJS/build. `ppsspp-assets.zip` son los recursos de PPSSPP.
- `compression/libunrar.*` proviene de EmulatorJS (UnRAR, con su propia licencia de uso libre para descompresión).
