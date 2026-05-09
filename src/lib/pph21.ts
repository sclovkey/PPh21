/**
 * PPh 21 Calculation Logic based on Indonesian Tax Regulations (PMK 168/2023)
 */

export type TaxStatus = 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';
export type TERCategory = 'A' | 'B' | 'C';

export const PTKP_VALUES: Record<TaxStatus, number> = {
  'TK/0': 54000000,
  'TK/1': 58500000,
  'TK/2': 63000000,
  'TK/3': 67500000,
  'K/0': 58500000,
  'K/1': 63000000,
  'K/2': 67500000,
  'K/3': 72000000,
};

export const getTERCategory = (status: TaxStatus): TERCategory => {
  if (['TK/0', 'TK/1', 'K/0'].includes(status)) return 'A';
  if (['TK/2', 'TK/3', 'K/1', 'K/2'].includes(status)) return 'B';
  return 'C';
};

// TER Rates (Simplified for implementation - real tables have many brackets)
// These represent the % based on gross income per month
const TER_A = [
  { limit: 5400000, rate: 0 },
  { limit: 5650000, rate: 0.25 },
  { limit: 5950000, rate: 0.5 },
  { limit: 6300000, rate: 0.75 },
  { limit: 6750000, rate: 1 },
  { limit: 7500000, rate: 1.25 },
  { limit: 8550000, rate: 1.5 },
  { limit: 9650000, rate: 1.75 },
  { limit: 10650000, rate: 2 },
  { limit: 12300000, rate: 2.5 },
  { limit: 15150000, rate: 3 },
  { limit: 18100000, rate: 4 },
  { limit: 21250000, rate: 5 },
  { limit: 25300000, rate: 6 },
  { limit: 31800000, rate: 7 },
  { limit: 42400000, rate: 8 },
  { limit: 57100000, rate: 9 },
  { limit: 75200000, rate: 10 },
  { limit: 103100000, rate: 12 },
  { limit: 154450000, rate: 15 },
  { limit: 201050000, rate: 17 },
  { limit: 303700000, rate: 19 },
  { limit: 477200000, rate: 21 },
  { limit: 666000000, rate: 23 },
  { limit: 874450000, rate: 25 },
  { limit: 1094000000, rate: 27 },
  { limit: 1400000000, rate: 29 },
  { limit: Infinity, rate: 34 },
];

const TER_B = [
  { limit: 6200000, rate: 0 },
  { limit: 6500000, rate: 0.25 },
  { limit: 6900000, rate: 0.5 },
  { limit: 7300000, rate: 0.75 },
  { limit: 7800000, rate: 1 },
  { limit: 8850000, rate: 1.25 },
  { limit: 9800000, rate: 1.5 },
  { limit: 10850000, rate: 1.75 },
  { limit: 11850000, rate: 2 },
  { limit: 14350000, rate: 2.5 },
  { limit: 17150000, rate: 3 },
  { limit: 19550000, rate: 4 },
  { limit: 22700000, rate: 5 },
  { limit: 26600000, rate: 6 },
  { limit: 33050000, rate: 7 },
  { limit: 43900000, rate: 8 },
  { limit: 59200000, rate: 9 },
  { limit: 77800000, rate: 10 },
  { limit: 106300000, rate: 12 },
  { limit: 158250000, rate: 15 },
  { limit: 206350000, rate: 17 },
  { limit: 312550000, rate: 19 },
  { limit: 492000000, rate: 21 },
  { limit: 687000000, rate: 23 },
  { limit: 902100000, rate: 25 },
  { limit: 1128500000, rate: 27 },
  { limit: 1445000000, rate: 29 },
  { limit: Infinity, rate: 34 },
];

const TER_C = [
  { limit: 6600000, rate: 0 },
  { limit: 6950000, rate: 0.25 },
  { limit: 7350000, rate: 0.5 },
  { limit: 7800000, rate: 0.75 },
  { limit: 8350000, rate: 1 },
  { limit: 9450000, rate: 1.25 },
  { limit: 10550000, rate: 1.5 },
  { limit: 11550000, rate: 1.75 },
  { limit: 12750000, rate: 2 },
  { limit: 15600000, rate: 2.5 },
  { limit: 18350000, rate: 3 },
  { limit: 21350000, rate: 4 },
  { limit: 24350000, rate: 5 },
  { limit: 29850000, rate: 6 },
  { limit: 36900000, rate: 7 },
  { limit: 48400000, rate: 8 },
  { limit: 64150000, rate: 9 },
  { limit: 82800000, rate: 10 },
  { limit: 111400000, rate: 12 },
  { limit: 165650000, rate: 15 },
  { limit: 215450000, rate: 17 },
  { limit: 327100000, rate: 19 },
  { limit: 512600000, rate: 21 },
  { limit: 718100000, rate: 23 },
  { limit: 945600000, rate: 25 },
  { limit: 1182600000, rate: 27 },
  { limit: 1515000000, rate: 29 },
  { limit: Infinity, rate: 34 },
];

export const calculateTERRate = (grossIncome: number, category: TERCategory): number => {
  const table = category === 'A' ? TER_A : category === 'B' ? TER_B : TER_C;
  for (const row of table) {
    if (grossIncome <= row.limit) return row.rate;
  }
  return 0;
};

export const calculateProgressiveTax = (taxableIncome: number): number => {
  if (taxableIncome <= 0) return 0;

  const brackets = [
    { limit: 60000000, rate: 0.05 },
    { limit: 190000000, rate: 0.15 }, // 250m - 60m
    { limit: 250000000, rate: 0.25 }, // 500m - 250m
    { limit: 4500000000, rate: 0.30 }, // 5b - 500m
    { limit: Infinity, rate: 0.35 },
  ];

  let tax = 0;
  let remaining = taxableIncome;

  for (const bracket of brackets) {
    const chunk = Math.min(remaining, bracket.limit);
    tax += chunk * bracket.rate;
    remaining -= chunk;
    if (remaining <= 0) break;
  }

  return tax;
};

export const calculateDecemberTax = (
  totalAnnualGross: number,
  status: TaxStatus,
  taxPaidJanNov: number,
  bj: number = 0, // Biaya Jabatan
  jht: number = 0 // Iuran JHT/Pensioen
): number => {
  // Annual calculation
  const ptkp = PTKP_VALUES[status];
  const netIncome = totalAnnualGross - bj - jht;
  const pkp = Math.max(0, netIncome - ptkp);
  const annualTax = calculateProgressiveTax(pkp);
  
  return annualTax - taxPaidJanNov;
};
