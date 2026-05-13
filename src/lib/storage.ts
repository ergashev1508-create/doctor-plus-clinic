import {
  hashAdminPassword,
  initDb,
  readStore,
  updateStore,
  verifyAdminCredentials,
  type AdminUserRecord,
  type ClinicStore,
} from "./db.ts";
import {
  initSupabaseStore,
  isSupabaseConfigured,
  readSupabaseStore,
  writeSupabaseStore,
} from "./supabaseStore.ts";

export async function initStorage() {
  if (isSupabaseConfigured()) {
    await initSupabaseStore();
    return;
  }

  initDb();
}

export async function readStorage(): Promise<ClinicStore> {
  if (isSupabaseConfigured()) {
    return readSupabaseStore();
  }

  return readStore();
}

export async function updateStorage<T>(updater: (store: ClinicStore) => T): Promise<T> {
  if (isSupabaseConfigured()) {
    const store = await readSupabaseStore();
    const result = updater(store);
    await writeSupabaseStore(store);
    return result;
  }

  return updateStore(updater);
}

export async function verifyAdminCredentialsStorage(
  username: string,
  password: string
): Promise<AdminUserRecord | null> {
  if (!isSupabaseConfigured()) {
    return verifyAdminCredentials(username, password);
  }

  const store = await readSupabaseStore();
  const admin = store.adminUsers.find((item) => item.username === username);
  if (!admin) return null;
  return admin.passwordHash === hashAdminPassword(password) ? admin : null;
}

export { hashAdminPassword, isSupabaseConfigured };
