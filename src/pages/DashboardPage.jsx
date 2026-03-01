import { useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryData, rateData] = await Promise.all([
          apiRequest('/dashboard/summary', {}, token),
          apiRequest('/reference/exchange-rate', {}, token),
        ]);
        setSummary(summaryData);
        setExchangeRate(rateData);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      }
    };

    load();
  }, [token]);

  const stats = useMemo(() => {
    if (!summary) return [];
    return [
      {
        label: 'Total Quotes',
        value: summary.total_quotes,
        hint: 'All issued quotations in current scope',
      },
      {
        label: 'This Month',
        value: summary.quotes_this_month,
        hint: 'Quotes generated in this month',
      },
      {
        label: 'Average Quote',
        value: usd.format(summary.avg_quote_usd || 0),
        hint: 'Mean final quoted amount (USD)',
      },
      {
        label: 'LCL Ratio',
        value: `${summary.lcl_ratio_pct}%`,
        hint: 'Share of LCL among all quotes',
      },
    ];
  }, [summary]);

  if (error) {
    return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-slate-900">Latest quotations</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.15em] text-slate-500">
                  <th className="px-3 py-2">Quote No</th>
                  <th className="px-3 py-2">Route</th>
                  <th className="px-3 py-2">Mode</th>
                  <th className="px-3 py-2">USD</th>
                </tr>
              </thead>
              <tbody>
                {summary?.latest_quotes?.map((quote) => (
                  <tr key={quote.id} className="border-b border-slate-100 text-slate-700">
                    <td className="px-3 py-2 font-medium text-slate-900">{quote.quote_no}</td>
                    <td className="px-3 py-2">{quote.origin} → {quote.destination_region}</td>
                    <td className="px-3 py-2">{quote.service_mode}</td>
                    <td className="px-3 py-2">{usd.format(quote.final_usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-slate-900">Rate Snapshot</h2>
          <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Current FX</p>
            <p className="mt-2 font-display text-3xl font-semibold text-emerald-900">
              {exchangeRate?.currency}/{exchangeRate?.rate_to_krw?.toLocaleString('en-US')} KRW
            </p>
            <p className="mt-2 text-sm text-emerald-800">
              Updated at: {exchangeRate?.updated_at ? new Date(exchangeRate.updated_at).toLocaleString() : '-'}
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Operational Guide</p>
            <ul className="mt-2 space-y-1">
              <li>1. 신규 요청은 <strong>New Quote</strong> 메뉴에서 입력합니다.</li>
              <li>2. LCL/FTL 자동 비교 결과를 확인하고 발행합니다.</li>
              <li>3. 요율 기준 확인은 <strong>Tariff Matrix</strong>에서 조회합니다.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
