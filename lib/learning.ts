export type Media = { src: string; alt: string; width: number; height: number };

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  motivation: string;
  academicYear: number | null;
  semester: number | null;
  startDate?: string;
  completionDate?: string;
  image?: Media;
  screenshots?: readonly Media[];
  technologies: readonly { name: string; role: string }[];
  aiFeatures: string;
  aiDevelopmentUsage: string;
  challenges: readonly string[];
  learnings: readonly string[];
  githubUrl?: string;
  releasesUrl?: string;
  liveUrl?: string;
  paper?: { path: `/${string}.pdf`; date: string };
  status: 'Released' | 'In testing' | 'Prototype' | 'Working paper';
};

export type Semester = {
  academicYear: number;
  semester: number;
  period?: string;
  title?: string;
  description?: string;
  courses?: readonly string[];
  skillsLearned?: readonly string[];
  projectIds?: readonly string[];
  milestones?: readonly string[];
  status: 'Current' | 'Completed' | 'Planned';
};

export const certificates = [
  {
    title: 'Python Basics Course',
    issuer: 'Udemy · KodeKloud Training',
    issued: '2026-09-15',
    dateLabel: '15 September 2026',
    detail: '1.5 hours of introductory Python training.',
    document: '/credentials/python-basics.webp',
  },
  {
    title: 'AI Tools & Claude Workshop',
    issuer: 'be10X',
    issued: '2026-09-06',
    dateLabel: '6 September 2026',
    detail: 'Workshop on AI-assisted presentations, data analysis, coding, and debugging.',
    document: '/credentials/ai-tools-claude.webp',
  },
] as const;

export const skills = [
  { id: 'python', name: 'Python', category: 'Programming', semester: 1, evidence: 'Python Basics Course', description: 'Practiced introductory Python programming through the Udemy course.' },
  { id: 'c', name: 'C', category: 'Programming', semester: 1, evidence: 'Programming practice', description: 'Practiced control flow, functions, and problem-solving with small C programs.' },
  { id: 'swift', name: 'Swift', category: 'Programming', semester: 1, evidence: 'BeforeYouGo · OpenWall', description: 'Worked with Swift in native app development and macOS tooling.' },
  { id: 'kotlin', name: 'Kotlin', category: 'Programming', semester: 1, evidence: 'BeforeYouGo', description: 'Worked with Kotlin in the Android app.' },
  { id: 'csharp', name: 'C#', category: 'Programming', semester: 1, evidence: 'OpenWall', description: 'Worked with C# in the Windows desktop app.' },
  { id: 'frontend', name: 'Front-end development', category: 'Development', semester: 1, evidence: 'BeforeYouGo · OpenWall · CapacityConnect · 404', description: 'Built interfaces for campus tools, desktop software, a training portal prototype, and a browser game.' },
  { id: 'fullstack', name: 'Full-stack development', category: 'Development', semester: 1, evidence: 'BeforeYouGo · OpenWall · 404', description: 'Worked across interfaces, application logic, and data boundaries.' },
  { id: 'web', name: 'Web development', category: 'Development', semester: 1, evidence: 'BeforeYouGo · 404', description: 'Worked on responsive browser interfaces and web application flows.' },
  { id: 'github', name: 'GitHub', category: 'Tools and testing', semester: 1, evidence: 'BeforeYouGo · OpenWall · 404', description: 'Used GitHub for source, release notes, or distribution across projects.' },
  { id: 'database', name: 'Database testing', category: 'Tools and testing', semester: 1, evidence: 'BeforeYouGo · 404', description: 'Worked with persisted attendance or game progress and checked that it could be read back correctly.' },
  { id: 'ai', name: 'AI-assisted development (vibe coding)', category: 'Tools and testing', semester: 1, evidence: 'AI Tools & Claude Workshop · BeforeYouGo', description: 'Practiced using AI tools for coding, debugging, data analysis, and presentations. Used ChatGPT as design assistance on BeforeYouGo.' },
] as const;

export const projects: readonly Project[] = [
  {
    id: 'openwall', slug: 'openwall', title: 'OpenWall', category: 'Desktop software',
    shortDescription: 'An open-source live wallpaper studio for macOS and Windows, with a local motion library, playlists, and support for your own videos.',
    fullDescription: 'OpenWall is a local-first desktop application for applying animated wallpapers and managing a collection of videos. The Studio interface brings previewing, collections, playback, and display selection into one place.',
    motivation: 'Make animated wallpaper playback and organization available without an account, subscription, or cloud library.',
    academicYear: 1, semester: 1, status: 'Released',
    technologies: [
      { name: 'Swift', role: 'Native macOS application and screen-saver integration.' },
      { name: 'AVFoundation', role: 'Video playback and media handling on macOS.' },
      { name: 'C# / .NET', role: 'Windows desktop application and installer tooling.' },
      { name: 'GitHub Actions', role: 'Build, verify, and publish platform release artifacts.' },
    ],
    aiFeatures: 'No AI integration documented.',
    aiDevelopmentUsage: 'The public project documentation does not specify which development tasks used AI assistance.',
    challenges: [
      'Keep imported media and playlists intact across app updates. The updater validates artifacts, replaces the managed installation, and rolls back if launch is not acknowledged.',
      'Keep playback options consistent across platforms while respecting the frame rate and quality of each source.',
    ],
    learnings: ['Design platform-specific playback around a shared catalog.', 'Treat the wallpaper library as user data with a different lifecycle from the app and its caches.'],
    githubUrl: 'https://github.com/satwik404-eng/OpenWall',
    releasesUrl: 'https://github.com/satwik404-eng/OpenWall/releases/latest',
  },
  {
    id: 'archive', slug: '404-the-student-who-never-existed', title: '404: The Student Who Never Existed', category: 'Interactive web game',
    shortDescription: 'A browser mystery about an erased student. Follow evidence across six chapters and investigate solo or with another player.',
    fullDescription: 'The game presents a fictional student’s erased record as a series of evidence-based puzzles. Players track clues, make narrative choices, and can investigate together through synchronized rooms.',
    motivation: 'Build a story that rewards inspecting details and connecting evidence instead of simply following a linear cutscene.',
    academicYear: 1, semester: 1, status: 'Released',
    image: { src: '/projects/404-landing.webp', alt: 'Public 404 game landing screen, featuring an erased student record', width: 1280, height: 820 },
    technologies: [
      { name: 'React', role: 'Investigation workspaces, evidence, and cinematic screens.' },
      { name: 'TypeScript', role: 'Shared contracts for game rules and progress.' },
      { name: 'Supabase', role: 'Production authentication, persistence, and multiplayer updates.' },
      { name: 'SQLite', role: 'Persistent progress in the local development backend.' },
    ],
    aiFeatures: 'No AI integration documented. The story features an archival AI, and the ECHO dialogue uses deterministic game rules.',
    aiDevelopmentUsage: 'The public README describes the game, its artwork, and its test coverage. It does not specify which development tasks used AI assistance.',
    challenges: [
      'Keep narrative and challenge progress consistent across devices. The production server exposes story information according to verified progress.',
      'Support solo and two-player investigations. The documented browser tests cover both endings, save persistence, and cooperation between separate sessions.',
    ],
    learnings: ['Keep authoritative game progress separate from local interface state.', 'Verify narrative and multiplayer flows with browser sessions that have separate state.'],
    githubUrl: 'https://github.com/satwik404-eng/404-the-student-who-never-existed',
    liveUrl: 'https://project-404-archive.vercel.app',
  },
  {
    id: 'byg', slug: 'before-you-go', title: 'BeforeYouGo', category: 'Campus app · Team project',
    shortDescription: 'A cross-platform campus companion for schedules and attendance. I co-developed the frontend.',
    fullDescription: 'BeforeYouGo brings class schedules and attendance into a campus companion for Android, iOS, and the web. The public Android repository provides testing builds and release notes.',
    motivation: 'Make routine class information and attendance easier to find and manage in one place.',
    academicYear: 1, semester: 1, status: 'In testing',
    technologies: [
      { name: 'Kotlin', role: 'Android application development.' },
      { name: 'Swift', role: 'iOS application development.' },
      { name: 'Material 3', role: 'Visual system for the Android frontend.' },
      { name: 'Bluetooth', role: 'Nearby detection for the mobile attendance flow.' },
    ],
    aiFeatures: 'No AI integration documented.',
    aiDevelopmentUsage: 'The release notes credit ChatGPT with design assistance for Material 3 Expressive. I co-developed the frontend with Debabrata Mukherjee. The backend is credited separately to Sridhar Shekhar Patro and the team.',
    challenges: [
      'Keep attendance tied to the correct lecture and avoid duplicate state across repeat requests.',
      'Balance Bluetooth sweep timing and foreground behavior. The release notes describe bounded sweeps, retry changes, and pending classroom testing.',
    ],
    learnings: ['Design mobile attendance flows around connectivity and permission changes.', 'Separate what a testing release verifies from what still needs classroom testing.'],
    releasesUrl: 'https://github.com/satwik404-eng/BYG-Releases/releases',
  },
  {
    id: 'quasar', slug: 'nothing-os-5-spatialiser', title: 'Nothing OS 5 Spatialiser', category: 'Spatial audio research',
    shortDescription: 'A reverse-engineering study of how the Nothing Phone (3) might render spatial audio through Qualcomm Quasar.',
    fullDescription: 'Satwik Sankrityayan investigated the phone’s audio path and documented a candidate model combining fourth-order spherical harmonics, directional impulse responses, and FFT-based binaural convolution. Fourth order yields 25 harmonic components. The reported 25 × 256 filter bank and the match to live playback still need independent verification.',
    motivation: 'A listening comparison with macOS prompted the investigation into how the phone creates a sense of direction over headphones.',
    academicYear: 1, semester: 1, status: 'Working paper',
    paper: { path: '/research/nothing-os-5-spatialiser.pdf', date: '12 November 2026' },
    image: { src: '/projects/quasar-directional-coefficients.webp', alt: 'The working paper’s plot of modeled directional coefficients across azimuth at 20 degrees elevation', width: 810, height: 288 },
    technologies: [
      { name: 'Android audio diagnostics', role: 'Documented the reported spatial mixer and effect chain.' },
      { name: 'AArch64 disassembly', role: 'Traced the reported Qualcomm Quasar initialization and processing paths.' },
      { name: 'Spherical harmonics', role: 'Modeled directional coefficients with SN3D normalization and ACN indexing.' },
      { name: 'FFT convolution', role: 'Described a candidate method for applying directional filters in the frequency domain.' },
    ],
    aiFeatures: 'No AI integration documented.',
    aiDevelopmentUsage: 'Codex formulated the mathematical equations for the reconstructed model. Satwik Sankrityayan conducted the reverse-engineering investigation.',
    challenges: [
      'Distinguish observations reported from device diagnostics and disassembly from properties derived mathematically.',
      'Establish how the candidate filters map to the two ears and whether the model reproduces live playback. Both remain open.',
    ],
    learnings: [
      'Keep harmonic order, coefficient normalization, and channel indexing separate when reconstructing a spatial-audio model.',
      'Use controlled playback measurements to test whether a model inferred from static analysis matches the device.',
    ],
  },
];

export const semesters: readonly Semester[] = [
  {
    academicYear: 1, semester: 1, title: 'Foundations', period: 'Autumn 2026 · 2026–27',
    description: 'I started with programming fundamentals and put them into practice across desktop, web, and mobile projects.',
    courses: ['Programming fundamentals in C', 'Introductory Python', 'AI-assisted coding, data analysis, and presentations'],
    skillsLearned: skills.filter((skill) => skill.semester === 1).map((skill) => skill.id),
    projectIds: ['openwall', 'archive', 'byg', 'quasar'],
    milestones: ['Completed the AI Tools & Claude Workshop on 6 September 2026.', 'Completed Python Basics on 15 September 2026.', 'Prepared the Nothing OS 5 Spatialiser working paper on 12 November 2026.'],
    status: 'Current',
  },
  { academicYear: 1, semester: 2, status: 'Planned' },
  { academicYear: 2, semester: 3, status: 'Planned' },
  { academicYear: 2, semester: 4, status: 'Planned' },
  { academicYear: 3, semester: 5, status: 'Planned' },
  { academicYear: 3, semester: 6, status: 'Planned' },
  { academicYear: 4, semester: 7, status: 'Planned' },
  { academicYear: 4, semester: 8, status: 'Planned' },
];

export function projectPeriod(project: Project) {
  return project.semester === null
    ? 'Semester unconfirmed'
    : 'Semester ' + String(project.semester).padStart(2, '0');
}

export function safeExternalUrl(url?: string) {
  if (!url) return undefined;
  try { return new URL(url).protocol === 'https:' ? url : undefined; } catch { return undefined; }
}
