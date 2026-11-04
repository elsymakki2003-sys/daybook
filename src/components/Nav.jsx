export default function Nav({ routes, current, onNavigate }) {
  return (
    <nav className="nav" aria-label="Sections">
      {Object.entries(routes).map(([key, { label }]) => (
        <a
          key={key}
          href={`#/${key}`}
          className={`nav-link${current === key ? ' active' : ''}`}
          aria-current={current === key ? 'page' : undefined}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(key);
          }}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
