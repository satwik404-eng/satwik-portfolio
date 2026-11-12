import Image from 'next/image';

export function ProjectArt({ id }: { id: string }) {
  if (id === 'openwall') {
    return (
      <div className="project-art openwall-art" aria-hidden="true">
        <Image className="openwall-backdrop" src="/silk.webp" alt="" width={960} height={540} loading="lazy" />
        <div className="desktop-window">
          <div className="window-bar"><i /><i /><i /><span>OpenWall</span></div>
          <div className="window-body">
            <div className="window-rail"><strong>Studio</strong><span>Library</span><span>Collections</span><span>Settings</span></div>
            <div className="window-media">
              <Image src="/silk.webp" alt="" width={960} height={540} loading="lazy" />
              <div><strong>Midnight silk</strong><span>Motion collection</span></div>
            </div>
          </div>
          <div className="window-player"><span>Midnight silk</span><i>◀ &nbsp; ▶ &nbsp; ▶|</i><span>OpenWall Studio</span></div>
        </div>
      </div>
    );
  }

  if (id === 'archive') {
    return (
      <div className="project-art archive-art" aria-hidden="true">
        <div className="archive-grid" />
        <div className="archive-file">
          <span>ARCHIVE / CASE 404</span><strong>404<span>.</span></strong><span>THE STUDENT WHO NEVER EXISTED</span>
        </div>
        <div className="archive-ring" />
      </div>
    );
  }

  return (
    <div className="project-art byg-art" aria-hidden="true">
      <div className="byg-radar" />
      <div className="phone">
        <div className="phone-pill" />
        <span className="phone-time">9:41</span>
        <strong>Before<br />YouGo<span>.</span></strong>
        <div className="phone-panel"><span>Today</span><b>Classes</b><i /><i /><i /></div>
        <div className="phone-nav"><span>⌂</span><span>◷</span><span>◎</span></div>
      </div>
    </div>
  );
}
