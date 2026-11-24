# Ranura Portátil

Emulador de Game Boy, Game Boy Color y Game Boy Advance para el navegador del iPhone, instalable como app
y con funcionamiento sin conexión. Motor: [mGBA](https://github.com/mgba-emu/mgba) compilado a WebAssembly
(MPL-2.0); avisos y licencias en [`LICENSES/`](LICENSES/).

**No incluye juegos.** Usa copias de cartuchos que tengas. Los cartuchos de prueba integrados son homebrew
escrito para Ranura.

## Instalar en iPhone
1. Abre la página en Safari.
2. Compartir → «Agregar a pantalla de inicio».
3. Abre Ranura desde el icono e inserta un juego `.gba`, `.gbc`, `.gb` o `.zip` desde Archivos.

Tus juegos y partidas se guardan solo en tu dispositivo (IndexedDB). Usa «Respaldar partidas» para
guardar una copia en Archivos o iCloud Drive.

## PSP experimental
`psp.html` carga PPSSPP compilado para la web (EmulatorJS, GPL-3.0; núcleo PPSSPP, GPL-2.0+). Es un
experimento sin probar con juegos comerciales ni en Safari de iPhone; para jugar en serio usa PPSSPP de la
App Store. Avisos y enlaces al código fuente en [`LICENSES/NOTICE.md`](LICENSES/NOTICE.md).

## Más consolas
`consola.html` abre con EmulatorJS los juegos de NES, SNES, Mega Drive, N64, DS, PS1 y PSP que guardes en el
estante. Las de 3D son experimentales. Licencias de cada núcleo en [`LICENSES/NOTICE.md`](LICENSES/NOTICE.md).

## PS2 muy experimental
`ps2.html` usa la compilación web oficial de Play! (BSD 2-Clause). Arranca discos homebrew; con juegos comerciales
va lento, no guarda partidas y no tiene pausa. Licencia en [`LICENSES/Play-BSD-2-Clause.txt`](LICENSES/Play-BSD-2-Clause.txt).
