/**
 * Authentication utility for user management with Supabase
 */
import supabase from './supabaseClient';

// Session storage key - export this to ensure consistency
export const SESSION_KEY = 'hookVault365_session';

// Demo credentials
export const DEMO_USER = {
  email: 'demo@example.com',
  password: 'demo123',
  name: 'Demo User'
};

/**
 * Register a new user
 * @param {Object} userData User data object containing email, password, and name
 * @returns {Promise<Object>} Success status and message
 */
export const registerUser = async (userData) => {
  try {
    // Register user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.name
        }
      }
    });
    
    if (authError) throw authError;
    
    // Create user profile in the database
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          display_name: userData.name
        });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // We'll continue even if profile creation fails
        // The user is still created in auth
      }
    }
    
    return { 
      success: true, 
      message: 'Registration successful! Please check your email to confirm your account.' 
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: error.message || 'Registration failed' 
    };
  }
};

/**
 * Get current user session, including profile data
 * @returns {Promise<Object|null>} Session object with user and profile data, or null
 */
export const getSession = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error getting Supabase session:', sessionError);
      // Fallback to localStorage ONLY for demo user
      return getLocalDemoSession();
    }

    if (session && session.user) {
      console.log('[getSession] Found active Supabase session for user:', session.user.id);
      // Fetch user profile data
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('display_name') // Select only the fields needed
          .eq('id', session.user.id)
          .maybeSingle(); // Use maybeSingle() to handle potentially missing profiles
          
        if (profileError) {
           // Log error but don't throw, proceed with fallback name
           console.warn(`[getSession] Could not fetch profile for user ${session.user.id}:`, profileError.message); 
        }
        
        const userName = 
          profileData?.display_name || 
          session.user.user_metadata?.full_name || 
          session.user.email?.split('@')[0] ||
          'User';
          
        console.log(`[getSession] Determined user name: ${userName}`);

        return {
          id: session.user.id,
          email: session.user.email,
          name: userName,
          isLoggedIn: true,
          timestamp: Date.now(),
          // Include profile data if needed elsewhere, e.g., profile: profileData
        };

      } catch (profileFetchError) {
        console.error('[getSession] Unexpected error fetching profile:', profileFetchError);
        // Fallback if profile fetch fails unexpectedly
        return {
          id: session.user.id,
          email: session.user.email,
          name: session.user.email?.split('@')[0] || 'User',
          isLoggedIn: true,
          timestamp: Date.now(),
        };
      }
    } else {
      console.log('[getSession] No active Supabase session found.');
      // No Supabase session, check for local demo session
      return getLocalDemoSession();
    }
  } catch (error) {
    console.error('[getSession] Top-level error:', error);
    // Final fallback check for demo user on any error
    return getLocalDemoSession();
  }
};

/**
 * Helper to check and return a valid local demo session
 * @returns {Object|null}
 */
const getLocalDemoSession = () => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;
    const localSession = JSON.parse(sessionData);

    // Validate essential fields and demo user status
    if (localSession?.isLoggedIn && localSession?.email === DEMO_USER.email && localSession?.isDemoUser) {
      console.log('[getLocalDemoSession] Valid local demo session found.');
      return localSession;
    }
  } catch (e) {
    console.error('[getLocalDemoSession] Error parsing local session:', e);
  }
  
  // If not a valid demo session, clear potentially invalid local session
  localStorage.removeItem(SESSION_KEY);
  return null;
};

/**
 * Login a user (Updated to prioritize profile name)
 * @param {string} email User email
 * @param {string} password User password
 * @returns {Promise<Object>} Login result with success status and user data
 */
export const loginUser = async (email, password) => {
  try {
    // Demo Login Check (remains the same)
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
       // ... (demo login logic as before) ...
       return {
         success: true,
         message: 'Demo login successful',
         user: {
           email: DEMO_USER.email,
           name: DEMO_USER.name,
           isDemoUser: true
         }
       };
    }
    
    // Supabase Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) throw authError;
    if (!authData || !authData.user) throw new Error('Login succeeded but no user data returned.');

    // Fetch user profile data after successful login
    let userName = authData.user.email?.split('@')[0] || 'User'; // Default fallback
    try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.warn(`[loginUser] Could not fetch profile for user ${authData.user.id}:`, profileError.message);
        } else if (profileData?.display_name) {
          userName = profileData.display_name;
        }
    } catch (profileFetchError) {
        console.error('[loginUser] Error fetching profile after login:', profileFetchError);
    }
    
    // Create session data (using potentially updated userName)
    const sessionData = {
      id: authData.user.id,
      email: authData.user.email,
      name: userName,
      isLoggedIn: true,
      timestamp: Date.now()
    };
    
    // Store in localStorage (consistent session object)
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    
    return {
      success: true,
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: userName
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    // Keep Demo Fallback as before
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
       // ... (demo fallback logic) ...
       return {
         success: true,
         message: 'Demo login successful (fallback)',
         user: {
           email: DEMO_USER.email,
           name: DEMO_USER.name,
           isDemoUser: true
         }
       };
    }
    return { 
      success: false, 
      message: error.message || 'Login failed' 
    };
  }
};

/**
 * Log out the current user
 */
export const logoutUser = async () => {
  try {
    // Clear local session
    localStorage.removeItem(SESSION_KEY);
    console.log('Local session cleared during logout');
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Redirect to login page
    window.location.replace('/login');
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local session and redirect
    localStorage.removeItem(SESSION_KEY);
    window.location.replace('/login');
  }
}; 