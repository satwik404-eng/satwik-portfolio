'use client';

import { useEffect, useRef } from 'react';
import type { DotLottie } from '@lottiefiles/dotlottie-web';
import { Icon } from './icons';

type Cue = 'scroll' | 'menu' | 'contact' | 'button' | 'loading';
const icons = { scroll: 'down', menu: 'menu', contact: 'up-right', button: 'up-right', loading: 'replay' } as const;
let runtime: Promise<typeof DotLottie> | undefined;

function loadPlayer() {
  runtime ??= import('@lottiefiles/dotlottie-web').then(({ DotLottie }) => {
    DotLottie.setWasmUrl(new URL('/motion/dotlottie-player.wasm', location.href).href);
    return DotLottie;
  });
  return runtime;
}

export function LottieGlyph({ cue, active = true }: { cue: Cue; active?: boolean }) {
  const host = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = host.current;
    const surface = canvas.current;
    if (!element || !surface || !active) return;
    const hints = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (hints.connection?.saveData) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const control = element.closest('a,button');
    let mounted = true;
    let player: DotLottie | undefined;
    let pending = false;

    function destroy() {
      player?.destroy();
      player = undefined;
      if (element) delete element.dataset.ready;
    }

    function play() {
      if (preference.matches || !element || !surface) return;
      if (player?.isLoaded) {
        player.setFrame(0);
        player.play();
        return;
      }
      if (pending || player) return;
      pending = true;
      const animation = fetch('/motion/' + cue + '.json').then((response) => {
        if (!response.ok) throw new Error('Motion cue unavailable');
        return response.text();
      });
      void Promise.all([loadPlayer(), animation]).then(([Player, data]) => {
        if (!mounted || preference.matches) return;
        player = new Player({
          canvas: surface,
          data,
          autoplay: false,
          loop: cue === 'loading',
          renderConfig: { autoResize: false, devicePixelRatio: 1 },
        });
        player.addEventListener('load', () => {
          if (!mounted || preference.matches) return;
          element.dataset.ready = '';
          player?.play();
        });
        player.addEventListener('loadError', destroy);
      }).catch(() => {}).finally(() => { pending = false; });
    }

    const onPreference = () => { if (preference.matches) destroy(); };
    preference.addEventListener('change', onPreference);
    control?.addEventListener('pointerenter', play);
    control?.addEventListener('focusin', play);
    let observer: IntersectionObserver | undefined;
    if (!preference.matches && (cue === 'scroll' || cue === 'contact')) {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        observer?.disconnect();
        play();
      }, { threshold: 0.65 });
      observer.observe(element);
    }
    if (!preference.matches && cue === 'loading') play();

    return () => {
      mounted = false;
      destroy();
      observer?.disconnect();
      control?.removeEventListener('pointerenter', play);
      control?.removeEventListener('focusin', play);
      preference.removeEventListener('change', onPreference);
    };
  }, [active, cue]);

  return <span className="motion-glyph" aria-hidden="true" ref={host}><Icon name={icons[cue]} size={16} /><canvas ref={canvas} width={32} height={32} /></span>;
}
