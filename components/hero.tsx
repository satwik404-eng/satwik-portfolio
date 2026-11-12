'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Icon } from './icons';
import { ActionLink } from './action-link';
import { LottieGlyph } from './lottie-glyph';

function rememberIntro() {
  try { sessionStorage.setItem('satwik-intro', 'seen'); } catch { /* Storage is optional. */ }
}

function hasSeenIntro() {
  try { return sessionStorage.getItem('satwik-intro') === 'seen'; } catch { return false; }
}

const motionPreference = '(prefers-reduced-motion: reduce)';

function subscribeToMotionPreference(notify: () => void) {
  const media = matchMedia(motionPreference);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}

const canAnimate = () => !matchMedia(motionPreference).matches;
const staticSnapshot = () => false;

export function Hero() {
  const hero = useRef<HTMLElement>(null);
  const cancel = useRef<(() => void) | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [capable, setCapable] = useState(true);
  const allowMotion = useSyncExternalStore(subscribeToMotionPreference, canAnimate, staticSnapshot);

  const finish = useCallback(() => {
    cancel.current?.();
    cancel.current = null;
    if (hero.current) {
      delete hero.current.dataset.playing;
      delete hero.current.dataset.render;
      delete hero.current.dataset.phase;
    }
    setPlaying(false);
    setLoading(false);
  }, []);

  const play = useCallback(() => {
    const element = hero.current;
    if (!element || !canAnimate() || cancel.current) return;
    rememberIntro();
    element.dataset.playing = '';
    setPlaying(true);
    setLoading(true);
    const controller = new AbortController();
    let dispose: (() => void) | undefined;
    let loading = true;
    const deadline = window.setTimeout(() => { if (loading) finish(); }, 3000);
    cancel.current = () => {
      clearTimeout(deadline);
      controller.abort();
      dispose?.();
    };
    void import('../lib/hero-motion')
      .then(async ({ startHeroMotion }) => {
        if (controller.signal.aborted) return;
        dispose = await startHeroMotion(element, controller.signal, finish);
        loading = false;
        if (controller.signal.aborted) {
          dispose?.();
        } else if (!dispose) {
          setCapable(false);
          finish();
        } else {
          setLoading(false);
        }
      })
      .catch(() => { if (!controller.signal.aborted) finish(); });
  }, [finish]);

  useEffect(() => {
    const preference = matchMedia(motionPreference);
    const element = hero.current;
    const update = () => { if (preference.matches) finish(); };
    const autoplay = window.setTimeout(() => {
      if (canAnimate() && !hasSeenIntro() && (!location.hash || location.hash === '#home') && scrollY < 48) play();
      delete document.documentElement.dataset.introPending;
    }, 0);
    preference.addEventListener('change', update);
    return () => {
      clearTimeout(autoplay);
      cancel.current?.();
      cancel.current = null;
      if (element) delete element.dataset.playing;
      preference.removeEventListener('change', update);
    };
  }, [finish, play]);

  useEffect(() => {
    if (!playing) return;
    const scroll = () => { if (scrollY > 60) finish(); };
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') finish(); };
    const hash = () => { if (location.hash && location.hash !== '#home') finish(); };
    addEventListener('scroll', scroll, { passive: true });
    addEventListener('keydown', key);
    addEventListener('hashchange', hash);
    return () => {
      removeEventListener('scroll', scroll);
      removeEventListener('keydown', key);
      removeEventListener('hashchange', hash);
    };
  }, [playing, finish]);

  return (
    <section className="hero" id="home" aria-labelledby="hero-title" ref={hero}>
      <div className="hero-field" aria-hidden="true">
        <div className="hero-halo" />
        <div className="portrait-plane">
          <div className="portrait-living">
            <Image className="hero-portrait" src="/portrait.webp" alt="" width={586} height={548} preload draggable={false} />
            <Image className="hero-stipple" src="/portrait-stipple.webp" alt="" width={1020} height={954} loading="eager" draggable={false} />
          </div>
        </div>
        <div className="hero-render" />
        <span className="origin" />
      </div>

      <div className="hero-frame shell">
        <div className="hero-composition">
          <div className="hero-title-position">
            <h1 id="hero-title" className="hero-title" aria-label="Satwik — Portfolio">
              {Array.from('PORTFOLIO', (letter, index) => <span className="chrome" key={index} aria-hidden="true">{letter}</span>)}
            </h1>
          </div>
          <div className="hero-details">
            <div>
              <p className="hero-tagline">Engineering Intelligence. Designing Experiences.</p>
              <p className="hero-discipline">DSAI Undergraduate <span>·</span> Developer <span>·</span> Technology Enthusiast</p>
            </div>
            <div className="hero-actions">
              <ActionLink href="#projects" primary>View projects</ActionLink>
              <ActionLink href="#contact">Contact me</ActionLink>
            </div>
          </div>
        </div>

        <div className="hero-foot">
          <a className="scroll-link" href="#about"><LottieGlyph cue="scroll" active={!playing} /> Scroll to explore</a>
          {allowMotion && capable && <button type="button" className="intro-control" onClick={playing ? finish : play}>
            {loading ? <LottieGlyph cue="loading" /> : <Icon name={playing ? 'right' : 'replay'} size={16} />} {playing ? 'Skip intro' : 'Replay intro'}
          </button>}
        </div>
      </div>
    </section>
  );
}
