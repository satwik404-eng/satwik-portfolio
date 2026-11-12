import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial, Vector2,
} from 'three';

const vertex = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uDpr;
  uniform vec2 uPointer;
  attribute vec3 aScatter;
  attribute vec2 aSpark;
  varying float vLight;
  varying float vOpacity;

  void main() {
    float p = clamp((uProgress - aSpark.x * 0.29) / 0.71, 0.0, 1.0);
    float join = 1.0 - pow(1.0 - p, 3.0);
    vec3 pos = mix(aScatter, position, join);
    float arc = sin(p * 3.14159);
    float phase = aSpark.x * 13.0 + uTime * 1.8;
    pos.x += sin(phase + pos.y * 8.0) * (arc * 0.16 + 0.002);
    pos.y += cos(phase * 0.8 + pos.x * 9.0) * (arc * 0.085 + 0.002);
    pos.xy += uPointer * (0.009 + pos.z * 0.026) * (0.4 + arc);
    pos.xy *= 1.0 + pos.z * 0.16 * (1.0 - join);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uDpr * (0.93 + aSpark.x * 1.24 + arc * 0.65 + max(0.0, pos.z) * 0.8);
    vLight = aSpark.y;
    vOpacity = uOpacity * smoothstep(0.0, 0.12, uProgress + aSpark.x * 0.055);
  }
`;

const fragment = /* glsl */ `
  varying float vLight;
  varying float vOpacity;
  void main() {
    float distanceToCenter = length(gl_PointCoord - 0.5);
    float grain = 1.0 - smoothstep(0.06, 0.49, distanceToCenter);
    vec3 color = mix(vec3(0.51, 0.60, 0.71), vec3(0.96, 0.97, 1.0), vLight);
    gl_FragColor = vec4(color, grain * (0.09 + vLight * 0.66) * vOpacity);
  }
`;

export function randomSource(seed: number) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function portraitPoints(image: HTMLImageElement, count: number, dpr: number) {
  const sample = document.createElement('canvas');
  sample.width = 275;
  sample.height = Math.round(sample.width * image.naturalHeight / image.naturalWidth);
  const context = sample.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  const { width, height } = sample;
  context.drawImage(image, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);
  const rand = randomSource(4219);
  const targets = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const sparks = new Float32Array(count * 2);

  let index = 0;
  for (let attempt = 0; index < count && attempt < count * 55; attempt++) {
    const x = Math.floor(rand() * width);
    const y = Math.floor(rand() * height);
    const pixel = (x + y * width) * 4;
    const alpha = data[pixel + 3] / 255;
    const luminance = (data[pixel] + data[pixel + 1] + data[pixel + 2]) / 765;
    if (rand() > alpha * (0.23 + luminance * 0.77)) continue;

    const pos = index * 3;
    const px = (x + rand()) / width - 0.5;
    const py = 0.5 - (y + rand()) / height;
    targets[pos] = px;
    targets[pos + 1] = py;
    targets[pos + 2] = (luminance - 0.42) * 0.31;

    const angle = rand() * Math.PI * 2;
    const radius = Math.pow(rand(), 0.63) * 0.93;
    scatter[pos] = px * 0.59 + Math.cos(angle) * radius;
    scatter[pos + 1] = py * 0.66 + Math.sin(angle) * radius * 0.7;
    scatter[pos + 2] = (rand() - 0.5) * 2.4;
    sparks[index * 2] = rand();
    sparks[index * 2 + 1] = Math.min(1, luminance * 1.05 + 0.06) * Math.sqrt(alpha);
    index++;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(targets, 3));
  geometry.setAttribute('aScatter', new BufferAttribute(scatter, 3));
  geometry.setAttribute('aSpark', new BufferAttribute(sparks, 2));
  geometry.setDrawRange(0, index);

  const material = new ShaderMaterial({
    uniforms: {
      uProgress: { value: 0 }, uOpacity: { value: 0 }, uDpr: { value: dpr },
      uTime: { value: 0 }, uPointer: { value: new Vector2() },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  return points;
}
