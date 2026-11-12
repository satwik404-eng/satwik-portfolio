import { gsap } from 'gsap';
import design from '../design-dna.json';

const beats = design.design_system.motion.storyboard;

export async function startHeroMotion(root: HTMLElement, signal: AbortSignal, complete: () => void) {
  const image = root.querySelector<HTMLImageElement>('.hero-portrait');
  const title = root.querySelector<HTMLElement>('.hero-title');
  const composition = root.querySelector<HTMLElement>('.hero-composition');
  if (!image || !title || !composition) return;

  const hints = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (hints.connection?.saveData || (hints.deviceMemory ?? 4) <= 2 ||
      (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2)) return;

  let scene: ReturnType<typeof import('./hero-scene').createHeroScene>;
  try {
    const [{ createHeroScene }] = await Promise.all([import('./hero-scene'), image.decode(), document.fonts.ready]);
    if (signal.aborted) return;
    scene = createHeroScene(root, image, complete);
  } catch {
    return;
  }
  if (!scene) return;

  root.dataset.render = 'webgl';
  root.dataset.phase = 'origin';
  const nav = document.querySelectorAll<HTMLElement>('.site-header .brand, .site-header .nav');
  const titleTravel = () => root.clientHeight * 0.49 - composition.offsetTop - title.offsetHeight / 2;

  const context = gsap.context(() => {
    const clock = { time: 0 };
    const timeline = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onUpdate: () => scene.render(clock.time),
      onComplete: complete,
    });
    timeline.to(clock, { time: beats.finish, duration: beats.finish, ease: 'none' }, 0);
    for (const phase of ['assembly', 'name', 'title', 'particles', 'portrait'] as const) {
      timeline.call(() => { root.dataset.phase = phase; }, [], beats[phase]);
    }

    timeline.fromTo('.origin', { opacity: 0, scale: 0.16 }, { opacity: 1, scale: 1, duration: 0.29 }, beats.origin);
    timeline.to('.origin', { scale: 0.77, duration: 0.5 }, 0.64);
    timeline.to('.origin', { opacity: 0, scale: 0.45, duration: 0.38 }, 2.04);
    timeline.to('.hero-halo', { opacity: 0.7, duration: 1.15 }, 0.13);
    timeline.to('.hero-halo', { opacity: 1, duration: 1.2 }, 3.1);

    timeline.fromTo('.hero-title-position', { y: titleTravel, rotateX: -1.5 }, {
      y: 0, rotateX: 0, duration: beats.titleLowered - beats.title, ease: 'power3.inOut',
    }, beats.title);
    timeline.fromTo('.hero-title', { opacity: 0 }, { opacity: 1, duration: 0.38 }, beats.title - 0.07);
    timeline.fromTo('.hero-details', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45 }, 3.74);
    timeline.fromTo('.hero-actions', { opacity: 0 }, { opacity: 1, duration: 0.48 }, beats.navigation);
    timeline.fromTo(nav, { opacity: 0 }, { opacity: 1, duration: 0.44 }, beats.navigation);
    timeline.fromTo('.hero-portrait', { opacity: 0 }, { opacity: 0.26, duration: 0.84, ease: 'power2.out' }, 5.24);
    timeline.fromTo('.hero-stipple', { opacity: 0 }, { opacity: 0.94, duration: 0.82, ease: 'power2.out' }, 5.85);
  }, root);

  return () => {
    context.revert();
    scene.dispose();
  };
}
