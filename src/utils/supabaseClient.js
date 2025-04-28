import { createClient } from '@supabase/supabase-js';

// Supabase credentials (would ideally be in environment variables)
const supabaseUrl = 'https://mamaqfiaddgtigkfctet.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hbWFxZmlhZGRndGlna2ZjdGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NDc4MzAsImV4cCI6MjA2MTQyMzgzMH0.7DGrAJH307db4lJYMwHKud-_kMV-P09VSrsucS9_Mec';

// Determine the base URL for redirects
const getBaseUrl = () => {
  // In browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // In server environment (or fallback)
  return 'https://your-app-domain.com'; // Replace with your production domain
};

// Create a single supabase client for interacting with the database
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    redirectTo: `${getBaseUrl()}/login`,
  }
});

export default supabase; 