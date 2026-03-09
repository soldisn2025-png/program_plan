// ============================================================
// REAL FINANCIAL DATA — Sol & Kelly Family
// Last updated: Feb 2026
// Sol (41, b.1985) · Kelly (41, b.1984) · 태민/Eric (13, b.2013, ASD)
// Goal: Sol retires at 50 → Jan 1, 2035 → Korea
// ============================================================

// --- CURRENT ACCOUNT BALANCES (Feb 2026) ---
export const ACCOUNTS = [
  {
    id: '401k_sol',
    label: '401k (Sol)',
    institution: 'Fidelity',
    type: '401k' as const,
    current: 22735,
    target2035: 370000,
    color: '#3B82F6',
    icon: '🏦',
    note: 'Max $23,500 + 3% match ($3,900) = $27,400/yr',
    isTaxAdvantaged: true,
    isRoth: false,
    isPretax: true,
  },
  {
    id: 'rollover_ira_kelly',
    label: 'Rollover IRA (Kelly)',
    institution: 'Robinhood',
    type: 'ira' as const,
    current: 3414,
    target2035: 6500,
    color: '#94A3B8',
    icon: '📋',
    note: "Kelly's rollover IRA",
    isTaxAdvantaged: true,
    isRoth: false,
    isPretax: true,
  },
  {
    id: 'tira_sol',
    label: 'TIRA (Sol)',
    institution: 'Robinhood',
    type: 'ira' as const,
    current: 18976,
    target2035: 35000,
    color: '#64748B',
    icon: '📋',
    note: 'Traditional IRA — candidate for Roth conversion ladder',
    isTaxAdvantaged: true,
    isRoth: false,
    isPretax: true,
  },
  {
    id: 'rira_sol',
    label: 'Roth IRA (Sol)',
    institution: 'Robinhood',
    type: 'roth' as const,
    current: 34745,
    target2035: 249000,
    color: '#10B981',
    icon: '📈',
    note: '$7,000/yr · principal freely withdrawable · KEY asset at 50',
    isTaxAdvantaged: true,
    isRoth: true,
    isPretax: false,
  },
  {
    id: 'ira_kelly_robin',
    label: 'IRA (Kelly - Robin)',
    institution: 'Robinhood',
    type: 'ira' as const,
    current: 380,
    target2035: 700,
    color: '#64748B',
    icon: '📋',
    note: "Kelly's IRA",
    isTaxAdvantaged: true,
    isRoth: false,
    isPretax: true,
  },
  {
    id: 'ira_kelly_vang',
    label: 'IRA (Kelly - Vanguard)',
    institution: 'Vanguard',
    type: 'ira' as const,
    current: 10828,
    target2035: 20000,
    color: '#64748B',
    icon: '📋',
    note: "Kelly's Vanguard IRA",
    isTaxAdvantaged: true,
    isRoth: false,
    isPretax: true,
  },
  {
    id: 'hsa',
    label: 'HSA',
    institution: 'Various',
    type: 'hsa' as const,
    current: 2133,
    target2035: 7000,
    color: '#0EA5E9',
    icon: '🏥',
    note: 'Triple tax advantaged — save receipts for future reimbursement',
    isTaxAdvantaged: true,
    isRoth: false,
    isPretax: false,
  },
  {
    id: 'stock_sofi',
    label: 'Stock (SoFi)',
    institution: 'SoFi',
    type: 'brokerage' as const,
    current: 4668,
    target2035: 20000,
    color: '#F59E0B',
    icon: '📊',
    note: 'Taxable brokerage',
    isTaxAdvantaged: false,
    isRoth: false,
    isPretax: false,
  },
  {
    id: 'stock_etrade',
    label: 'Stock (E*Trade)',
    institution: 'E*Trade',
    type: 'brokerage' as const,
    current: 24073,
    target2035: 59000,
    color: '#F59E0B',
    icon: '📊',
    note: 'Taxable brokerage — bridge account for ages 50-59.5',
    isTaxAdvantaged: false,
    isRoth: false,
    isPretax: false,
  },
  {
    id: 'cash',
    label: 'Cash & Savings',
    institution: 'BofA / SoFi',
    type: 'depository' as const,
    current: 213,
    target2035: 30000,
    color: '#6366F1',
    icon: '💵',
    note: 'Emergency fund target: 6 months expenses',
    isTaxAdvantaged: false,
    isRoth: false,
    isPretax: false,
  },
  {
    id: 'crypto',
    label: 'Crypto',
    institution: 'Various',
    type: 'other' as const,
    current: 0,
    target2035: 0,
    color: '#F97316',
    icon: '₿',
    note: 'Currently $0',
    isTaxAdvantaged: false,
    isRoth: false,
    isPretax: false,
  },
]

// ABLE account — 태민 only, NOT retirement funds
export const ABLE_BALANCE = 21333

// Kelly's SNT — 태민 only, 3rd party, fully set up
export const SNT_STATUS = 'established' as const

// Home Equity
export const HOME_EQUITY = {
  value: 720000,
  mortgage: 312000,
  equity: 408000,
  mortgagePayoffDate: '2034-11',
  projected2035Value: 968000, // ~3% annual appreciation
  projected2035Equity: 968000, // fully paid off
}

// --- FINANCIAL SUMMARY ---
export function getFinancialSummary() {
  const investable = ACCOUNTS.filter(a => a.id !== 'home_equity')
  const totalInvestable = investable.reduce((s, a) => s + a.current, 0)
  const retirementAccounts = ACCOUNTS.filter(a => a.isTaxAdvantaged)
  const totalRetirement = retirementAccounts.reduce((s, a) => s + a.current, 0)
  const taxableAssets = ACCOUNTS.filter(a => !a.isTaxAdvantaged && a.id !== 'crypto')
  const totalTaxable = taxableAssets.reduce((s, a) => s + a.current, 0)

  return {
    totalNetWorth: totalInvestable + HOME_EQUITY.equity,
    totalInvestable,
    totalRetirement,
    totalTaxable,
    homeEquity: HOME_EQUITY.equity,
    // Sol's accessible assets at 50 (excluding Kelly's accounts and home)
    solAssets: ACCOUNTS.filter(a => ['401k_sol','rira_sol','tira_sol','stock_etrade','stock_sofi'].includes(a.id))
      .reduce((s, a) => s + a.current, 0),
  }
}

// --- HISTORICAL NET WORTH (monthly, Jan 2023 – Feb 2026) ---
// Source: family spreadsheet. $0 = data not recorded that month.
export const NET_WORTH_HISTORY = [
  { month: 'Jan 23', total: 276986 },
  { month: 'Feb 23', total: 288607 },
  { month: 'Apr 23', total: 287497 },
  { month: 'May 23', total: 312107 },
  { month: 'Jun 23', total: 321194 },
  { month: 'Aug 23', total: 322976 },
  { month: 'Oct 23', total: 325666 },
  { month: 'Nov 23', total: 379261 },
  { month: 'Dec 23', total: 405990 },
  { month: 'Jan 24', total: 426937 },
  { month: 'Feb 24', total: 433506 },
  { month: 'Mar 24', total: 472463 },
  { month: 'May 24', total: 484293 },
  { month: 'Jun 24', total: 522005 },
  { month: 'Jul 24', total: 527960 },
  { month: 'Sep 24', total: 553094 },
  { month: 'Oct 24', total: 556932 },
  { month: 'Nov 24', total: 596378 },
  { month: 'Jan 25', total: 603198 },
  { month: 'Mar 25', total: 610474 },
  { month: 'Jun 25', total: 652241 },
  { month: 'Jul 25', total: 661186 },
  { month: 'Sep 25', total: 663929 },
  { month: 'Oct 25', total: 654533 },
  { month: 'Nov 25', total: 653159 },
  { month: 'Jan 26', total: 617001 },
  { month: 'Feb 26', total: 610563 },
].filter(d => d.total > 0)

// --- PROJECTIONS 2035 ---
// 401k: $22,735 now + $27,400/yr (max + 3% match) × 9yr @ 7%
// Roth: $34,745 now + $7,000/yr × 9yr @ 7%
// Liquid: $28,741 @ 7%/yr
// Kelly accounts: $14,622 @ 7%/yr

export const PROJECTION_2035 = {
  sol401k: 370000,    // with max contributions + 3% match
  solRoth: 249000,    // with $7,000/yr contributions
  solLiquid: 79000,   // stocks + cash growing at 7%
  kellyAccounts: 77000,
  homeEquity: 968000, // fully paid off, ~3% appreciation
  totalSolUsable: 698000,  // 401k + Roth + liquid (excluding home + Kelly)
  totalFamilyNetWorth: 1646000,
}

// FI Number = 25 × annual Korea expenses
// Korea budget: $3,000/month = $36,000/yr → FI = $900,000
export const FI_NUMBER = 900000
export const KOREA_MONTHLY_BUDGET_USD = 3000
export const USD_TO_KRW = 1350

// --- KOREA CASHFLOW 2035 ---
export const KOREA_CASHFLOW = {
  income: [
    { label: '401k 72(t) SEPP', min: 1100, max: 1400, note: '패널티 없음, 9.5년 고정' },
    { label: 'Roth IRA 원금 인출', min: 600, max: 800, note: '~$34K 원금 한도 내' },
    { label: '유동자산 인출', min: 300, max: 500, note: '주식/저축 단계적 인출' },
    { label: '한국 부업/ABA', min: 0, max: 1500, note: '선택적 — 타이트 구간 핵심' },
  ],
  expense: [
    { label: '전원주택 월세 (수지 권역)', min: 900, max: 1200, note: '₩120-160만' },
    { label: '식비', min: 450, max: 600, note: '현지 마트+외식' },
    { label: '건강보험 (NHI)', min: 110, max: 300, note: '외국인 F-비자 기준' },
    { label: '부모님 케어 보조', min: 220, max: 500, note: '부모님 자산 우선, Sol 보조' },
    { label: '기타 (교통/통신/여가/항공)', min: 720, max: 1180, note: '미국 왕복 연 1-2회 포함' },
  ],
}

// --- 2026 ACTION ITEMS ---
export const ACTION_ITEMS_2026 = [
  { priority: 'HIGH' as const, text: '401k Max $23,500 기여 설정 확인', done: false },
  { priority: 'HIGH' as const, text: 'Roth IRA $7,000 즉시 기여 (Sol)', done: false },
  { priority: 'HIGH' as const, text: 'Roth Conversion Ladder 시작 (TIRA → Roth)', done: false },
  { priority: 'MED' as const, text: 'SNT 해외 활용 조항 서류 검토', done: true },
  { priority: 'MED' as const, text: 'SoFi + E*Trade 포트폴리오 리뷰', done: false },
  { priority: 'LOW' as const, text: 'ssa.gov Social Security 예상 수령액 확인', done: false },
]

// --- MILESTONES ---
export const MILESTONES = [
  { year: 2027, label: '🇺🇸 시민권', done: false },
  { year: 2031, label: '🔓 Roth 첫 수확', done: false },
  { year: 2034, label: '🏠 모기지 완납', done: false },
  { year: 2035, label: '✈️ 은퇴 귀국', done: false },
  { year: 2047, label: '💰 SS 수령', done: false },
]

// --- SCENARIOS ---
export const SCENARIOS = {
  A: {
    label: 'Sol 혼자 한국',
    year: 2035,
    age: 50,
    monthlyIncomeMin: 2000,
    monthlyIncomeMax: 3900,
    monthlyExpenseMin: 2400,
    monthlyExpenseMax: 3900,
    homeStatus: 'Kelly + 태민 버지니아 유지',
    sidework: '필수 ($500+/월)',
    ssNote: '62세(2047) 후 여유로움 ✅',
    verdict: '타이트하지만 가능',
    verdictOk: false,
  },
  B: {
    label: '55세 전원 귀국',
    year: 2040,
    age: 55,
    monthlyIncomeMin: 4800,
    monthlyIncomeMax: 6800,
    monthlyExpenseMin: 3700,
    monthlyExpenseMax: 6550,
    homeStatus: '매각 → $900K+ 현금화',
    sidework: 'Kelly 한국 ABA 창업',
    ssNote: '62세(2047) 후 여유로움 ✅✅',
    verdict: '집 매각이 핵심 엔진',
    verdictOk: true,
  },
}

// --- RISK MONITOR ---
export const RISKS = [
  { label: '50-62세 현금흐름', level: 3, note: '부업 필수', max: 3 },
  { label: '72(t) SEPP 고정액', level: 2, note: '인플레 취약', max: 3 },
  { label: '부모님 의료비', level: 2, note: '본인자산 우선', max: 3 },
  { label: '환율 변동 (원/달러)', level: 2, note: '달러 일부 유지', max: 3 },
  { label: '한국 ABA 공백', level: 1, note: 'Kelly 센터로 커버', max: 3 },
]

// --- 태민 STATUS ---
export const TAIMIN_STATUS = [
  { label: '미국 시민권', status: '2027 예정', ok: null as boolean | null },
  { label: 'SSI / Medicaid', status: '유지 중', ok: true },
  { label: 'ABLE 계좌', status: `$${ABLE_BALANCE.toLocaleString()}`, ok: true },
  { label: 'SNT (3rd Party)', status: '설립 완료', ok: true },
  { label: '한국 체류 (F-4→F-5)', status: '미확정', ok: null },
  { label: '한국 복지 (활동지원)', status: '사전 조사 필요', ok: null },
]

// --- KOREA EXPENSE BREAKDOWN ---
export const KOREA_EXPENSE_DETAIL = [
  { category: '주거 (수지구 외곽 전원주택 월세)', monthly: 950, notes: '₩128만, 자연환경 근접 (태민 위함)' },
  { category: '식비', monthly: 525, notes: '현지 식재료 + 외식 (₩71만)' },
  { category: 'NHI 건강보험', monthly: 200, notes: 'F-5 영주권자 기준, 실제 의료비는 저렴' },
  { category: '교통', monthly: 175, notes: '서울/수지 지하철+버스, KTX 가끔' },
  { category: '통신/공과금', monthly: 225, notes: '전기, 인터넷, 핸드폰' },
  { category: '부모님 케어 보조', monthly: 400, notes: '부모님 본인 자산 우선, Sol 보조분' },
  { category: '여가 / 기타', monthly: 275, notes: '취미, 의류, 잡비' },
  { category: '미국 왕복 항공 (월 배분)', monthly: 250, notes: '연 1-2회, 가족 방문' },
]

// Social Security estimate
export const SS_ESTIMATE = {
  age62: 1200,  // ~30% reduction, earliest
  age67: 1700,  // full retirement age
  age70: 2100,  // maximum, delayed credits
  eligibleYear: 2019, // started working July 2019
  yearsContributed: 16, // through 2035
  notes: '35년 평균, 나머지 19년 $0으로 채워짐 → 감액됨',
}
