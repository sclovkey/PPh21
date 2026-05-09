import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  Timestamp, 
  orderBy, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, User, signOut } from 'firebase/auth';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface Employee {
  id: string;
  name: string;
  npwp: string;
  status: 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';
  category: 'A' | 'B' | 'C';
  joinDate: string;
  createdAt: any;
  updatedAt: any;
}

export interface SalaryData {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  salary: number;
  allowance: number;
  bonus: number;
  thr: number;
  totalGross: number;
  pph21: number;
  calculationMethod: 'TER' | 'PROGRESSIVE';
  createdAt: any;
  updatedAt: any;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  employees: Employee[];
  activeEmployee: Employee | null;
  salaries: SalaryData[];
  setActiveEmployee: (employee: Employee | null) => void;
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addSalary: (salary: Omit<SalaryData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSalary: (id: string, employeeId: string, salary: Partial<SalaryData>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [salaries, setSalaries] = useState<SalaryData[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setEmployees([]);
      setSalaries([]);
      return;
    }

    const q = query(collection(db, 'employees'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const emps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(emps);
    }, (error) => handleFirestoreError(error, OperationType.LIST as any, 'employees'));

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user || !activeEmployee) {
      setSalaries([]);
      return;
    }

    const q = query(collection(db, 'employees', activeEmployee.id, 'salaries'), orderBy('year'), orderBy('month'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalaryData));
      setSalaries(sals);
    }, (error) => handleFirestoreError(error, OperationType.LIST as any, `employees/${activeEmployee.id}/salaries`));

    return unsubscribe;
  }, [user, activeEmployee]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setActiveEmployee(null);
  };

  const addEmployee = async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const path = 'employees';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...employee,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE as any, path);
      return '';
    }
  };

  const updateEmployee = async (id: string, employee: Partial<Employee>) => {
    const path = `employees/${id}`;
    try {
      await updateDoc(doc(db, 'employees', id), {
        ...employee,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE as any, path);
    }
  };

  const deleteEmployee = async (id: string) => {
    const path = `employees/${id}`;
    try {
      await deleteDoc(doc(db, 'employees', id));
      if (activeEmployee?.id === id) setActiveEmployee(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE as any, path);
    }
  };

  const addSalary = async (salary: Omit<SalaryData, 'id' | 'createdAt' | 'updatedAt'>) => {
    const parentPath = `employees/${salary.employeeId}/salaries`;
    try {
      // Check if already exists for this month/year
      const q = query(
        collection(db, 'employees', salary.employeeId, 'salaries'), 
        where('month', '==', salary.month),
        where('year', '==', salary.year)
      );
      const existing = await getDocs(q);
      
      if (!existing.empty) {
        const id = existing.docs[0].id;
        await updateDoc(doc(db, 'employees', salary.employeeId, 'salaries', id), {
          ...salary,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'employees', salary.employeeId, 'salaries'), {
          ...salary,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE as any, parentPath);
    }
  };

  const updateSalary = async (id: string, employeeId: string, salary: Partial<SalaryData>) => {
    const path = `employees/${employeeId}/salaries/${id}`;
    try {
      await updateDoc(doc(db, 'employees', employeeId, 'salaries', id), {
        ...salary,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE as any, path);
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, loading, employees, activeEmployee, salaries, 
      setActiveEmployee, addEmployee, updateEmployee, deleteEmployee, addSalary, updateSalary,
      login, logout 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
