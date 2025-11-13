import { User, UserRole, Store } from '../types';

// Lightweight local-only auth helpers for demo/dev use.
// Persists to localStorage and does not contact a backend.

const USER_KEY = 'current_user';
const ROLE_KEY = 'userRole';
const TEST_USERS_KEY = 'test_users_v1';
const OWNERS_KEY = 'store_owners_v1';

type TestLogin = {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  storeId: string;
};

function readAllTestUsers(): Record<string, TestLogin[]> {
  try {
    const raw = localStorage.getItem(TEST_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAllTestUsers(map: Record<string, TestLogin[]>) {
  localStorage.setItem(TEST_USERS_KEY, JSON.stringify(map));
}

type StoreOwnerRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  storeId: string;
};

function readAllOwners(): Record<string, StoreOwnerRecord> {
  try {
    const raw = localStorage.getItem(OWNERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAllOwners(map: Record<string, StoreOwnerRecord>) {
  localStorage.setItem(OWNERS_KEY, JSON.stringify(map));
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // Rehydrate date fields if present
    if (parsed && parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
    if (parsed && parsed.lastLogin) parsed.lastLogin = new Date(parsed.lastLogin);
    return parsed as User;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(ROLE_KEY, user.role);
  } else {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
  }
}

export async function loginSuperAdmin(email: string, password: string): Promise<User> {
  // In dev, accept any non-empty credentials.
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  const user: User = {
    id: `sa_${Date.now()}`,
    email,
    name: 'Super Admin',
    password: 'local',
    role: 'super_admin',
    storeId: null,
    enabled: true,
    createdAt: new Date(),
    lastLogin: new Date(),
  };
  setCurrentUser(user);
  return user;
}

export async function loginStoreUser(params: {
  storeId: string;
  email: string;
  password: string;
  role?: UserRole; // default store_manager
  name?: string;
}): Promise<User> {
  const { storeId, email, password } = params;
  if (!storeId) throw new Error('Please select a store');
  if (!email || !password) throw new Error('Email and password are required');
  try {
    const raw = localStorage.getItem('store_owners_v1');
    const owners = raw ? JSON.parse(raw) as Record<string, any> : {};
    const rec = owners[storeId];
    if (!rec) throw new Error('Owner not provisioned for this store');
    if (rec.email !== email || rec.password !== password) throw new Error('Invalid credentials');
    const user: User = {
      id: rec.id,
      email: rec.email,
      name: rec.name,
      password: 'local',
      role: 'store_manager',
      storeId,
      enabled: true,
      createdAt: new Date(),
      lastLogin: new Date(),
    };
    setCurrentUser(user);
    return user;
  } catch (e: any) {
    throw new Error(e?.message || 'Login failed');
  }
}

export function logout() {
  setCurrentUser(null);
}

// DEV ONLY: seed two test users per store (manager + cashier)
export function seedTestUsersForStore(store: Store): TestLogin[] {
  // Disabled: do not create any test users
  return [];
}

export function listTestUsersForStore(storeId: string): TestLogin[] {
  // Disabled: return no test users
  return [];
}

export async function quickLoginTestUser(u: TestLogin): Promise<User> {
  // Disabled: store logins not allowed
  throw new Error('Store logins are disabled');
}

// Store owner provisioning (login remains disabled; this only records credentials)
export function createOwnerForStore(store: Store, params: { name: string; email: string; phone: string; password: string }): User {
  const owners = readAllOwners();
  const ownerId = `owner_${Date.now()}`;
  const record: StoreOwnerRecord = {
    id: ownerId,
    name: params.name,
    email: params.email,
    phone: params.phone,
    password: params.password,
    storeId: store.id,
  };
  owners[store.id] = record;
  writeAllOwners(owners);
  return {
    id: ownerId,
    email: params.email,
    name: params.name,
    password: 'local',
    role: 'store_manager',
    storeId: store.id,
    enabled: true,
    createdAt: new Date(),
    lastLogin: undefined,
  };
}

export function getOwnerForStore(storeId: string): { id: string; name: string; email: string; phone: string } | null {
  const owners = readAllOwners();
  const rec = owners[storeId];
  if (!rec) return null;
  const { id, name, email, phone } = rec;
  return { id, name, email, phone };
}
