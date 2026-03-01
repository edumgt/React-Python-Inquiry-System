import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">404</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">Page not found</h2>
        <Link to="/dashboard" className="mt-5 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
