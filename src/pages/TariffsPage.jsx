import { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

export default function TariffsPage() {
  const { token } = useAuth();
  const [tariffs, setTariffs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [tariffData, vehicleData] = await Promise.all([
          apiRequest('/reference/tariffs', {}, token),
          apiRequest('/reference/vehicles', {}, token),
        ]);
        setTariffs(tariffData);
        setVehicles(vehicleData);
      } catch (err) {
        setError(err.message || 'Failed to load tariffs');
      }
    };
    load();
  }, [token]);

  const vehicleMap = useMemo(() => {
    const map = new Map();
    vehicles.forEach((vehicle) => {
      map.set(vehicle.id, vehicle.vehicle_name);
    });
    return map;
  }, [vehicles]);

  const rowData = useMemo(
    () =>
      tariffs.map((row) => ({
        ...row,
        vehicle_name: vehicleMap.get(row.vehicle_spec_id) || `#${row.vehicle_spec_id}`,
      })),
    [tariffs, vehicleMap]
  );

  const columnDefs = useMemo(
    () => [
      { headerName: 'Origin', field: 'origin', minWidth: 160, pinned: 'left' },
      { headerName: 'Destination Region', field: 'destination_region', minWidth: 180 },
      { headerName: 'Vehicle', field: 'vehicle_name', minWidth: 160 },
      {
        headerName: 'Base USD',
        field: 'base_price_usd',
        valueFormatter: (params) => `$${Number(params.value || 0).toLocaleString('en-US')}`,
      },
      {
        headerName: 'LCL USD/CBM',
        field: 'lcl_price_usd_per_cbm',
        valueFormatter: (params) => `$${Number(params.value || 0).toLocaleString('en-US')}`,
      },
      {
        headerName: 'Overweight USD/Ton',
        field: 'overweight_surcharge_usd_per_ton',
        valueFormatter: (params) => `$${Number(params.value || 0).toLocaleString('en-US')}`,
      },
      {
        headerName: 'Size Surcharge %',
        field: 'size_surcharge_pct',
        valueFormatter: (params) => `${params.value}%`,
      },
    ],
    []
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-slate-900">Tariff Matrix</h2>
        <p className="mt-1 text-sm text-slate-500">관리자 업로드 대상 요율 구조를 AG Grid에서 조회할 수 있습니다.</p>
      </div>

      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

      <div className="ag-theme-quartz h-[620px] w-full overflow-hidden rounded-xl border border-slate-200">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true, resizable: true, floatingFilter: true }}
          pagination
          paginationPageSize={20}
          animateRows
        />
      </div>
    </section>
  );
}
