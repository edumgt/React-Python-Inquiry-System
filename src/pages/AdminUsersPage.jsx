import { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest('/admin/users', {}, token);
        setRows(data);
      } catch (err) {
        setError(err.message || 'Failed to load users');
      }
    };
    load();
  }, [token]);

  const columnDefs = useMemo(
    () => [
      { headerName: 'Name', field: 'full_name', minWidth: 170, pinned: 'left' },
      { headerName: 'Email', field: 'email', minWidth: 260 },
      { headerName: 'Company', field: 'company_name', minWidth: 220 },
      { headerName: 'Role', field: 'role', maxWidth: 130 },
      { headerName: 'Tier', field: 'tier', maxWidth: 130 },
      {
        headerName: 'Active',
        field: 'is_active',
        maxWidth: 120,
        valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
      },
    ],
    []
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">User Administration</h2>
          <p className="mt-1 text-sm text-slate-500">승인 사용자 계정/등급/권한 조회 화면 (Admin Only)</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

      <div className="ag-theme-quartz h-[620px] w-full overflow-hidden rounded-xl border border-slate-200">
        <AgGridReact
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true, resizable: true, floatingFilter: true }}
          pagination
          paginationPageSize={20}
        />
      </div>
    </section>
  );
}
