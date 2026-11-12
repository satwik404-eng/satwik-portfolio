import {
  Color, DataTexture, DirectionalLight, EquirectangularReflectionMapping, ExtrudeGeometry, Group, MathUtils,
  Mesh, MeshStandardMaterial, OrthographicCamera, PerspectiveCamera, RGBAFormat, Scene, ShapePath,
  SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
} from 'three';
import glyphs from './glyphs.json';
import design from '../design-dna.json';
import { portraitPoints, randomSource } from './portrait-points';

export const NAME = 'SATWIK';
export const TITLE = 'PORTFOLIO';
type Glyph = keyof typeof glyphs;
type Letter = ReturnType<typeof makeLetter>;

const clamp = (value: number) => MathUtils.clamp(value, 0, 1);
const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };
const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 3);
const lerp = MathUtils.lerp;
const beats = design.design_system.motion.storyboard;

function makeLetter(glyph: Glyph, materials: MeshStandardMaterial[], rand: () => number) {
  const path = new ShapePath();
  for (const [command, ...coordinates] of glyphs[glyph]) {
    const [x, y, a, b, c, d] = coordinates as number[];
    switch (command) {
      case 'm': path.moveTo(x, y); break;
      case 'l': path.lineTo(x, y); break;
      case 'q': path.quadraticCurveTo(x, y, a, b); break;
      case 'c': path.bezierCurveTo(x, y, a, b, c, d); break;
      case 'z': path.currentPath?.closePath(); break;
    }
  }
  const geometry = new ExtrudeGeometry(path.toShapes(false), {
    depth: 0.20, bevelEnabled: true, bevelSize: 0.023, bevelThickness: 0.026, bevelSegments: 3, curveSegments: 8,
  });
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());
  geometry.translate(-center.x, -center.y, -center.z);
  const mesh = new Mesh(geometry, materials);
  const variation = [rand(), rand(), rand(), rand()];
  return { mesh, size, variation, target: new Vector3() };
}

function reflectionTexture() {
  const width = 128;
  const height = 64;
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const vertical = y / height;
      const horizontal = x / width;
      const upper = Math.exp(-Math.pow((vertical - 0.25) / 0.11, 2));
      const rim = Math.exp(-Math.pow((vertical - 0.56) / 0.027, 2));
      const lower = Math.exp(-Math.pow((vertical - 0.81) / 0.17, 2));
      const panel = Math.exp(-Math.pow((horizontal - 0.26) / 0.16, 2));
      const value = Math.min(245, 18 + upper * (125 + panel * 120) + rim * 178 + lower * 60);
      const i = (x + y * width) * 4;
      data.set([value * 0.92, value * 0.96, value, 255], i);
    }
  }
  const texture = new DataTexture(data, width, height, RGBAFormat);
  texture.mapping = EquirectangularReflectionMapping;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createHeroScene(root: HTMLElement, image: HTMLImageElement, onLoss: () => void) {
  const mount = root.querySelector<HTMLElement>('.hero-render');
  const title = root.querySelector<HTMLElement>('.hero-title');
  if (!mount || !title) return null;

  const mobile = matchMedia('(max-width: 760px)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.65);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', { alpha: true, antialias: !mobile });
  if (!context) return null;
  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: !mobile });
  const letters = new Scene();
  const portrait = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 55);
  const portraitCamera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 240);
  const nameGroup = new Group();
  const titleGroup = new Group();
  const rand = randomSource(2077);
  const pointer = new Vector2();
  const currentPointer = new Vector2();
  const reflection = reflectionTexture();
  const materials = [
    new MeshStandardMaterial({ color: '#e5e9f0', metalness: 0.78, roughness: 0.25, envMapIntensity: 1.6 }),
    new MeshStandardMaterial({ color: '#aab4c5', metalness: 0.88, roughness: 0.33, envMapIntensity: 1.1 }),
  ];
  materials[0].onBeforeCompile = (shader) => {
    shader.vertexShader = 'varying float vLetterHeight;\n' + shader.vertexShader.replace(
      '#include <begin_vertex>', '#include <begin_vertex>\nvLetterHeight = position.y;'
    );
    shader.fragmentShader = 'varying float vLetterHeight;\n' + shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.64,0.70,0.80) * smoothstep(-0.46,0.44,vLetterHeight) * 0.55;'
    );
  };
  const names: Letter[] = [];
  const titles: Letter[] = [];
  let points: ReturnType<typeof portraitPoints> = null;
  let observer: ResizeObserver | undefined;
  let viewWidth = 0;
  let viewHeight = 0;
  let nameScale = 1;
  let titleScale = 1;

  const loss = () => onLoss();
  const move = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const rect = root.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width - 0.5, 0.5 - (event.clientY - rect.top) / rect.height);
  };
  const reset = () => pointer.set(0, 0);

  function dispose() {
    observer?.disconnect();
    root.removeEventListener('pointermove', move);
    root.removeEventListener('pointerleave', reset);
    renderer.domElement.removeEventListener('webglcontextlost', loss);
    renderer.domElement.remove();
    for (const { mesh } of [...names, ...titles]) mesh.geometry.dispose();
    for (const material of materials) material.dispose();
    points?.geometry.dispose();
    points?.material.dispose();
    reflection.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }

  function resize() {
    if (!mount || !title) return;
    const area = mount.getBoundingClientRect();
    if (!area.width || !area.height) return;
    renderer.setSize(area.width, area.height, false);
    camera.aspect = area.width / area.height;
    camera.updateProjectionMatrix();
    viewHeight = 2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * 9;
    viewWidth = viewHeight * camera.aspect;
    portraitCamera.left = -area.width / 2;
    portraitCamera.right = area.width / 2;
    portraitCamera.top = area.height / 2;
    portraitCamera.bottom = -area.height / 2;
    portraitCamera.updateProjectionMatrix();

    const width = names.reduce((total, letter) => total + letter.size.x + 0.045, -0.045);
    nameScale = Math.min(viewWidth * 0.56 / width, 1.42);
    let x = -width * nameScale / 2;
    for (const letter of names) {
      letter.target.set(x + letter.size.x * nameScale / 2, viewHeight * 0.01, 0);
      x += (letter.size.x + 0.045) * nameScale;
    }

    const glyphElements = title.querySelectorAll('span');
    const pixelsToWorld = viewHeight / area.height;
    const fontSize = parseFloat(getComputedStyle(title).fontSize);
    titleScale = fontSize * 0.73 * pixelsToWorld;
    glyphElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      titles[index].target.set(
        (rect.left - area.left + rect.width / 2 - area.width / 2) * pixelsToWorld,
        viewHeight * 0.01,
        0,
      );
    });

    if (points) {
      const photo = image.getBoundingClientRect();
      points.position.set(photo.left - area.left + (photo.width - area.width) / 2, (area.height - photo.height) / 2 - (photo.top - area.top), 0);
      points.scale.set(photo.width, photo.height, 19);
    }
  }

  try {
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(new Color('#000000'), 0);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.autoClear = false;
    letters.environment = reflection;
    const key = new DirectionalLight('#f1f6ff', 2.1);
    key.position.set(2, 4, 5);
    const rim = new DirectionalLight('#a5b9dd', 1.35);
    rim.position.set(-4, 1, -2);
    letters.add(key, rim, nameGroup, titleGroup);
    camera.position.z = 9;
    portraitCamera.position.z = 110;

    for (const glyph of NAME) names.push(makeLetter(glyph as Glyph, materials, rand));
    for (const glyph of TITLE) titles.push(makeLetter(glyph as Glyph, materials, rand));
    names.forEach(({ mesh }) => nameGroup.add(mesh));
    titles.forEach(({ mesh }) => titleGroup.add(mesh));

    points = portraitPoints(image, mobile ? 10500 : 27600, dpr);
    if (points) portrait.add(points);
    mount.append(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', loss, { once: true });
    root.addEventListener('pointermove', move, { passive: true });
    root.addEventListener('pointerleave', reset);
    resize();
    observer = new ResizeObserver(resize);
    observer.observe(mount);
    if (document.fonts) void document.fonts.ready.then(() => { if (renderer.domElement.isConnected) resize(); });
  } catch (error) {
    dispose();
    throw error;
  }

  function updateName(time: number) {
    for (const [index, { mesh, variation, target }] of names.entries()) {
      const [a, b, c] = variation;
      const start = index === 0 ? beats.assembly : 1.24 + (index - 1) * 0.12;
      const enter = clamp((time - start) / (index === 0 ? 0.82 : 0.61));
      const land = easeOut(enter);
      const exit = smooth((time - beats.titleStart - index * 0.078) / 0.33);
      const arc = Math.sin(enter * Math.PI);
      const side = index % 2 === 0 ? -1 : 1;
      mesh.visible = enter > 0 && exit < 1;
      mesh.position.set(
        lerp(viewWidth * (a - 0.5) * 0.25, target.x, land) + arc * side * viewWidth * 0.035,
        lerp(viewHeight * (0.48 - b * 0.2), target.y, land) - arc * viewHeight * 0.06 + exit * 0.45,
        lerp(-5 + c * 5, 0, land) + arc * 0.44 - exit * 1.8,
      );
      mesh.rotation.set((a - 0.4) * 8 * (1 - land) + exit * 1.1, side * (3 + c * 3.1) * (1 - land) + exit * side * 1.55, (b - 0.5) * 3.5 * (1 - land));
      mesh.scale.setScalar(nameScale * (0.26 + 0.74 * land) * (1 - exit * 0.85));
    }
  }

  function updateTitle(time: number) {
    for (const [index, { mesh, target, variation }] of titles.entries()) {
      const [a, b, c] = variation;
      const start = beats.titleStart + index * 0.052;
      const enter = clamp((time - start) / 0.48);
      const land = easeOut(enter);
      const arc = Math.sin(Math.PI * enter) * (1 - enter);
      const replaced = names[Math.min(index, names.length - 1)].target;
      const side = index % 2 === 0 ? 1 : -1;
      mesh.visible = enter > 0;
      mesh.position.set(
        lerp(replaced.x + (a - 0.5) * 0.55, target.x, land),
        lerp(target.y + side * (0.21 + b * 0.36), target.y, land) + arc * side * 0.31,
        lerp(-1.8 - c * 1.2, 0, land) + arc * 0.65,
      );
      mesh.rotation.set((a - 0.5) * 4.7 * (1 - land), side * (2.2 + c * 2.9) * (1 - land), (b - 0.5) * 2 * (1 - land));
      mesh.scale.setScalar(titleScale * (0.44 + land * 0.56));
    }
  }

  function render(time: number) {
    if (time < beats.assembly - 0.02) return;
    renderer.clear();
    if (time < beats.title + 0.42) {
      nameGroup.visible = time < beats.title + 0.1;
      titleGroup.visible = time >= beats.titleStart;
      updateName(time);
      updateTitle(time);
      const opacity = 1 - smooth((time - beats.title + 0.07) / 0.49);
      titleGroup.position.y = -viewHeight * 0.14 * smooth((time - beats.title) / 0.78);
      materials.forEach((material) => {
        material.transparent = opacity < 1;
        material.opacity = opacity;
      });
      camera.position.x = Math.sin(time * 1.5) * 0.23 * (1 - smooth((time - 2.66) / 0.54));
      camera.lookAt(0, 0, 0);
      renderer.render(letters, camera);
    }

    if (points && time > beats.particles) {
      const uniforms = points.material.uniforms;
      currentPointer.lerp(pointer, 0.055);
      uniforms.uPointer.value.copy(currentPointer);
      uniforms.uTime.value = time;
      uniforms.uProgress.value = clamp((time - beats.particles) / 1.42);
      uniforms.uOpacity.value = smooth((time - beats.particles) / 0.29) * (1 - smooth((time - 6.02) / 0.85));
      renderer.render(portrait, portraitCamera);
    }
  }

  return { dispose, render };
}
