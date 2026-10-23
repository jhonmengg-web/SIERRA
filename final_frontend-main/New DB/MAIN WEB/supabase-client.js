/* SIERRA HAVEN Supabase client. Publishable keys are intended for browser use. */
(() => {
  'use strict';
  const SUPABASE_URL = 'https://uranjhaewlkyzpveedvj.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ZPy3oOBCGAGWiVIwPKktBA_RTqpPRcR';
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase JS did not load. Check your internet connection.');
    return;
  }
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  window.sierraSupabase = client;
  window.sierraAuth = {
    async getUser() {
      const { data, error } = await client.auth.getUser();
      if (error) throw error;
      return data.user;
    },
    async getProfile(userId) {
      const user = userId ? { id: userId } : await this.getUser();
      if (!user) return null;
      const { data, error } = await client.from('users')
        .select('id, full_name, name, email, phone_number, role, created_at')
        .eq('id', user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    async requireAuth() {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (!data.session) {
        const next = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
        window.location.replace('../LOGIN%20PANEL/Index.html?mode=login&next=' + next);
        return null;
      }
      return data.session.user;
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      window.location.replace('../LOGIN%20PANEL/Index.html?mode=login&signedOut=1');
    },
    async loadPropertyInquiries() {
      const user = await this.getUser();
      if (!user) return [];
      const { data, error } = await client.from('property_inquiries')
        .select('id, user_id, property_id, property_name, location, price, status, created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async savePropertyInquiry(property) {
      const user = await this.getUser();
      if (!user) throw new Error('Please sign in before saving an inquiry.');
      const row = {
        user_id: user.id,
        property_id: String(property.id),
        property_name: String(property.name),
        location: String(property.location),
        price: String(property.price),
        status: 'new'
      };
      const { data, error } = await client.from('property_inquiries')
        .insert(row).select('id, user_id, property_id, property_name, location, price, status, created_at').single();
      if (error) throw error;
      return data;
    },
    async loadProperties() {
      const { data, error } = await client.from('properties')
        .select('id, name, location, type, units, occupied, rent, status, photo_url, photo_360_url, sqm, storeys, amenities, agent_email')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  };
})();
