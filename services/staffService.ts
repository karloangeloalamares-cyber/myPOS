import { Staff } from '../types';

const STAFF_KEY = 'micropos_staff_v1';

function loadStaff(): Staff[] {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Staff[];
    return parsed.map(s => ({
      ...s,
      createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
    }));
  } catch {
    return [];
  }
}

function saveStaff(staff: Staff[]) {
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
}

export const staffService = {
  getAll(): Staff[] {
    return loadStaff();
  },
  create(data: Omit<Staff, 'id' | 'createdAt'>): Staff {
    const all = loadStaff();
    const newStaff: Staff = {
      ...data,
      id: (globalThis.crypto?.randomUUID?.() || `staff_${Date.now()}`) as string,
      createdAt: new Date(),
    };
    all.push(newStaff);
    saveStaff(all);
    return newStaff;
  },
  update(id: string, updates: Partial<Staff>): Staff | null {
    const all = loadStaff();
    const index = all.findIndex(s => s.id === id);
    if (index === -1) return null;
    all[index] = { ...all[index], ...updates };
    saveStaff(all);
    return all[index];
  },
  delete(id: string) {
    const all = loadStaff().filter(s => s.id !== id);
    saveStaff(all);
  },
};

