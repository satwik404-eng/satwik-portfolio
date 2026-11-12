import Image from 'next/image';
import { Hero } from '../components/hero';
import { ActionLink } from '../components/action-link';
import { Icon } from '../components/icons';
import { Navigation } from '../components/navigation';
import { ProjectShowcase } from '../components/project-showcase';
import { LearningJourney } from '../components/learning-journey';
import { PortfolioSkills } from '../components/portfolio-skills';
import { SiteMotion } from '../components/site-motion';
import { links } from '../lib/content';
import { projects } from '../lib/learning';

export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main" tabIndex={-1}>
        <Hero />

        <section className="section about shell" id="about" aria-labelledby="about-title">
          <div className="about-grid">
            <div>
              <span className="eyebrow">About</span>
              <h2 id="about-title" className="display chrome intro-title">INTRO</h2>
            </div>
            <div className="about-panel" data-reveal>
              <div>
                <p className="about-lead">I’m Satwik, a B.Tech student in Data Science and Artificial Intelligence at IIIT Naya Raipur.</p>
                <p className="body-text">I enjoy turning a problem into something I can build and test. I’m exploring AI, data science, and cybersecurity while working on software and web projects. Mathematics is a big part of how I approach all of it.</p>
              </div>
              <figure className="about-figure">
                <div className="about-image"><Image src="/portrait-editorial.webp" alt="Satwik wearing glasses and a grey overshirt" width={510} height={705} loading="lazy" /></div>
                <figcaption>Satwik Sankrityayan</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="section work shell" id="projects" aria-labelledby="projects-title">
          <div className="section-label">Projects</div>
          <h2 className="display chrome" id="projects-title" data-reveal>SELECTED WORK</h2>
          <ProjectShowcase projects={projects} />
        </section>

        <section className="section skills shell" id="skills" aria-labelledby="skills-title">
          <div className="section-label">Skills</div>
          <div className="split-section">
            <h2 className="display chrome" id="skills-title" data-reveal>TOOLKIT</h2>
            <PortfolioSkills />
          </div>
        </section>

        <section className="section journey shell" id="journey" aria-labelledby="journey-title">
          <div className="section-label">B.Tech · Data Science and Artificial Intelligence</div>
          <header className="journey-heading" data-reveal>
            <h2 className="display chrome" id="journey-title">THE JOURNEY</h2>
            <p>Every semester. Every skill. Every project.</p>
          </header>
          <LearningJourney />
        </section>

        <section className="contact" id="contact" aria-labelledby="contact-title">
          <div className="shell section">
            <div className="section-label">Contact</div>
            <h2 className="display chrome contact-title" id="contact-title">LET’S BUILD</h2>
            <div className="contact-content">
              <p>Have a project, a question, or something you’d like to learn together?</p>
              <div>
                <ActionLink href={links.linkedin} primary>Connect on LinkedIn</ActionLink>
                <ActionLink href={links.github}>GitHub</ActionLink>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer shell"><span>© 2026 Satwik Sankrityayan</span><a className="text-link" href="#home">Back to top <Icon name="up" size={16} /></a></footer>
      <SiteMotion />
    </>
  );
}
