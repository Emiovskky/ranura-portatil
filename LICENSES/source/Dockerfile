# Builds Ranura's mGBA core: upstream mGBA (pinned) + the wasm-gaming shim + Ranura's cheat/memory exports.
FROM emscripten/emsdk:7.0.0
RUN apt-get update -qq && apt-get install -y -qq cmake git > /dev/null
ARG MGBA_REF=c034660f007c543233f1cadeb0ca13c71afd8f41
RUN git clone -q https://github.com/mgba-emu/mgba.git /mgba && git -C /mgba checkout -q ${MGBA_REF}
RUN emcmake cmake -S /mgba -B /build \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_C_FLAGS="-O3 -D_GNU_SOURCE -DDISABLE_THREADING" \
    -DBUILD_STATIC=ON -DBUILD_SHARED=OFF -DDISABLE_FRONTENDS=ON -DDISABLE_DEPS=ON \
    -DBUILD_QT=OFF -DBUILD_SDL=OFF -DBUILD_LIBRETRO=OFF -DBUILD_TEST=OFF -DBUILD_SUITE=OFF \
    -DBUILD_GL=OFF -DBUILD_GLES2=OFF -DBUILD_GLES3=OFF -DUSE_PTHREADS=OFF -DUSE_ZLIB=OFF \
    -DUSE_MINIZIP=OFF -DUSE_LIBZIP=OFF -DUSE_PNG=OFF -DUSE_SQLITE3=OFF -DUSE_FFMPEG=OFF \
    -DUSE_ELF=OFF -DUSE_LZMA=OFF -DUSE_LUA=OFF -DUSE_JSON_C=OFF -DUSE_FREETYPE=OFF \
    -DUSE_EDITLINE=OFF -DUSE_DISCORD_RPC=OFF -DUSE_EPOXY=OFF -DENABLE_SCRIPTING=OFF \
    -DENABLE_DEBUGGERS=OFF > /dev/null \
 && cmake --build /build --target mgba -j "$(nproc)" > /dev/null
COPY mgba_shim.c /shim/mgba_shim.c
RUN mkdir -p /out && DEFS="$(grep -m1 '^C_DEFINES' /build/CMakeFiles/mgba.dir/flags.make | cut -d= -f2- | tr ' ' '\n' | grep '^-D' | tr '\n' ' ')" \
 && emcc -O3 -std=gnu11 -I/mgba/include -I/build/include -D_GNU_SOURCE -DDISABLE_THREADING -DNDEBUG $DEFS \
    -Wno-deprecated-declarations /shim/mgba_shim.c "$(find /build -name libmgba.a -print -quit)" \
    -O3 --no-entry -sMODULARIZE=1 -sEXPORT_NAME=createMgbaModule -sENVIRONMENT=web,node \
    -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=67108864 -sMAXIMUM_MEMORY=536870912 -sSTACK_SIZE=1048576 \
    -sEXPORTED_FUNCTIONS=_malloc,_free \
    -sEXPORTED_RUNTIME_METHODS=HEAPU8,HEAP16,HEAPU32,UTF8ToString,stringToUTF8,lengthBytesUTF8 \
    -o /out/mgba.js \
 && git -C /mgba rev-parse HEAD > /out/MGBA_REF && ls -l /out
