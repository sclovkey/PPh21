import React, { useState, useMemo } from 'react';
import { useApp, SalaryData } from '../context/AppContext';
import { calculateTERRate, calculateDecemberTax, PTKP_VALUES } from '../lib/pph21';
import { BrutalCard, BrutalButton } from './BrutalUI';
import { formatCurrency } from '../lib/utils';
import { Calculator, Save, TrendingUp } from 'lucide-react';

export const TaxCalculator: React.FC = () => {
  const { activeEmployee, salaries, addSalary } = useApp();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [salary, setSalary] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [thr, setThr] = useState(0);

  const totalGross = salary + allowance + bonus + thr;

  const currentCalculation = useMemo(() => {
    if (!activeEmployee) return null;
    
    if (month < 12) {
      const rate = calculateTERRate(totalGross, activeEmployee.category);
      const tax = totalGross * (rate / 100);
      return { pph21: tax, method: 'TER' as const, rate };
    } else {
      // December Calculation
      const taxPaidJanNov = salaries
        .filter(s => s.year === year && s.month < 12)
        .reduce((sum, s) => sum + s.pph21, 0);
      
      const annualGross = salaries
        .filter(s => s.year === year && s.month < 12)
        .reduce((sum, s) => sum + s.totalGross, 0) + totalGross;

      // Simplification: bj = 5% of gross, max 6m
      const bj = Math.min(6000000, annualGross * 0.05);
      const tax = calculateDecemberTax(annualGross, activeEmployee.status, taxPaidJanNov, bj);
      
      return { pph21: tax, method: 'PROGRESSIVE' as const, rate: 0 };
    }
  }, [activeEmployee, month, year, salary, allowance, bonus, thr, salaries, totalGross]);

  const handleSave = async () => {
    if (!activeEmployee || !currentCalculation) return;
    
    await addSalary({
      employeeId: activeEmployee.id,
      month,
      year,
      salary,
      allowance,
      bonus,
      thr,
      totalGross,
      pph21: currentCalculation.pph21,
      calculationMethod: currentCalculation.method,
    });

    // Reset inputs
    setSalary(0);
    setAllowance(0);
    setBonus(0);
    setThr(0);
  };

  if (!activeEmployee) {
    return (
      <div className="h-full flex items-center justify-center border-4 border-dashed border-black rounded-lg">
        <p className="font-bold text-xl italic opacity-40">Pilih Karyawan untuk Mulai</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-black uppercase italic leading-tight">{activeEmployee.name}</h2>
          <p className="font-mono text-[10px] md:text-sm opacity-60">PERHITUNGAN PPh 21 - {year}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <select 
            value={month} 
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="brutal-select font-bold flex-1 md:flex-none text-xs md:text-base"
          >
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={i+1}>
                {new Date(2024, i).toLocaleString('id-ID', {month: 'long'})}
              </option>
            ))}
          </select>
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="brutal-select font-bold flex-1 md:flex-none text-xs md:text-base"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrutalCard variant="white" className="space-y-4 p-4 md:p-6">
          <h3 className="font-black uppercase flex items-center gap-2 text-sm md:text-base">
            <Calculator className="w-5 h-5" /> Input Penghasilan
          </h3>
          <div className="space-y-4">
            <InputGroup label="Gaji Pokok" value={salary} onChange={setSalary} />
            <InputGroup label="Tunjangan Rutin" value={allowance} onChange={setAllowance} />
            <InputGroup label="Bonus / Insentif" value={bonus} onChange={setBonus} />
            <InputGroup label="THR" value={thr} onChange={setThr} />
          </div>
          <div className="pt-4 border-t-2 border-black">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">TOTAL GROSS</span>
              <span className="text-xl font-black">{formatCurrency(totalGross)}</span>
            </div>
            <BrutalButton variant="green" className="w-full flex items-center justify-center gap-2" onClick={handleSave}>
              <Save className="w-5 h-5" /> Simpan & Hitung
            </BrutalButton>
          </div>
        </BrutalCard>

        <div className="space-y-6">
          <BrutalCard variant={currentCalculation?.method === 'TER' ? 'blue' : 'pink'}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-black uppercase">Hasil Pajak</h3>
                <p className="text-[10px] md:text-xs font-mono">{currentCalculation?.method === 'TER' ? 'Metode TER (Jan-Nov)' : 'Metode Tahunan (Des)'}</p>
              </div>
              <TrendingUp className="w-6 h-6" />
            </div>
            
            <div className="text-2xl md:text-4xl font-black mb-2">
              {formatCurrency(currentCalculation?.pph21 || 0)}
            </div>
            
            {currentCalculation?.method === 'TER' && (
              <p className="text-xs md:text-sm font-bold">Tarif Efektif: {currentCalculation.rate}%</p>
            )}
            
            {currentCalculation?.method === 'PROGRESSIVE' && (
              <div className="text-[10px] md:text-xs space-y-1 mt-2 font-mono opacity-80">
                <p>Status: {activeEmployee.status}</p>
                <p>PTKP Setahun: {formatCurrency(PTKP_VALUES[activeEmployee.status])}</p>
              </div>
            )}
          </BrutalCard>

          <BrutalCard variant="white" className="p-0 overflow-hidden">
             <div className="bg-[#1a1a1a] text-white p-2 text-xs font-bold uppercase px-4">Riwayat Gaji {year}</div>
             <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-left font-mono text-sm">
                  <thead className="sticky top-0 bg-white border-b-2 border-black">
                    <tr>
                      <th className="p-2 px-4">Bulan</th>
                      <th className="p-2">Bruto</th>
                      <th className="p-2 pr-4 text-right">PPh 21</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaries.filter(s => s.year === year).map(s => (
                      <tr key={s.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-2 px-4">{new Date(2024, s.month - 1).toLocaleString('id-ID', {month: 'short'})}</td>
                        <td className="p-2">{formatCurrency(s.totalGross)}</td>
                        <td className="p-2 pr-4 text-right font-bold">{formatCurrency(s.pph21)}</td>
                      </tr>
                    ))}
                    {salaries.filter(s => s.year === year).length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-400">Belum ada data riwayat.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
          </BrutalCard>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold uppercase">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm">Rp</span>
      <input 
        type="number" 
        value={value || ''} 
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="brutal-input w-full pl-10"
        placeholder="0"
      />
    </div>
  </div>
);
