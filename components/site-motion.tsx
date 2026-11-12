'use client';

import { useEffect } from 'react';

export function SiteMotion() {
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let dispose: (() => void) | undefined;
    let generation = 0;

    async function update() {
      const current = ++generation;
      dispose?.();
      dispose = undefined;
      if (preference.matches) return;
      const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
        import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText'),
      ]);
      if (current !== generation) return;
      gsap.registerPlugin(ScrollTrigger, SplitText);
      const contactWords = SplitText.create('.contact-title', { type: 'words', mask: 'words' });
      const context = gsap.context(() => {
        gsap.timeline({
          scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom 37%', scrub: 0.75 },
        })
          .to('.portrait-plane', { yPercent: -13, opacity: 0.14, ease: 'none' }, 0)
          .to('.hero-composition', { yPercent: -16, ease: 'none' }, 0);
        gsap.fromTo('.intro-title', { y: 24, clipPath: 'inset(0 0 48% 0)' }, {
          y: 0, clipPath: 'inset(0 0 0% 0)', ease: 'none',
          scrollTrigger: { trigger: '.about-grid', start: 'top 97%', end: 'top 61%', scrub: 0.68 },
        });
        document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
          gsap.from(element, {
            y: 28, opacity: 0.16, duration: 0.85, ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 93%', once: true },
          });
        });
        gsap.fromTo('.journey-progress', { scaleX: 0.06 }, {
          scaleX: 1, ease: 'none',
          scrollTrigger: { trigger: '.semester-years', start: 'top 91%', end: 'bottom 61%', scrub: 0.65 },
        });
        gsap.from(contactWords.words, {
          yPercent: 45, opacity: 0.45, duration: 0.75, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: '.contact-title', start: 'top 91%', once: true },
        });
      });

      const media = gsap.matchMedia();
      media.add('(hover: hover) and (pointer: fine)', () => {
        const cleanups: (() => void)[] = [];
        const hero = document.getElementById('home');
        if (hero) {
          const portrait = hero.querySelector('.portrait-living');
          const x = gsap.quickTo(portrait, 'x', { duration: 0.62, ease: 'power3.out' });
          const y = gsap.quickTo(portrait, 'y', { duration: 0.62, ease: 'power3.out' });
          const move = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse' || 'playing' in hero.dataset) return;
            const box = hero.getBoundingClientRect();
            x((event.clientX - box.left - box.width / 2) * 12 / box.width);
            y((event.clientY - box.top - box.height / 2) * 8 / box.height);
          };
          const reset = () => { x(0); y(0); };
          hero.addEventListener('pointermove', move, { passive: true });
          hero.addEventListener('pointerleave', reset);
          cleanups.push(() => {
            hero.removeEventListener('pointermove', move);
            hero.removeEventListener('pointerleave', reset);
            x.tween.kill();
            y.tween.kill();
            gsap.set(portrait, { clearProps: 'transform' });
          });
        }
        for (const element of document.querySelectorAll<HTMLElement>('[data-tilt], .button')) {
          const isCard = element.hasAttribute('data-tilt');
          const moveX = gsap.quickTo(element, isCard ? 'rotationY' : 'x', { duration: 0.4, ease: 'power3.out' });
          const moveY = gsap.quickTo(element, isCard ? 'rotationX' : 'y', { duration: 0.4, ease: 'power3.out' });
          const move = (event: PointerEvent) => {
            const box = element.getBoundingClientRect();
            moveX(((event.clientX - box.left) / box.width - 0.5) * (isCard ? 6 : 9));
            moveY(((event.clientY - box.top) / box.height - 0.5) * (isCard ? -6 : 7));
          };
          const leave = () => { moveX(0); moveY(0); };
          element.addEventListener('pointermove', move);
          element.addEventListener('pointerleave', leave);
          cleanups.push(() => {
            element.removeEventListener('pointermove', move);
            element.removeEventListener('pointerleave', leave);
            moveX.tween.kill();
            moveY.tween.kill();
            gsap.set(element, { clearProps: 'transform' });
          });
        }
        return () => cleanups.forEach((cleanup) => cleanup());
      });

      dispose = () => {
        media.revert();
        context.revert();
        contactWords.revert();
      };
    }

    const onChange = () => { void update().catch(() => {}); };
    onChange();
    preference.addEventListener('change', onChange);
    return () => {
      generation++;
      dispose?.();
      preference.removeEventListener('change', onChange);
    };
  }, []);
  return null;
}
