import { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// AG Grid Community 기능 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * 민감정보 노출을 줄이기 위한 문자열 마스킹 유틸.
 * - 앞 1글자만 남기고 나머지는 * 처리
 * - 한 글자 문자열은 그대로 반환
 */
const maskText = (value) => {
  const text = `${value ?? ""}`;
  if (text.length <= 1) return text;
  return `${text[0]}${"*".repeat(text.length - 1)}`;
};

function App() {
  // 컬럼 이동 이벤트 시 현재 컬럼 상태를 참조하기 위한 ref
  const columnApiRef = useRef(null);

  // 그리드 기본 동작: 정렬/필터/리사이즈 + 피벗/그룹/값 집계 활성화
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      movable: true,
      enablePivot: true,
      enableRowGroup: true,
      enableValue: true,
    }),
    []
  );

  // 50개 도시 샘플 데이터를 생성 (학습용 랜덤 데이터)
  const rowData = useMemo(() => {
    const cities = [
      "서울", "뉴욕", "런던", "파리", "도쿄", "베를린", "시드니", "케이프타운", "리우데자네이루", "모스크바",
      "방콕", "델리", "베이징", "토론토", "로마", "이스탄불", "멕시코시티", "마드리드", "두바이", "싱가포르",
      "홍콩", "자카르타", "카이로", "부에노스아이레스", "나이로비", "암스테르담", "헬싱키", "오슬로", "스톡홀름", "코펜하겐",
      "프라하", "부다페스트", "바르샤바", "리마", "보고타", "카라치", "테헤란", "하노이", "마닐라", "카트만두",
      "헝가리", "베오그라드", "키예프", "타슈켄트", "알마티", "울란바토르", "호놀룰루", "샌프란시스코", "밴쿠버", "멜버른",
    ];

    return cities.map((city) => {
      const monthly = {};
      for (let i = 1; i <= 12; i++) {
        monthly[`${i}월`] = Math.floor(Math.random() * 300); // 0~300mm
      }
      return { 도시: city, ...monthly };
    });
  }, []);

  // 1월~12월 + 합계 컬럼을 동적으로 구성
  const columnDefs = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      headerName: `${i + 1}월`,
      field: `${i + 1}월`,
      type: "numberColumn",
    }));

    return [
      {
        headerName: "도시",
        field: "도시",
        pinned: "left",
        // UI 노출 시 도시명 마스킹 처리
        valueFormatter: (params) => maskText(params.value),
      },
      ...months,
      {
        headerName: "합계",
        field: "합계",
        pinned: "right",
        // 각 행의 12개월 값을 합산하여 합계 컬럼 계산
        valueGetter: (params) => {
          let sum = 0;
          for (let i = 1; i <= 12; i++) {
            sum += params.data?.[`${i}월`] || 0;
          }
          return sum;
        },
        cellStyle: { fontWeight: "bold", backgroundColor: "#f0f8ff" },
      },
    ];
  }, []);

  // 하단 고정 합계 행(월별 총합 + 전체 합계)
  const pinnedBottomRowData = useMemo(() => {
    const totals = {};
    for (let i = 1; i <= 12; i++) {
      totals[`${i}월`] = rowData.reduce((sum, row) => sum + row[`${i}월`], 0);
    }
    totals["합계"] = Object.values(totals).reduce((a, b) => a + b, 0);
    totals["도시"] = "총합";
    return [totals];
  }, [rowData]);

  // 그리드 초기화 시 저장된 컬럼 상태를 복원
  const onGridReady = (params) => {
    columnApiRef.current = params.columnApi;

    const savedState = localStorage.getItem("columnState");
    if (savedState) {
      params.columnApi.applyColumnState({
        state: JSON.parse(savedState),
        applyOrder: true,
      });
    }
  };

  // 컬럼 이동이 발생하면 상태를 로컬에 저장
  // (민감정보가 아닌 레이아웃 상태만 저장)
  const onColumnMoved = () => {
    if (columnApiRef.current) {
      const columnState = columnApiRef.current.getColumnState();
      if (columnState.length > 0) {
        localStorage.setItem("columnState", JSON.stringify(columnState));
      }
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>
        🌧️ 도시별 월별 강우량 데이터 (AG Grid v34 - Pivot 지원)
      </h1>

      <div
        className="ag-theme-alpine"
        style={{ height: 600, width: "90%", margin: "0 auto" }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          theme="legacy"
          onGridReady={onGridReady}
          onColumnMoved={onColumnMoved}
          pinnedBottomRowData={pinnedBottomRowData}
          // 컬럼/필터/피벗 제어를 위한 사이드바 활성화
          sideBar={true}
        />
      </div>
    </div>
  );
}

export default App;
