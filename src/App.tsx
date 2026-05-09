import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { EmployeeList } from './components/EmployeeList';
import { TaxCalculator } from './components/TaxCalculator';
import { ReportsView } from './components/ReportsView';
import { BrutalButton, BrutalCard } from './components/BrutalUI';
import { LogIn, LogOut, Menu, Calculator as CalcIcon, Users, Settings, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

const AppContent: React.FC = () => {
  const { user, login, logout, loading, activeEmployee } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [activeView, setActiveView] = React.useState<'karyawan' | 'laporan'>('karyawan');

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [authError, setAuthError] = React.useState('');

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f0f0f0]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl font-black italic"
        >
          LOADING...
        </motion.div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await login(email, password);
    } catch (error: any) {
      setAuthError('Gagal masuk. Periksa kembali email dan password Anda.');
      console.error(error);
    }
  };

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center p-6 bg-[#ffde59]">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <BrutalCard className="max-w-md w-full text-center space-y-8 py-12">
            <div className="space-y-2">
              <h1 className="text-6xl font-black uppercase italic leading-none">PPh 21</h1>
              <p className="text-xl font-bold">Kalkulator Pajak TER & Progresif</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="font-black uppercase text-sm">Username / Email</label>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full brutal-input p-3 font-bold" 
                  placeholder="admin@pph21.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="font-black uppercase text-sm">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full brutal-input p-3 font-bold" 
                  placeholder="••••••••"
                  required
                />
              </div>

              {authError && (
                <div className="bg-red-200 border-2 border-black p-2 text-xs font-bold text-red-700">
                  {authError}
                </div>
              )}

              <BrutalButton type="submit" className="w-full py-4 text-xl flex items-center justify-center gap-3" variant="green">
                <LogIn /> Masuk
              </BrutalButton>
            </form>

            <p className="font-mono text-[10px] opacity-60">
              Gunakan akun yang telah terdaftar di sistem.
            </p>
          </BrutalCard>
        </motion.div>
        <footer className="mt-8 font-mono text-xs uppercase font-bold opacity-40">
          Built for Indonesian Tax Compliance 2024
        </footer>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'karyawan':
        return (
          <main className="flex-1 p-4 md:p-10 flex flex-col md:flex-row gap-6 md:gap-8 overflow-y-auto h-full items-stretch">
            <section className="w-full md:w-1/3 flex flex-col min-h-[300px] md:min-h-0">
              <EmployeeList />
            </section>

            <section className="flex-1 min-w-0 pb-10 md:pb-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeEmployee?.id || 'empty'}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 md:p-8 overflow-y-auto"
                >
                  <TaxCalculator key={activeEmployee?.id || 'calc-empty'} />
                </motion.div>
              </AnimatePresence>
            </section>
          </main>
        );
      case 'laporan':
        return <ReportsView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex flex-col md:flex-row h-screen overflow-hidden relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#bbf7d0] border-b-4 border-black p-4 flex justify-between items-center z-30">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-1">
            <CalcIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black italic pr-2">PPH 21</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: typeof window !== 'undefined' && window.innerWidth < 768 ? (isSidebarOpen ? 0 : -300) : (isCollapsed ? -300 : 0),
          width: isCollapsed ? 0 : 256
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed md:relative inset-y-0 left-0 bg-[#bbf7d0] border-r-4 border-black z-50 md:z-20 h-full overflow-hidden shrink-0",
          isCollapsed ? "border-r-0 px-0" : "p-4 md:p-6",
          "md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between mb-8 gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-2 shrink-0">
              <CalcIcon className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black italic pr-2 whitespace-nowrap">
              PPH 21
            </h1>
          </div>
          <button 
            onClick={() => {
              if (window.innerWidth < 768) setIsSidebarOpen(false);
              else setIsCollapsed(true);
            }}
            className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem 
            icon={<Users className="w-5 h-5" />} 
            label="Karyawan" 
            active={activeView === 'karyawan'} 
            onClick={() => { setActiveView('karyawan'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
          />
          <NavItem 
            icon={<FileText className="w-5 h-5" />} 
            label="Laporan" 
            active={activeView === 'laporan'}
            onClick={() => { setActiveView('laporan'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
          />
        </nav>

        <div className="mt-auto pt-6 border-t-2 border-black/10 flex flex-col gap-4">
           <div className="flex items-center gap-2 overflow-hidden">
             {user.photoURL ? (
               <img src={user.photoURL} className="w-10 h-10 border-2 border-black shrink-0" alt="avatar" />
             ) : (
               <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center font-black uppercase shrink-0">
                 {user.email?.charAt(0) || 'U'}
               </div>
             )}
             <div className="overflow-hidden">
                <p className="font-bold truncate text-sm">{user.displayName || user.email?.split('@')[0] || 'User'}</p>
                <p className="text-[10px] font-mono opacity-60 truncate">{user.email}</p>
             </div>
           </div>
           <BrutalButton onClick={logout} className="w-full text-xs py-2 whitespace-nowrap" variant="white">
             Keluar
           </BrutalButton>
        </div>
      </motion.aside>

      {/* Floating Toggle Button when Sidebar is Hidden (Desktop) */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed top-4 left-4 md:top-6 md:left-6 z-40"
          >
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-3 bg-[#bbf7d0] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "flex-1 h-full overflow-hidden transition-all duration-300",
            isCollapsed && "pl-16 md:pl-16" // Shifted right enough to clear the floating button
          )}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 md:gap-3 p-2 md:p-3 font-bold transition-all border-2 border-transparent uppercase text-[10px] md:text-sm whitespace-nowrap w-full text-left",
      active ? "bg-black text-white border-black" : "hover:bg-black/5"
    )}
  >
    {icon}
    {label}
  </button>
);

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
