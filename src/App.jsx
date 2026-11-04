import Nav from './components/Nav.jsx';
import Journal from './pages/Journal.jsx';
import Todos from './pages/Todos.jsx';
import { useHashRoute } from './hooks/useHashRoute.js';

const ROUTES = {
  journal: { label: 'Journal', component: Journal },
  todos: { label: 'Todos', component: Todos },
};

export default function App() {
  const [route, setRoute] = useHashRoute(Object.keys(ROUTES), 'journal');
  const Page = ROUTES[route].component;

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a href="#/journal" className="brand" onClick={(e) => { e.preventDefault(); setRoute('journal'); }}>
            <span className="brand-mark" aria-hidden="true" />
            Daybook
          </a>
          <Nav routes={ROUTES} current={route} onNavigate={setRoute} />
        </div>
      </header>
      <main className="main">
        <div key={route} className="page-transition">
          <Page />
        </div>
      </main>
    </div>
  );
}
