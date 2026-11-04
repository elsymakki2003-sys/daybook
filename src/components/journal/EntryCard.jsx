import { useState } from 'react';
import { ENERGY, moodFor, parseKey } from '../../lib/journal.js';

export default function EntryCard({ entry, onEdit, onDelete, onTagClick, activeTag }) {
  const [expanded, setExpanded] = useState(false);
  const mood = moodFor(entry.mood);
  const date = parseKey(entry.date);
  const gratitude = entry.gratitude.filter(Boolean);
  const expandable = entry.body.length > 280 || entry.body.split('\n').length > 4 || gratitude.length > 0;

  return (
    <article className={`card entry${mood ? ' has-mood' : ''}`} style={mood ? { '--mood': mood.color } : undefined}>
      <div className="entry-date" aria-hidden="true">
        <span className="entry-day">{date.getDate()}</span>
        <span className="entry-weekday">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
      </div>

      <div className="entry-main">
        <header className="entry-head">
          <div className="entry-badges">
            {mood && (
              <span className="mood-chip">
                <span aria-hidden="true">{mood.emoji}</span> {mood.label}
              </span>
            )}
            {entry.energy && <span className="soft-chip">Energy · {ENERGY[entry.energy - 1]}</span>}
            <time className="meta" dateTime={entry.date}>
              {date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </time>
          </div>
          <div className="entry-actions">
            <button className="btn ghost sm" onClick={onEdit}>Edit</button>
            <button className="btn ghost sm danger" onClick={onDelete}>Delete</button>
          </div>
        </header>

        {entry.title && <h3 className="entry-title">{entry.title}</h3>}
        {entry.body && <p className={`entry-body${expanded ? '' : ' clamped'}`}>{entry.body}</p>}
        {!entry.title && !entry.body && <p className="entry-body muted">Mood check-in</p>}

        {expanded && gratitude.length > 0 && (
          <div className="gratitude-view">
            <span className="field-label">Good things</span>
            <ul>
              {gratitude.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>
        )}

        {expandable && (
          <button className="link-btn" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
            {expanded ? 'Show less' : gratitude.length && !entry.body ? 'Show good things' : 'Read more'}
          </button>
        )}

        {entry.tags.length > 0 && (
          <div className="tag-row">
            {entry.tags.map((t) => (
              <button
                key={t}
                className={`tag${activeTag === t ? ' active' : ''}`}
                onClick={() => onTagClick(t)}
                aria-pressed={activeTag === t}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
