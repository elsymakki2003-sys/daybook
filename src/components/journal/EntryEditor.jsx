import { useEffect, useRef, useState } from 'react';
import MoodPicker from './MoodPicker.jsx';
import EnergyPicker from './EnergyPicker.jsx';
import TagInput from './TagInput.jsx';
import { PROMPTS, isDraftEmpty, todayKey, wordCount } from '../../lib/journal.js';

export default function EntryEditor({
  value,
  onChange,
  onSave,
  onCancel,
  onDiscard,
  mode = 'new',
  tagSuggestions = [],
  autoFocus = false,
}) {
  const bodyRef = useRef(null);
  const [promptIndex, setPromptIndex] = useState(() => new Date().getDate() % PROMPTS.length);

  const set = (field, v) => onChange({ ...value, [field]: v });
  const setGratitude = (i, v) => {
    const next = [...value.gratitude];
    next[i] = v;
    set('gratitude', next);
  };

  // Grow the writing area with its content.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value.body]);

  useEffect(() => {
    if (autoFocus) bodyRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSave = value.mood != null || value.title.trim() || value.body.trim();
  const words = wordCount(value.body);
  const hasContent = !isDraftEmpty(value);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (canSave) onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      e.preventDefault(); // Enter in a single-line field shouldn't submit
    }
  };

  return (
    <form
      className={`card editor${mode === 'edit' ? ' editing' : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (canSave) onSave();
      }}
      onKeyDown={onKeyDown}
    >
      <div className="editor-top">
        <input
          type="date"
          className="date-input"
          value={value.date}
          max={todayKey()}
          onChange={(e) => set('date', e.target.value)}
          aria-label="Entry date"
        />
        {mode === 'new' && hasContent && <span className="saved-hint">Draft saved</span>}
        {mode === 'edit' && <span className="saved-hint">Editing entry</span>}
      </div>

      <div className="editor-metrics">
        <div className="field">
          <span className="field-label">Mood</span>
          <MoodPicker value={value.mood} onChange={(v) => set('mood', v)} />
        </div>
        <div className="field">
          <span className="field-label">Energy</span>
          <EnergyPicker value={value.energy} onChange={(v) => set('energy', v)} />
        </div>
      </div>

      <div className="editor-writing">
        <input
          className="title-input"
          placeholder="Give it a title"
          value={value.title}
          onChange={(e) => set('title', e.target.value)}
          aria-label="Title"
        />
        <textarea
          ref={bodyRef}
          className="body-input"
          placeholder={PROMPTS[promptIndex]}
          value={value.body}
          onChange={(e) => set('body', e.target.value)}
          aria-label="Entry"
          rows={5}
        />
        {!value.body && (
          <button
            type="button"
            className="link-btn prompt-btn"
            onClick={() => setPromptIndex((promptIndex + 1) % PROMPTS.length)}
          >
            ↻ Different prompt
          </button>
        )}
      </div>

      <div className="field">
        <span className="field-label">Three good things</span>
        <ol className="gratitude-inputs">
          {value.gratitude.map((g, i) => (
            <li key={i}>
              <span className="num" aria-hidden="true">{i + 1}</span>
              <input
                className="input subtle"
                value={g}
                placeholder={i === 0 ? 'Something you’re grateful for' : ''}
                onChange={(e) => setGratitude(i, e.target.value)}
                aria-label={`Good thing ${i + 1}`}
              />
            </li>
          ))}
        </ol>
      </div>

      <div className="field">
        <span className="field-label">Tags</span>
        <TagInput value={value.tags} onChange={(v) => set('tags', v)} suggestions={tagSuggestions} />
      </div>

      <footer className="editor-foot">
        <span className="meta">
          {words} {words === 1 ? 'word' : 'words'}
          <span className="kbd-hint"> · Ctrl + Enter to save</span>
        </span>
        <div className="actions">
          {mode === 'new' && onDiscard && hasContent && (
            <button type="button" className="btn ghost danger" onClick={onDiscard}>
              Discard
            </button>
          )}
          <button type="button" className="btn ghost" onClick={onCancel}>
            {mode === 'new' ? 'Close' : 'Cancel'}
          </button>
          <button type="submit" className="btn primary" disabled={!canSave}>
            {mode === 'new' ? 'Save entry' : 'Save changes'}
          </button>
        </div>
      </footer>
    </form>
  );
}
