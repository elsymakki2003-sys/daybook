// Shared journal data helpers: moods, dates, entry shape, stats.

export const MOODS = [
  { value: 1, label: 'Awful', emoji: '😞', color: 'var(--mood-1)' },
  { value: 2, label: 'Low', emoji: '😕', color: 'var(--mood-2)' },
  { value: 3, label: 'Okay', emoji: '😐', color: 'var(--mood-3)' },
  { value: 4, label: 'Good', emoji: '🙂', color: 'var(--mood-4)' },
  { value: 5, label: 'Great', emoji: '😄', color: 'var(--mood-5)' },
];

export const ENERGY = ['Drained', 'Low', 'Steady', 'Energized', 'Buzzing'];

export const PROMPTS = [
  'What’s on your mind today?',
  'What made you smile today?',
  'What drained your energy, and what restored it?',
  'What are you looking forward to?',
  'Describe one moment from today in detail.',
  'What did you learn about yourself recently?',
  'What would make tomorrow a good day?',
  'What are you holding on to that you could let go of?',
];

export const moodFor = (value) => MOODS.find((m) => m.value === value) ?? null;

// ---- Dates (local, YYYY-MM-DD keys) ----

const pad = (n) => String(n).padStart(2, '0');

export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayKey = () => toKey(new Date());

export const parseKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

export const longDate = (date) =>
  date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

// ---- Entry shape ----

export const emptyDraft = (overrides = {}) => ({
  title: '',
  body: '',
  mood: null,
  energy: null,
  tags: [],
  gratitude: ['', '', ''],
  date: todayKey(),
  ...overrides,
});

export const isDraftEmpty = (d) =>
  !d.title.trim() &&
  !d.body.trim() &&
  d.mood == null &&
  d.energy == null &&
  d.tags.length === 0 &&
  d.gratitude.every((g) => !g.trim());

// Upgrades entries saved by older versions of the app.
export const normalizeEntry = (e) => {
  const createdAt = e.createdAt ?? new Date().toISOString();
  return {
    id: e.id ?? crypto.randomUUID(),
    title: e.title ?? '',
    body: e.body ?? '',
    mood: e.mood ?? null,
    energy: e.energy ?? null,
    tags: Array.isArray(e.tags) ? e.tags : [],
    gratitude: Array.isArray(e.gratitude) ? e.gratitude : [],
    date: e.date ?? toKey(new Date(createdAt)),
    createdAt,
    updatedAt: e.updatedAt ?? createdAt,
  };
};

// Editor form state -> stored fields.
export const cleanFields = (d) => ({
  title: d.title.trim(),
  body: d.body.trim(),
  mood: d.mood ?? null,
  energy: d.energy ?? null,
  tags: d.tags,
  gratitude: d.gratitude.map((g) => g.trim()).filter(Boolean),
  date: d.date || todayKey(),
});

// Stored entry -> editor form state.
export const toEditable = (e) => ({
  ...e,
  gratitude: [...e.gratitude, '', '', ''].slice(0, Math.max(3, e.gratitude.length)),
});

export const sortEntries = (entries) =>
  [...entries].sort((a, b) =>
    a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)
  );

export const wordCount = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);

// ---- Stats ----

// Consecutive days with at least one entry, ending today (or yesterday, so
// the streak isn't "lost" before you've had a chance to write today).
export const computeStreak = (entries) => {
  const days = new Set(entries.map((e) => e.date));
  let cursor = new Date();
  if (!days.has(toKey(cursor))) cursor = addDays(cursor, -1);
  let n = 0;
  while (days.has(toKey(cursor))) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
};

export const averageMood = (moods) =>
  moods.length ? moodFor(Math.round(moods.reduce((a, b) => a + b, 0) / moods.length)) : null;
