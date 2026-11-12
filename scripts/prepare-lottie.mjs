import { copyFile, mkdir } from 'node:fs/promises';

const directory = new URL('../public/motion/', import.meta.url);
await mkdir(directory, { recursive: true });
await copyFile(
  new URL('../node_modules/@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm', import.meta.url),
  new URL('dotlottie-player.wasm', directory),
);
