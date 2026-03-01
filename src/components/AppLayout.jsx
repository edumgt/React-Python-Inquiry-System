import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const baseNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/quotes', label: 'Quote List' },
  { to: '/quotes/new', label: 'New Quote' },
  { to: '/tariffs', label: 'Tariff Matrix' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();

  const navItems = user?.role === 'admin'
    ? [...baseNav, { to: '/admin/users', label: 'User Admin' }]
    : baseNav;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-6 py-8 lg:block">
          <Link to="/dashboard" className="block">
            <p className="font-display text-2xl font-semibold tracking-tight text-slate-900">Inland Inquiry</p>
            <p className="mt-2 text-sm text-slate-500">Korea Inland Freight Estimator</p>
          </Link>

          <nav className="mt-10 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Realtime inland quotation</p>
                <h1 className="font-display text-xl font-semibold text-slate-900">Operations Console</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  <p className="font-semibold leading-none">{user?.full_name}</p>
                  <p className="mt-1 text-xs text-slate-500">{user?.company_name}</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  onClick={logout}
                >
                  Sign out
                </button>
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => (
                <NavLink
                  key={`mobile-${item.to}`}
                  to={item.to}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
