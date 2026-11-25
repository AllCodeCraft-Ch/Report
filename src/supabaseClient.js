import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const projectUrl = (() => {
  try {
    return new URL(supabaseUrl).origin;
  } catch {
    return '';
  }
})();
const projectRef = projectUrl ? new URL(projectUrl).hostname.split('.')[0] : '';

export const supabaseDiagnostics = {
  configured: Boolean(supabaseUrl && supabaseAnonKey),
  projectUrl,
  projectRef,
  hasAnonKey: Boolean(supabaseAnonKey),
};

let client = null;
const volatileAuthState = new Map();
const sessionAuthStorage = {
  getItem(key) {
    try { return window.sessionStorage.getItem(key); } catch { return volatileAuthState.get(key) ?? null; }
  },
  setItem(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch { volatileAuthState.set(key, value); }
  },
  removeItem(key) {
    try { window.sessionStorage.removeItem(key); } catch { volatileAuthState.delete(key); }
  },
};

if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
    },
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: sessionAuthStorage,
    },
  });
}

export const supabase = client;
