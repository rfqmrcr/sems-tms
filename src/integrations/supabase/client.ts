// Fake Supabase client to satisfy untouched hooks
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
  },
  from: (table: string) => {
    const mockChain: any = {
      select: () => mockChain,
      insert: () => mockChain,
      update: () => mockChain,
      delete: () => mockChain,
      eq: () => mockChain,
      neq: () => mockChain,
      in: () => mockChain,
      order: () => mockChain,
      gte: () => mockChain,
      lte: () => mockChain,
      is: () => mockChain,
      ilike: () => mockChain,
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: [], error: null }),
      catch: (reject: any) => { return Promise.resolve({ data: [], error: null }); }
    };
    
    // Specifically make then-able chain so await supabase.from(...) resolves correctly
    mockChain.then = (resolve: any) => resolve({ data: [], error: null });
    
    return mockChain;
  },
  rpc: async () => ({ data: null, error: null })
} as any;