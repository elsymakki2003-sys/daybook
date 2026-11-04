import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const FILTERS = {
  all: () => true,
  active: (t) => !t.done,
  done: (t) => t.done,
};

export default function Todos() {
  const [todos, setTodos] = useLocalStorage('todos.items', []);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('all');

  const addTodo = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setTodos([...todos, { id: crypto.randomUUID(), text: text.trim(), done: false }]);
    setText('');
  };

  const toggle = (id) => setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id) => setTodos(todos.filter((t) => t.id !== id));
  const clearDone = () => setTodos(todos.filter((t) => !t.done));

  const visible = todos.filter(FILTERS[filter]);
  const remaining = todos.filter((t) => !t.done).length;

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Today’s focus</p>
          <h2 className="page-title">Todos</h2>
          <p className="page-sub">
            {todos.length === 0
              ? 'Add your first task below.'
              : remaining === 0
                ? 'All done — nice work.'
                : `${remaining} ${remaining === 1 ? 'task' : 'tasks'} to go`}
          </p>
        </div>
      </div>

      <form className="card add-row" onSubmit={addTodo}>
        <input
          className="input"
          placeholder="Add a task…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn primary" type="submit" disabled={!text.trim()}>
          Add
        </button>
      </form>

      <div className="toolbar">
        <div className="segmented" role="tablist" aria-label="Filter tasks">
          {Object.keys(FILTERS).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              className={`seg${filter === key ? ' active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {key[0].toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        <span className="meta">{remaining} left</span>
      </div>

      {visible.length === 0 ? (
        <p className="empty">{todos.length === 0 ? 'Nothing to do yet.' : 'No tasks in this view.'}</p>
      ) : (
        <ul className="card list todo-list">
          {visible.map((t) => (
            <li key={t.id} className={`todo${t.done ? ' done' : ''}`}>
              <label className="todo-label">
                <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
                <span>{t.text}</span>
              </label>
              <button className="btn ghost icon" onClick={() => remove(t.id)} aria-label={`Delete ${t.text}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {todos.some((t) => t.done) && (
        <div className="row-end">
          <button className="btn ghost" onClick={clearDone}>Clear completed</button>
        </div>
      )}
    </section>
  );
}
