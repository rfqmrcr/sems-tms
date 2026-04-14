// src/data/mockDatabase.ts

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const STORE_KEY = 'sems_tms_mock_db';

export interface MockDatabase {
  courses: any[];
  course_runs: any[];
  organizations: any[];
  registrations: any[];
  trainees: any[];
  invoices: any[];
  quotations: any[];
  promo_codes: any[];
  partners: any[];
}

const initialData: MockDatabase = {
  courses: [
    {
      id: 'c1',
      title: 'Advanced React Development',
      description: 'Master React 18, Server Components, and Suspense in this comprehensive course.',
      category: 'Frontend',
      price: 1999.0,
      hrdc_program_code: 'REACT101',
      created_at: new Date().toISOString()
    },
    {
      id: 'c2',
      title: 'Supabase Fundamentals',
      description: 'Learn to build complete backends without writing server code.',
      category: 'Backend',
      price: 999.0,
      hrdc_program_code: 'SBASE101',
      created_at: new Date().toISOString()
    }
  ],
  course_runs: [
    {
      id: 'cr1',
      course_id: 'c1',
      title: 'Advanced React - May Intake',
      start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '17:00',
      capacity: 30,
      price: 1999.0,
      location: 'Virtual Zoom',
      visibility: 'public',
      created_at: new Date().toISOString()
    },
    {
      id: 'cr2',
      course_id: 'c2',
      title: 'Supabase Masterclass - June Intake',
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '18:00',
      capacity: 20,
      price: 999.0,
      location: 'Kuala Lumpur HQ',
      visibility: 'public',
      created_at: new Date().toISOString()
    }
  ],
  organizations: [
    {
      id: 'org1',
      name: 'Tech Innovators Corp',
      contact_person: 'John Doe',
      contact_email: 'john@techinnovators.com',
      contact_number: '555-0101',
      address: '123 Tech Lane',
      created_at: new Date().toISOString()
    }
  ],
  registrations: [],
  trainees: [],
  invoices: [],
  quotations: [],
  promo_codes: [],
  partners: []
};

// Initialize DB
export const getDatabase = (): MockDatabase => {
  const stored = localStorage.getItem(STORE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return initialData;
    }
  }
  localStorage.setItem(STORE_KEY, JSON.stringify(initialData));
  return initialData;
};

export const saveDatabase = (db: MockDatabase) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(db));
};

export const clearDatabase = () => {
  localStorage.removeItem(STORE_KEY);
};

// Helper methods
export const getTable = <T extends keyof MockDatabase>(table: T): MockDatabase[T] => {
  const db = getDatabase();
  return db[table];
};

export const insertRow = <T extends keyof MockDatabase>(table: T, row: any): any => {
  const db = getDatabase();
  const id = row.id || Math.random().toString(36).substr(2, 9);
  const newRow = { ...row, id, created_at: new Date().toISOString() };
  db[table].push(newRow);
  saveDatabase(db);
  return newRow;
};

export const updateRow = <T extends keyof MockDatabase>(table: T, id: string, updates: any): any => {
  const db = getDatabase();
  const index = db[table].findIndex((r: any) => r.id === id);
  if (index !== -1) {
    db[table][index] = { ...db[table][index], ...updates, updated_at: new Date().toISOString() };
    saveDatabase(db);
    return db[table][index];
  }
  return null;
};

export const deleteRow = <T extends keyof MockDatabase>(table: T, id: string) => {
  const db = getDatabase();
  db[table] = db[table].filter((r: any) => r.id !== id);
  saveDatabase(db);
};
