import { useState } from 'react';

const cleanTag = (raw) => raw.trim().toLowerCase().replace(/^#+/, '').replace(/\s+/g, '-');

export default function TagInput({ value, onChange, suggestions = [] }) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  const add = (raw) => {
    const tag = cleanTag(raw);
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setText('');
  };

  const remove = (tag) => onChange(value.filter((t) => t !== tag));

  const onKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) return; // let Ctrl+Enter reach the form
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (text.trim()) add(text);
    } else if (e.key === 'Backspace' && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const query = cleanTag(text);
  const visibleSuggestions = suggestions
    .filter((s) => !value.includes(s) && s.startsWith(query))
    .slice(0, 6);

  return (
    <div>
      <div className="tag-input">
        {value.map((tag) => (
          <span key={tag} className="tag removable">
            #{tag}
            <button type="button" onClick={() => remove(tag)} aria-label={`Remove tag ${tag}`}>
              ×
            </button>
          </span>
        ))}
        <input
          value={text}
          placeholder={value.length ? '' : 'Add tags — work, family, health…'}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            if (text.trim()) add(text);
          }}
          aria-label="Add tag"
        />
      </div>
      {focused && visibleSuggestions.length > 0 && (
        <div className="tag-suggestions">
          {visibleSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="tag"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => add(s)}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
