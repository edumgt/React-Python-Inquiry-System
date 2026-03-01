import { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

const usdFormatter = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

export default function QuotesPage() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const query = user?.role === 'admin' ? '?include_all=true' : '';
        const data = await apiRequest(`/quotes${query}`, {}, token);
        setRows(data);
      } catch (err) {
        setError(err.message || 'Failed to load quotes');
      }
    };
    load();
  }, [token, user]);

  const columnDefs = useMemo(
    () => [
      { headerName: 'Quote No', field: 'quote_no', pinned: 'left', minWidth: 180 },
      {
        headerName: 'Created',
        field: 'created_at',
        minWidth: 170,
        valueFormatter: (params) => new Date(params.value).toLocaleString(),
      },
      {
        headerName: 'Route',
        minWidth: 240,
        valueGetter: (params) => `${params.data.origin} → ${params.data.destination_region}`,
      },
      { headerName: 'Packages', field: 'package_count', type: 'numericColumn', maxWidth: 130 },
      { headerName: 'Weight(kg)', field: 'total_weight_kg', type: 'numericColumn', minWidth: 130 },
      { headerName: 'CBM', field: 'total_cbm', type: 'numericColumn', maxWidth: 110 },
      { headerName: 'Mode', field: 'service_mode', maxWidth: 110 },
      { headerName: 'USD', field: 'final_usd', minWidth: 120, valueFormatter: (params) => usdFormatter(params.value) },
      {
        headerName: 'KRW',
        field: 'final_krw',
        minWidth: 130,
        valueFormatter: (params) => Number(params.value || 0).toLocaleString('ko-KR'),
      },
      { headerName: 'Status', field: 'status', maxWidth: 130 },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
    }),
    []
  );

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">Issued Quote List</h2>
            <p className="mt-1 text-sm text-slate-500">AG Grid Community 기반 견적 목록 (정렬/필터/컬럼 리사이즈 지원)</p>
          </div>
          <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">Rows: {rows.length}</span>
        </div>

        {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        <div className="ag-theme-quartz h-[620px] w-full overflow-hidden rounded-xl border border-slate-200">
          <AgGridReact
            rowData={rows}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination
            paginationPageSize={20}
            animateRows
          />
        </div>
      </div>
    </section>
  );
}
