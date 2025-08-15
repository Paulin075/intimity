export default {
  expo: {
    name: "Intimity",
    slug: "intimity",
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://atgrmdnqmyjthbslyfsl.supabase.co",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key-here",
    },
  },
};
