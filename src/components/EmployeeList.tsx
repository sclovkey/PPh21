import React, { useState } from 'react';
import { useApp, Employee } from '../context/AppContext';
import { BrutalCard, BrutalButton } from './BrutalUI';
import { getTERCategory } from '../lib/pph21';
import { Plus, Trash2, User } from 'lucide-react';
import { cn } from '../lib/utils';

export const EmployeeList: React.FC = () => {
  const { employees, activeEmployee, setActiveEmployee, deleteEmployee, addEmployee } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStatus, setNewStatus] = useState<Employee['status']>('TK/0');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    await addEmployee({
      name: newName,
      status: newStatus,
      npwp: '',
      category: getTERCategory(newStatus),
      joinDate: new Date().toISOString().split('T')[0],
    });
    setNewName('');
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-black uppercase italic">Karyawan</h2>
        <BrutalButton variant="green" onClick={() => setShowAddForm(!showAddForm)} className="p-2 md:p-3">
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
        </BrutalButton>
      </div>

      {showAddForm && (
        <BrutalCard variant="yellow" className="mb-4 p-4 md:p-6">
          <form onSubmit={handleAdd} className="flex flex-col gap-3 md:gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] md:text-xs font-bold uppercase">Nama Lengkap</label>
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                className="brutal-input text-sm md:text-base"
                placeholder="Ex: Hillary Bale"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] md:text-xs font-bold uppercase">Status Pajak (PTKP)</label>
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value as Employee['status'])}
                className="brutal-select text-sm md:text-base"
              >
                <option value="TK/0">TK/0</option>
                <option value="TK/1">TK/1</option>
                <option value="TK/2">TK/2</option>
                <option value="TK/3">TK/3</option>
                <option value="K/0">K/0</option>
                <option value="K/1">K/1</option>
                <option value="K/2">K/2</option>
                <option value="K/3">K/3</option>
              </select>
            </div>
            <BrutalButton type="submit" variant="white">Simpan Karyawan</BrutalButton>
          </form>
        </BrutalCard>
      )}

      <div className="space-y-3">
        {employees.length === 0 && (
          <p className="text-center py-8 text-gray-500 font-medium">Belum ada karyawan.</p>
        )}
        {employees.map((emp) => (
          <div 
            key={emp.id}
            onClick={() => setActiveEmployee(emp)}
            className={cn(
              "brutal-card p-4 cursor-pointer flex justify-between items-center group",
              activeEmployee?.id === emp.id ? "bg-[#ffde59]" : "bg-white"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">{emp.name}</h3>
                <p className="text-xs font-mono uppercase opacity-70">{emp.status} - Kategori {emp.category}</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Hapus karyawan ini?')) deleteEmployee(emp.id);
              }}
              className="p-2 hover:bg-red-400 border-2 border-transparent hover:border-black transition-all rounded opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
