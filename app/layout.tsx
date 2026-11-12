import type { Metadata, Viewport } from 'next';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-800.css';
import '@fontsource-variable/inter/standard.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import './globals.css';
import './portfolio-extensions.css';

const title = 'Satwik — Developer Portfolio';
const description = 'Satwik, a B.Tech Data Science and Artificial Intelligence student at IIIT Naya Raipur. Selected projects in desktop software, web development, and campus tools.';
const canonical = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title,
  description,
  ...(canonical ? {
    metadataBase: new URL(canonical),
    alternates: { canonical: '/' },
  } : {}),
  openGraph: {
    title,
    description,
    type: 'website',
    ...(canonical ? { url: '/', images: [{ url: '/social.jpg', width: 1200, height: 630, alt: 'Satwik’s cinematic developer portfolio' }] } : {}),
  },
  twitter: {
    card: canonical ? 'summary_large_image' : 'summary',
    title,
    description,
    ...(canonical ? { images: ['/social.jpg'] } : {}),
  },
  icons: { icon: '/mark.svg' },
};

export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#050507' };

const prepareIntro = `
  try {
    if ((!location.hash || location.hash === '#home') &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches &&
      sessionStorage.getItem('satwik-intro') !== 'seen') {
      document.documentElement.dataset.introPending = '';
      setTimeout(() => delete document.documentElement.dataset.introPending, 1350);
    }
  } catch {}
`;

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: prepareIntro }} />
        {children}
      </body>
    </html>
  );
}
