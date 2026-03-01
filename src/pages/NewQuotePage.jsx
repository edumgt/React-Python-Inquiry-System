import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

const INITIAL_FORM = {
  origin: 'Busan Port',
  destination_region: 'Seoul Metro',
  destination_address: '101 Teheran-ro, Gangnam-gu, Seoul, KR',
  package_count: 10,
  total_weight_kg: 1450,
  total_cbm: 8.4,
  cargo_length_cm: 380,
  cargo_width_cm: 170,
  cargo_height_cm: 170,
};

export default function NewQuotePage() {
  const { token } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [rawText, setRawText] = useState(
    'Busan to Seoul, 12 packages, 1480kg, 8.5cbm, size 380x170x170cm\nAddress: 101 Teheran-ro, Gangnam-gu, Seoul, KR'
  );
  const [tariffs, setTariffs] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest('/reference/tariffs', {}, token);
        setTariffs(data);
      } catch (err) {
        setError(err.message || 'Failed to load tariff references');
      }
    };
    load();
  }, [token]);

  const origins = useMemo(() => [...new Set(tariffs.map((item) => item.origin))], [tariffs]);
  const destinations = useMemo(() => [...new Set(tariffs.map((item) => item.destination_region))], [tariffs]);

  const onChange = (event) => {
    const { name, value, type } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);
    try {
      const response = await apiRequest('/quotes/calculate', {
        method: 'POST',
        body: JSON.stringify(form),
      }, token);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Quote creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onParse = async () => {
    setError('');
    setParsing(true);
    try {
      const parsed = await apiRequest('/quotes/parse-text', {
        method: 'POST',
        body: JSON.stringify({ raw_text: rawText }),
      }, token);

      setForm((prev) => ({
        ...prev,
        ...parsed,
      }));
    } catch (err) {
      setError(err.message || 'Auto parse failed');
    } finally {
      setParsing(false);
    }
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-slate-900">Create New Quotation</h2>
        <p className="mt-1 text-sm text-slate-500">입력값을 저장하면 차량 자동 매칭 + LCL/FTL 비교 후 견적이 발행됩니다.</p>

        <div className="mt-6 space-y-3">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Optional Auto Parse (copy email/message text)</span>
            <textarea
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
            />
          </label>
          <button
            type="button"
            onClick={onParse}
            disabled={parsing}
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
          >
            {parsing ? 'Parsing...' : 'Parse Text Into Fields'}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Origin Port</span>
            <select
              name="origin"
              value={form.origin}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
            >
              {origins.map((origin) => (
                <option key={origin} value={origin}>{origin}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Destination Region</span>
            <select
              name="destination_region"
              value={form.destination_region}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
            >
              {destinations.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium text-slate-700">Destination Address (EN)</span>
            <input
              type="text"
              name="destination_address"
              value={form.destination_address}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
              required
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Package Count</span>
            <input type="number" name="package_count" min="1" value={form.package_count} onChange={onChange} className="field-input" required />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Total Weight (kg)</span>
            <input type="number" name="total_weight_kg" min="1" step="0.1" value={form.total_weight_kg} onChange={onChange} className="field-input" required />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Total CBM</span>
            <input type="number" name="total_cbm" min="0.1" step="0.1" value={form.total_cbm} onChange={onChange} className="field-input" required />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Cargo Length (cm)</span>
            <input type="number" name="cargo_length_cm" min="1" value={form.cargo_length_cm} onChange={onChange} className="field-input" required />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Cargo Width (cm)</span>
            <input type="number" name="cargo_width_cm" min="1" value={form.cargo_width_cm} onChange={onChange} className="field-input" required />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Cargo Height (cm)</span>
            <input type="number" name="cargo_height_cm" min="1" value={form.cargo_height_cm} onChange={onChange} className="field-input" required />
          </label>
        </div>

        {error && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-70"
        >
          {submitting ? 'Calculating...' : 'Calculate & Issue Quote'}
        </button>
      </form>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-slate-900">Result</h3>
          {!result ? (
            <p className="mt-4 text-sm text-slate-500">견적 발행 후 상세 계산 결과가 표시됩니다.</p>
          ) : (
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Quote No</p>
                <p className="mt-1 font-semibold text-slate-900">{result.quote_no}</p>
              </div>
              <p><span className="font-medium">Mode:</span> {result.service_mode}</p>
              <p><span className="font-medium">Subtotal:</span> ${result.subtotal_usd.toLocaleString('en-US')}</p>
              <p><span className="font-medium">Surcharge:</span> ${result.surcharge_usd.toLocaleString('en-US')}</p>
              <p><span className="font-medium">Discount:</span> -${result.discount_usd.toLocaleString('en-US')}</p>
              <p className="text-base font-semibold text-slate-900">Final: ${result.final_usd.toLocaleString('en-US')} ({result.final_krw.toLocaleString('ko-KR')} KRW)</p>
              <p>
                <span className="font-medium">Oversize:</span>{' '}
                {result.pricing_breakdown?.oversize ? 'Yes (size surcharge applied)' : 'No'}
              </p>
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}
