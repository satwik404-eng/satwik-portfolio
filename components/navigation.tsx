'use client';

import { useEffect, useRef, useState } from 'react';
import { navigation } from '../lib/content';
import { Icon } from './icons';
import { LottieGlyph } from './lottie-glyph';

export function Navigation() {
  const [active, setActive] = useState<string>('home');
  const [menu, setMenu] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sections = navigation.flatMap(([id]) => {
      const element = document.getElementById(id);
      return element ? [element] : [];
    });
    let frame = 0;
    const update = () => {
      frame = 0;
      const atEnd = scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 3;
      const current = atEnd
        ? sections.at(-1)
        : sections.findLast((section) => section.getBoundingClientRect().top <= Math.max(110, innerHeight * 0.31));
      setActive(current?.id ?? 'home');
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu) {
        setMenu(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menu]);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">Skip to content</a>
      <a href="#home" className="brand" aria-label="Satwik home" onClick={() => setMenu(false)}>
        <span className="brand-mark" aria-hidden="true">S</span> SATWIK<span className="brand-period">.</span>
      </a>
      <button type="button" ref={toggle} className="menu-toggle" aria-expanded={menu} aria-controls="site-nav" onClick={() => setMenu(!menu)}>
        {menu ? 'Close' : 'Menu'} {menu ? <Icon name="close" size={16} /> : <LottieGlyph cue="menu" />}
      </button>
      <nav className={menu ? 'nav nav-open' : 'nav'} id="site-nav" aria-label="Main navigation">
        {navigation.map(([id, label]) => (
          <a key={id} href={'#' + id} aria-current={active === id ? 'location' : undefined} onClick={() => setMenu(false)}>{label}</a>
        ))}
      </nav>
    </header>
  );
}
