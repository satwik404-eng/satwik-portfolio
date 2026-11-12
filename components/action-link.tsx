import { LottieGlyph } from './lottie-glyph';

// The expanding marker adapts the Interactive Hover Button pattern by Magic UI.
export function ActionLink({ href, children, primary = false }: { href: string; children: string; primary?: boolean }) {
  return (
    <a href={href} className={'button action-link ' + (primary ? 'button-light' : 'button-ghost')}>
      {primary && <span className="action-marker" aria-hidden="true" />}
      <span className="action-label">{children}</span>
      <LottieGlyph cue={primary ? 'button' : 'contact'} />
    </a>
  );
}
