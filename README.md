# my-aggrid-app

React + Vite 기반으로 만든 **AG Grid v34 데모 애플리케이션**입니다. 월별 강우량 데이터를 표 형태로 보여주며, 피벗/그룹/정렬/필터/컬럼 이동/컬럼 상태 저장 같은 실무형 그리드 기능을 확인할 수 있습니다.

## 1) 기술 스택

- **Frontend**: React 19, React DOM 19
- **Build Tool**: Vite 7
- **Grid**: AG Grid Community 34
- **Lint**: ESLint 9

## 2) 핵심 기능

- **12개월 동적 컬럼 생성**: `useMemo`로 1월~12월 컬럼을 동적으로 구성
- **합계 컬럼 계산**: `valueGetter`를 통해 각 행의 월별 합계를 실시간 계산
- **피벗/그룹/집계 활성화**: `defaultColDef`에서 `enablePivot`, `enableRowGroup`, `enableValue` 설정
- **하단 고정 합계 행**: `pinnedBottomRowData`로 월별 총합 및 전체 합계 제공
- **컬럼 상태 저장/복원**: 컬럼 이동 결과를 `localStorage`에 저장 후 재접속 시 복원
- **사이드바 제공**: 컬럼/필터/피벗 설정 패널 사용 가능

## 3) 민감정보(개인정보/비밀값) 마스킹 정책

이 프로젝트는 학습용 샘플 데이터만 사용하며, 실제 개인정보/비밀키를 저장하지 않습니다.

그래도 웹 소스 레벨에서 아래 원칙을 적용했습니다.

1. **도시명 표시 마스킹**
   - UI에는 도시명을 앞 1글자만 유지하고 나머지를 `*`로 표시합니다.
   - 예: `서울 -> 서*`, `런던 -> 런*`
2. **로컬 저장 최소화**
   - `localStorage`에는 컬럼 위치/너비 등 레이아웃 상태만 저장합니다.
   - API Key, 토큰, 계정 정보와 같은 민감값은 저장하지 않습니다.
3. **문서 예시 마스킹**
   - 문서 내 예시로 민감값을 써야 한다면 반드시 `****` 형태로 마스킹합니다.

## 4) 프로젝트 구조

```text
my-aggrid-app/
├─ public/
├─ src/
│  ├─ App.jsx        # AG Grid 화면 및 데이터/이벤트 로직
│  ├─ main.jsx       # React 엔트리 포인트
│  └─ index.css      # 전역 스타일
├─ index.html
├─ package.json
└─ vite.config.js
```

## 5) 실행 방법

```bash
npm install
npm run dev
```

- 개발 서버 기본 주소: `http://localhost:5173`

## 6) 빌드 및 검증

```bash
npm run lint
npm run build
npm run preview
```

## 7) 확장 아이디어

- 실제 API 연동 및 서버 페이징
- CSV/Excel Export
- 사용자별 컬럼 레이아웃 동기화(백엔드 저장)
- 다국어(i18n) 및 단위 포맷터 강화
