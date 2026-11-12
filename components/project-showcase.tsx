'use client';

import Image from 'next/image';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import { projectPeriod, safeExternalUrl } from '../lib/learning';
import type { Project } from '../lib/learning';
import { ActionLink } from './action-link';
import { Icon } from './icons';
import { ProjectArt } from './project-art';

const motionPreference = '(prefers-reduced-motion: reduce)';
const historyKey = 'portfolioCaseStudy';

async function loadMotion() {
  const [{ gsap }, { Flip }] = await Promise.all([import('gsap'), import('gsap/Flip')]);
  gsap.registerPlugin(Flip);
  return { gsap, Flip };
}

type Motion = Awaited<ReturnType<typeof loadMotion>>;
type Origin = { card: HTMLElement; trigger: HTMLButtonElement; scrollLeft: number; scrollTop: number };

function ProjectPreview({ project }: { project: Project }) {
  if (project.image) {
    const className = project.paper ? 'project-preview-photo project-preview-paper' : 'project-preview-photo';
    return <Image className={className} {...project.image} alt={project.image.alt} sizes="(max-width: 760px) 88vw, 65vw" />;
  }
  return <ProjectArt id={project.id} />;
}

function tilt(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse' || !matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia(motionPreference).matches) return;
  const card = event.currentTarget;
  if (card.dataset.active) return;
  const box = card.getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width;
  const y = (event.clientY - box.top) / box.height;
  card.style.setProperty('--tilt-x', (0.5 - y) * 5 + 'deg');
  card.style.setProperty('--tilt-y', (x - 0.5) * 6 + 'deg');
  card.style.setProperty('--light-x', x * 100 + '%');
  card.style.setProperty('--light-y', y * 100 + '%');
  card.dataset.hovered = 'true';
}

function resetTilt(card: HTMLElement) {
  for (const name of ['--tilt-x', '--tilt-y', '--light-x', '--light-y']) card.style.removeProperty(name);
  delete card.dataset.hovered;
}

function ProjectCase({ project }: { project: Project }) {
  const github = safeExternalUrl(project.githubUrl);
  const releases = safeExternalUrl(project.releasesUrl);
  const live = safeExternalUrl(project.liveUrl);
  const paper = project.paper;

  return (
    <>
      <header className="case-heading">
        <p className="eyebrow">{projectPeriod(project)} · {project.category} · {project.status}</p>
        <h2 id="project-case-title">{project.title}</h2>
        <p>{project.shortDescription}</p>
        {paper && <div className="case-paper-link"><ActionLink href={paper.path} primary>Read the working paper (PDF)</ActionLink><span>{paper.date}</span></div>}
        {(project.startDate || project.completionDate) && (
          <p className="eyebrow">{[project.startDate, project.completionDate].filter(Boolean).join(' — ')}</p>
        )}
      </header>
      <div className="case-preview"><ProjectPreview project={project} /></div>
      <div className="case-details">
        <section data-case-detail>
          <h3>Project overview</h3>
          <p>{project.fullDescription}</p>
          <p>{project.motivation}</p>
        </section>
        <section data-case-detail>
          <h3>{paper ? 'Research methods' : 'Technologies used'}</h3>
          <dl className="case-stack">{project.technologies.map(({ name, role }) => (
            <div key={name}><dt>{name}</dt><dd>{role}</dd></div>
          ))}</dl>
        </section>
        <section data-case-detail>
          <h3>{paper ? 'Research attribution' : 'AI & development process'}</h3>
          <dl className="case-ai">
            <div><dt>AI implemented in the project</dt><dd>{project.aiFeatures}</dd></div>
            <div><dt>{paper ? 'Mathematical formulation' : 'AI used during development'}</dt><dd>{project.aiDevelopmentUsage}</dd></div>
          </dl>
        </section>
        <section data-case-detail>
          <h3>Challenges</h3>
          <ul>{project.challenges.map((challenge) => <li key={challenge}>{challenge}</li>)}</ul>
          <h3>Learning outcomes</h3>
          <ul>{project.learnings.map((learning) => <li key={learning}>{learning}</li>)}</ul>
        </section>
        {project.screenshots?.length ? <section data-case-detail><h3>Screenshots</h3><div className="case-screenshots">{project.screenshots.map((shot) => <Image key={shot.src} {...shot} alt={shot.alt} sizes="(max-width: 760px) 85vw, 45vw" />)}</div></section> : null}
        {(github || releases || live) && <section data-case-detail>
          <h3>Explore the project</h3>
          <div className="case-links">
            {github && <ActionLink href={github} primary>View on GitHub</ActionLink>}
            {releases && <ActionLink href={releases}>{github ? 'Download' : 'View GitHub releases'}</ActionLink>}
            {live && <ActionLink href={live}>Live demo</ActionLink>}
          </div>
          {!github && releases && <p className="case-note">Application source is private. Public Android testing releases are available on GitHub.</p>}
        </section>}
      </div>
    </>
  );
}

export function ProjectShowcase({ projects }: { projects: readonly Project[] }) {
  const track = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const origin = useRef<Origin | null>(null);
  const restore = useRef<Origin | null>(null);
  const motion = useRef<Motion | null>(null);
  const tween = useRef<gsap.core.Animation | null>(null);
  const detailTween = useRef<gsap.core.Animation | null>(null);
  const busy = useRef(false);
  const closing = useRef(false);
  const [active, setActive] = useState<Project | null>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const start = element.scrollLeft <= 2;
      const end = element.scrollLeft + element.clientWidth >= element.scrollWidth - 2;
      setEdge((previous) => previous.start === start && previous.end === end ? previous : { start, end });
    };
    const resize = new ResizeObserver(update);
    resize.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    update();

    let mounted = true;
    const prepare = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      prepare.disconnect();
      if (!matchMedia(motionPreference).matches) void loadMotion().then((engine) => { if (mounted) motion.current = engine; }).catch(() => {});
    }, { rootMargin: '240px' });
    prepare.observe(element);
    return () => {
      mounted = false;
      prepare.disconnect();
      resize.disconnect();
      element.removeEventListener('scroll', update);
    };
  }, []);

  const open = useCallback((project: Project, trigger: HTMLButtonElement, push: boolean) => {
    const card = trigger.closest<HTMLElement>('.showcase-card');
    const viewport = track.current;
    if (!card || !viewport || busy.current) return;
    busy.current = true;
    closing.current = false;
    resetTilt(card);
    origin.current = { card, trigger, scrollLeft: viewport.scrollLeft, scrollTop: window.scrollY };
    if (push) history.pushState({ ...history.state, [historyKey]: project.slug }, '', '#case/' + project.slug);
    setActive(project);
  }, []);

  const finishClose = useCallback(() => {
    restore.current = origin.current;
    dialog.current?.close();
    setActive(null);
    busy.current = false;
    closing.current = false;
    origin.current = null;
  }, []);

  const collapse = useCallback(() => {
    const sheet = dialog.current;
    const view = panel.current;
    const previous = origin.current;
    if (!view || !previous || !sheet?.open) {
      finishClose();
      return;
    }
    tween.current?.kill();
    detailTween.current?.kill();
    const engine = motion.current;
    if (!engine || matchMedia(motionPreference).matches) {
      finishClose();
      return;
    }
    sheet.dataset.closing = 'true';
    const cover = view.querySelector('.case-shared-cover');
    engine.gsap.set(cover, { y: view.scrollTop });
    tween.current = engine.gsap.to(cover, {
      autoAlpha: 1, duration: 0.15, onComplete: () => {
        view.scrollTop = 0;
        engine.gsap.set(cover, { y: 0 });
        const destination = engine.Flip.fit(view, previous.card.querySelector('.showcase-media') ?? previous.card, {
          scale: true, getVars: true,
        });
        if (!destination) {
          finishClose();
          return;
        }
        tween.current = engine.gsap.to(view, { ...destination, duration: 0.48, ease: 'power3.inOut', onComplete: finishClose });
      },
    });
  }, [finishClose]);

  function requestClose() {
    if (!active || closing.current) return;
    closing.current = true;
    if (history.state?.[historyKey] === active.slug) history.back();
    else collapse();
  }

  useEffect(() => {
    function onPop(event: PopStateEvent) {
      if (busy.current) {
        if (!event.state?.[historyKey]) {
          closing.current = true;
          collapse();
        }
        return;
      }
      const project = projects.find((item) => item.slug === event.state?.[historyKey]);
      const card = project ? document.getElementById('card-' + project.slug) : null;
      const trigger = card?.querySelector<HTMLButtonElement>('button');
      if (project && trigger) open(project, trigger, false);
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [collapse, open, projects]);

  useLayoutEffect(() => {
    const sheet = dialog.current;
    const view = panel.current;
    const previous = origin.current;
    if (!active || !sheet || !view || !previous) return;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sheet.showModal();
    closeButton.current?.focus({ preventScroll: true });
    const engine = motion.current;
    if (engine && !matchMedia(motionPreference).matches) {
      const source = previous.card.querySelector('.showcase-media') ?? previous.card;
      const start = engine.Flip.fit(view, source, { scale: true, getVars: true });
      const cover = view.querySelector('.case-shared-cover');
      if (start) tween.current = engine.gsap.from(view, { ...start, duration: 0.55, ease: 'power3.inOut', clearProps: 'transform' });
      detailTween.current = engine.gsap.timeline()
        .fromTo(cover, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.26 }, 0.32)
        .from(view.querySelectorAll('[data-case-detail]'), {
          opacity: 0, y: 12, duration: 0.34, stagger: 0.045, ease: 'power2.out', clearProps: 'transform,opacity',
        }, 0.42);
    }
    return () => {
      tween.current?.kill();
      detailTween.current?.kill();
      tween.current = null;
      detailTween.current = null;
      if (sheet.open) sheet.close();
      document.body.style.overflow = bodyOverflow;
    };
  }, [active]);

  useLayoutEffect(() => {
    if (active || !restore.current) return;
    const previous = restore.current;
    restore.current = null;
    track.current?.scrollTo({ left: previous.scrollLeft, behavior: 'instant' });
    if (Math.abs(window.scrollY - previous.scrollTop) > 2) window.scrollTo({ top: previous.scrollTop, behavior: 'instant' });
    const frame = requestAnimationFrame(() => {
      if (!busy.current && previous.trigger.isConnected) previous.trigger.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  function advance(direction: number) {
    const viewport = track.current;
    const first = viewport?.querySelector<HTMLElement>('.showcase-card');
    if (!viewport || !first) return;
    const gap = parseFloat(getComputedStyle(viewport).columnGap) || 0;
    viewport.scrollBy({ left: direction * (first.offsetWidth + gap), behavior: matchMedia(motionPreference).matches ? 'instant' : 'smooth' });
  }

  function onExpand(event: MouseEvent<HTMLButtonElement>, project: Project) {
    open(project, event.currentTarget, true);
  }

  return (
    <div className="project-showcase" role="region" aria-label="Featured projects">
      <div
        className="showcase-track"
        ref={track}
        tabIndex={0}
        aria-label="Project cards"
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            advance(event.key === 'ArrowRight' ? 1 : -1);
          }
        }}
      >
        {projects.map((project) => (
          <article
            className="showcase-card"
            tabIndex={-1}
            id={'card-' + project.slug}
            key={project.id}
            data-active={active?.id === project.id ? 'true' : undefined}
            onPointerMove={tilt}
            onPointerLeave={(event) => resetTilt(event.currentTarget)}
          >
            <div className="showcase-media">
              <div className="showcase-surface"><ProjectPreview project={project} /></div>
              <button type="button" className="round-control card-expand" aria-label={'Explore ' + project.title} aria-haspopup="dialog" onClick={(event) => onExpand(event, project)}>
                <Icon name="plus" size={21} />
              </button>
            </div>
            <div className="showcase-caption">
              <span className="eyebrow">{projectPeriod(project)} · {project.category}</span>
              <h3>{project.title}</h3>
              <p>{project.shortDescription}</p>
              <ul className="project-tools" aria-label="Technologies">{project.technologies.slice(0, 3).map(({ name }) => <li key={name}>{name}</li>)}</ul>
            </div>
          </article>
        ))}
      </div>
      {projects.length > 1 && <div className="showcase-controls">
        <button type="button" className="round-control" aria-label="Previous project" disabled={edge.start} onClick={() => advance(-1)}><Icon name="left" size={19} /></button>
        <button type="button" className="round-control" aria-label="Next project" disabled={edge.end} onClick={() => advance(1)}><Icon name="right" size={19} /></button>
      </div>}
      {active && (
        <dialog className="project-dialog" ref={dialog} aria-labelledby="project-case-title" onCancel={(event) => { event.preventDefault(); requestClose(); }} onClick={(event) => { if (event.target === event.currentTarget) requestClose(); }}>
          <div className="case-panel" ref={panel}>
            <div className="case-controls"><button type="button" className="round-control" ref={closeButton} aria-label="Close project" onClick={requestClose}><Icon name="close" size={21} /></button></div>
            <div className="case-shared-cover" aria-hidden="true"><ProjectPreview project={active} /></div>
            <ProjectCase project={active} />
          </div>
        </dialog>
      )}
    </div>
  );
}
