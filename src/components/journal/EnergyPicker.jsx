import { ENERGY } from '../../lib/journal.js';

export default function EnergyPicker({ value, onChange }) {
  return (
    <div className="energy-picker">
      <div className="energy-bars" role="radiogroup" aria-label="Energy">
        {ENERGY.map((label, i) => {
          const level = i + 1;
          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={value === level}
              aria-label={label}
              title={label}
              className={`energy-bar${value != null && level <= value ? ' on' : ''}`}
              onClick={() => onChange(value === level ? null : level)}
            >
              <span style={{ height: `${8 + level * 5}px` }} />
            </button>
          );
        })}
      </div>
      <span className={`energy-value${value ? '' : ' unset'}`}>{value ? ENERGY[value - 1] : 'Not set'}</span>
    </div>
  );
}
