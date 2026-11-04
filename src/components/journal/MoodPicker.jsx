import { MOODS } from '../../lib/journal.js';

export default function MoodPicker({ value, onChange }) {
  return (
    <div className={`mood-picker${value != null ? ' has-value' : ''}`} role="radiogroup" aria-label="Mood">
      {MOODS.map((m) => {
        const selected = value === m.value;
        return (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`mood-option${selected ? ' selected' : ''}`}
            style={{ '--mood': m.color }}
            onClick={() => onChange(selected ? null : m.value)}
          >
            <span className="mood-emoji" aria-hidden="true">{m.emoji}</span>
            <span className="mood-label">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
