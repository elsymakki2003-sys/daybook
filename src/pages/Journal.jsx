import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import EntryEditor from '../components/journal/EntryEditor.jsx';
import EntryCard from '../components/journal/EntryCard.jsx';
import JournalStats from '../components/journal/JournalStats.jsx';
import MoodPicker from '../components/journal/MoodPicker.jsx';
import Toast from '../components/Toast.jsx';
import {
  MOODS,
  cleanFields,
  emptyDraft,
  greeting,
  isDraftEmpty,
  longDate,
  normalizeEntry,
  parseKey,
  sortEntries,
  toEditable,
  todayKey,
} from '../lib/journal.js';

export default function Journal() {
  const [rawEntries, setEntries] = useLocalStorage('journal.entries', []);
  const [storedDraft, setDraft] = useLocalStorage('journal.draft', null);
  const draft = storedDraft ? { ...emptyDraft(), ...storedDraft } : null;
  const hasDraft = draft !== null && !isDraftEmpty(draft);

  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);
  const [toast, setToast] = useState(null);

  const entries = useMemo(() => sortEntries(rawEntries.map(normalizeEntry)), [rawEntries]);

  // One-time upgrade of entries saved by the first version of the app.
  useEffect(() => {
    if (rawEntries.some((e) => !e.date)) setEntries(rawEntries.map(normalizeEntry));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allTags = useMemo(() => {
    const counts = new Map();
    entries.forEach((e) => e.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(
      (e) =>
        (!moodFilter || e.mood === moodFilter) &&
        (!tagFilter || e.tags.includes(tagFilter)) &&
        (!q || [e.title, e.body, ...e.tags, ...e.gratitude].join(' ').toLowerCase().includes(q))
    );
  }, [entries, query, moodFilter, tagFilter]);

  const groups = useMemo(() => {
    const out = [];
    for (const e of filtered) {
      const key = e.date.slice(0, 7);
      let group = out[out.length - 1];
      if (!group || group.key !== key) {
        group = {
          key,
          label: parseKey(e.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
          items: [],
        };
        out.push(group);
      }
      group.items.push(e);
    }
    return out;
  }, [filtered]);

  // ---- Actions ----

  const openComposer = (patch = {}) => {
    setDraft({ ...(hasDraft ? draft : emptyDraft()), ...patch });
    setComposerOpen(true);
  };

  const closeComposer = () => {
    if (!hasDraft) setDraft(null);
    setComposerOpen(false);
  };

  const discardDraft = () => {
    const previous = draft;
    setDraft(null);
    setComposerOpen(false);
    setToast({
      message: 'Draft discarded',
      action: { label: 'Undo', run: () => { setDraft(previous); setComposerOpen(true); } },
    });
  };

  const saveNew = () => {
    const now = new Date().toISOString();
    setEntries([{ id: crypto.randomUUID(), ...cleanFields(draft), createdAt: now, updatedAt: now }, ...entries]);
    setDraft(null);
    setComposerOpen(false);
    setToast({ message: 'Entry saved' });
  };

  const saveEdit = () => {
    setEntries(
      entries.map((e) =>
        e.id === editing.id ? { ...e, ...cleanFields(editing), updatedAt: new Date().toISOString() } : e
      )
    );
    setEditing(null);
    setToast({ message: 'Changes saved' });
  };

  const deleteEntry = (entry) => {
    setEntries(entries.filter((e) => e.id !== entry.id));
    if (editing?.id === entry.id) setEditing(null);
    setToast({
      message: 'Entry deleted',
      action: { label: 'Undo', run: () => setEntries((prev) => [...prev, entry]) },
    });
  };

  const clearFilters = () => {
    setQuery('');
    setMoodFilter(null);
    setTagFilter(null);
  };

  const todayCount = entries.filter((e) => e.date === todayKey()).length;

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">{greeting()}</p>
          <h2 className="page-title">Journal</h2>
          <p className="page-sub">{longDate(new Date())}</p>
        </div>
        {!composerOpen && (
          <button className="btn primary" onClick={() => openComposer()}>
            {hasDraft ? 'Resume draft' : '+ New entry'}
          </button>
        )}
      </div>

      {entries.length > 0 && <JournalStats entries={entries} />}

      {composerOpen && draft ? (
        <EntryEditor
          value={draft}
          onChange={setDraft}
          onSave={saveNew}
          onCancel={closeComposer}
          onDiscard={discardDraft}
          tagSuggestions={allTags}
          autoFocus
        />
      ) : (
        <div className="card checkin">
          <div>
            <h3 className="checkin-title">How are you feeling?</h3>
            <p className="meta">
              {todayCount
                ? `You’ve logged ${todayCount} ${todayCount === 1 ? 'entry' : 'entries'} today.`
                : 'Pick a mood to start today’s entry.'}
            </p>
          </div>
          <MoodPicker value={null} onChange={(mood) => mood && openComposer({ mood })} />
          {hasDraft && (
            <p className="meta">
              You have an unsaved draft.{' '}
              <button className="link-btn" onClick={() => openComposer()}>Resume it</button>
            </p>
          )}
        </div>
      )}

      {entries.length > 0 && (
        <div className="filters">
          <label className="search">
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
              <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              className="input"
              placeholder="Search entries"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search entries"
            />
          </label>
          <div className="mood-filter" role="group" aria-label="Filter by mood">
            {MOODS.map((m) => (
              <button
                key={m.value}
                className={`mood-filter-btn${moodFilter === m.value ? ' active' : ''}`}
                style={{ '--mood': m.color }}
                aria-pressed={moodFilter === m.value}
                title={`Show ${m.label.toLowerCase()} days`}
                onClick={() => setMoodFilter(moodFilter === m.value ? null : m.value)}
              >
                <span aria-hidden="true">{m.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {tagFilter && (
        <div className="active-filter">
          Showing entries tagged <span className="tag active">#{tagFilter}</span>
          <button className="link-btn" onClick={() => setTagFilter(null)}>Clear</button>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Your journal is empty</p>
          <p>Pick a mood above to write your first entry.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <p className="empty-title">No entries match</p>
          <button className="btn secondary sm" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        groups.map((g) => (
          <div key={g.key} className="month-group">
            <h3 className="month-label">
              <span>{g.label}</span>
              <span className="month-count">
                {g.items.length} {g.items.length === 1 ? 'entry' : 'entries'}
              </span>
            </h3>
            <ul className="list entry-list">
              {g.items.map((e) => (
                <li key={e.id}>
                  {editing?.id === e.id ? (
                    <EntryEditor
                      mode="edit"
                      value={editing}
                      onChange={setEditing}
                      onSave={saveEdit}
                      onCancel={() => setEditing(null)}
                      tagSuggestions={allTags}
                      autoFocus
                    />
                  ) : (
                    <EntryCard
                      entry={e}
                      onEdit={() => setEditing(toEditable(e))}
                      onDelete={() => deleteEntry(e)}
                      onTagClick={(t) => setTagFilter(tagFilter === t ? null : t)}
                      activeTag={tagFilter}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </section>
  );
}
