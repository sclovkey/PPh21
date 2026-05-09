import React, { useState, useEffect } from 'react';
import { useApp, SalaryData, Employee } from '../context/AppContext';
import { BrutalCard } from './BrutalUI';
import { formatCurrency, cn } from '../lib/utils';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileText, Download, Filter } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { employees } = useApp();
  const [allSalaries, setAllSalaries] = useState<(SalaryData & { employeeName: string })[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const salariesData: (SalaryData & { employeeName: string })[] = [];
        
        for (const emp of employees) {
          const q = query(
            collection(db, 'employees', emp.id, 'salaries'),
            orderBy('year', 'desc'),
            orderBy('month', 'desc')
          );
          const snapshot = await getDocs(q);
          snapshot.forEach(doc => {
            salariesData.push({ 
              id: doc.id, 
              ...doc.data() as SalaryData, 
              employeeName: emp.name 
            });
          });
        }
        
        setAllSalaries(salariesData);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (employees.length > 0) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [employees]);

  const filteredSalaries = allSalaries.filter(s => s.year === year);

  return (
    <div className="p-4 md:p-10 h-full overflow-y-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black uppercase italic leading-none">Laporan Pajak</h2>
          <p className="font-mono text-sm opacity-60">REKAPITULASI PPh 21 KESELURUHAN</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="brutal-select font-bold flex-1 md:flex-none"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
          <button className="brutal-button bg-[#bbf7d0] flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <BrutalCard variant="white" className="p-0 overflow-hidden">
        <div className="bg-[#1a1a1a] text-white p-4 font-bold uppercase flex justify-between items-center">
          <span>Daftar Perhitungan {year}</span>
          <Filter className="w-4 h-4" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead className="bg-[#f0f0f0] border-b-2 border-black">
              <tr>
                <th className="p-4">Karyawan</th>
                <th className="p-4">Bulan</th>
                <th className="p-4">Gaji Bruto</th>
                <th className="p-4">Metode</th>
                <th className="p-4 text-right">PPh 21</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center animate-pulse">Memuat data laporan...</td></tr>
              ) : filteredSalaries.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center opacity-40 italic">Belum ada data untuk tahun ini.</td></tr>
              ) : (
                filteredSalaries.map((s) => (
                  <tr key={`${s.employeeId}-${s.id}`} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold">{s.employeeName}</td>
                    <td className="p-4 uppercase">{new Date(2024, s.month - 1).toLocaleString('id-ID', {month: 'long'})}</td>
                    <td className="p-4">{formatCurrency(s.totalGross)}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-0.5 border border-black text-[10px] font-black",
                        s.calculationMethod === 'TER' ? "bg-blue-200" : "bg-pink-200"
                      )}>
                        {s.calculationMethod}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black">{formatCurrency(s.pph21)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredSalaries.length > 0 && (
              <tfoot className="bg-[#f0f0f0] border-t-2 border-black font-black">
                <tr>
                  <td colSpan={4} className="p-4 text-right">TOTAL PPH 21 TAHUN {year}</td>
                  <td className="p-4 text-right">
                    {formatCurrency(filteredSalaries.reduce((sum, s) => sum + s.pph21, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </BrutalCard>
    </div>
  );
};
