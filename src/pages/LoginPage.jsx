import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  { role: 'Admin', email: 'admin@inquiry.local', password: 'Admin123!' },
  { role: 'Agent A', email: 'agent.alpha@globalfreight.com', password: 'Agent123!' },
  { role: 'Agent B', email: 'agent.beta@oceangate.com', password: 'Agent123!' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('admin@inquiry.local');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-white">
      <div className="pointer-events-none absolute -top-36 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/30 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl lg:grid-cols-2">
        <section className="bg-slate-900 px-8 py-10 lg:px-12 lg:py-14">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Global Inland Freight</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight">
            Instant Inland Quotation for Korea Import Cargo
          </h1>
          <p className="mt-6 text-sm text-slate-300">
            Enter cargo dimensions, weight, CBM, and destination. The system auto-selects vehicle class,
            compares LCL/FTL, applies surcharge/discount, and returns printable quote data.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Demo JWT accounts</p>
            <div className="mt-3 space-y-2 text-sm text-slate-100">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-left hover:bg-white/10"
                >
                  <span className="font-medium">{account.role}</span>
                  <span className="text-xs text-slate-300">{account.email}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-8 py-10 text-slate-900 lg:px-12 lg:py-14">
          <h2 className="font-display text-2xl font-semibold">Sign in</h2>
          <p className="mt-2 text-sm text-slate-600">Use approved partner/admin account to access quotation console.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-emerald-200 focus:ring"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-emerald-200 focus:ring"
                required
              />
            </label>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
