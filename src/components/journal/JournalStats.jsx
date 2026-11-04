import { addDays, averageMood, computeStreak, toKey } from '../../lib/journal.js';

export default function JournalStats({ entries }) {
  const streak = computeStreak(entries);

  const weekStart = toKey(addDays(new Date(), -6));
  const weekMood = averageMood(entries.filter((e) => e.date >= weekStart && e.mood).map((e) => e.mood));

  const moodsByDay = new Map();
  for (const e of entries) {
    if (!e.mood) continue;
    moodsByDay.set(e.date, [...(moodsByDay.get(e.date) ?? []), e.mood]);
  }
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i - 13);
    const moods = moodsByDay.get(toKey(d));
    return { key: toKey(d), d, mood: moods ? averageMood(moods) : null };
  });

  return (
    <div className="stats">
      <div className="card stat">
        <span className="stat-label">Entries</span>
        <span className="stat-value">{entries.length}</span>
      </div>
      <div className="card stat">
        <span className="stat-label">Day streak</span>
        <span className="stat-value">{streak}</span>
      </div>
      <div className="card stat">
        <span className="stat-label">Mood · 7 days</span>
        <span className="stat-value">
          {weekMood ? (
            <>
              <span aria-hidden="true">{weekMood.emoji}</span> {weekMood.label}
            </>
          ) : (
            '—'
          )}
        </span>
      </div>
      <div className="card stat stat-wide">
        <span className="stat-label">Last 14 days</span>
        <div className="mood-dots">
          {days.map((day) => (
            <span
              key={day.key}
              className={`dot${day.mood ? ' has' : ''}`}
              style={day.mood ? { '--mood': day.mood.color } : undefined}
              title={`${day.d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${
                day.mood ? day.mood.label : 'no mood logged'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
