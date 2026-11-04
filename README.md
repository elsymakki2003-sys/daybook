# Daybook — Journal & Todos

A minimal journal and todo list built with React + Vite. Data is saved in the browser's localStorage.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

## Structure

```
src/
  main.jsx               entry point
  App.jsx                layout + route table
  styles.css             design tokens & styles (light/dark)
  components/Nav.jsx     section navigation
  components/Toast.jsx   save / undo notifications
  components/journal/    MoodPicker, EnergyPicker, TagInput,
                         EntryEditor, EntryCard, JournalStats
  lib/journal.js         moods, dates, entry shape, streak & stats
  hooks/useHashRoute.js  tiny hash router (#/journal, #/todos)
  hooks/useLocalStorage.js  persisted state
  pages/Journal.jsx      check-in, editor, filters, entry list
  pages/Todos.jsx        todo list with filters
```

## Journal features

- Daily mood check-in: tap a mood to start an entry
- Entries hold mood, energy, title, free writing, three good things and tags
- Drafts autosave; close the editor and resume later
- Streak, 7-day average mood and a 14-day mood strip
- Search, filter by mood or tag; entries grouped by month
- Edit in place; delete with undo
- Shortcuts: Ctrl+Enter saves, Esc closes the editor

To add a section: create a page in `src/pages/` and add it to `ROUTES` in `App.jsx`.
