/**
 * Hook storage utility using IndexedDB for robust hook persistence
 */

import supabase from './supabaseClient';

const DB_NAME = 'hookVault365DB';
const DB_VERSION = 1;
const HOOKS_STORE = 'hooks';
const FAVORITES_STORE = 'favorites';

let dbPromise;

/**
 * Initialize the database
 */
const initDB = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        // Fall back to localStorage if IndexedDB fails
        resolve(null);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create the hooks object store if it doesn't exist
        if (!db.objectStoreNames.contains(HOOKS_STORE)) {
          const hooksStore = db.createObjectStore(HOOKS_STORE, { keyPath: 'id' });
          hooksStore.createIndex('niche', 'niche', { unique: false });
          hooksStore.createIndex('tone', 'tone', { unique: false });
          hooksStore.createIndex('ai_generated', 'ai_generated', { unique: false });
        }
        
        // Create the favorites object store if it doesn't exist
        if (!db.objectStoreNames.contains(FAVORITES_STORE)) {
          db.createObjectStore(FAVORITES_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  }
  return dbPromise;
};

/**
 * Check if IndexedDB is available
 */
const isIndexedDBAvailable = () => {
  return typeof window !== 'undefined' && 'indexedDB' in window;
};

/**
 * Save hooks to Supabase
 * @param {Array} hooks Array of hook objects to save
 * @returns {Promise<Array>} Saved hooks with IDs
 */
export const saveHooks = async (hooks) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('[saveHooks] No session, saving locally.');
      return saveHooksLocally(hooks);
    }
    
    const userId = session.user.id;
    console.log(`[saveHooks] User ${userId} saving ${hooks.length} hooks to Supabase.`);
    
    const hooksWithUser = hooks.map(hook => ({
      text: hook.text,
      niche: hook.niche,
      tone: hook.tone,
      length: hook.length,
      user_id: userId,
      ai_generated: true
      // Let Supabase generate the ID and timestamps
    }));
    
    const { data, error } = await supabase
      .from('hooks')
      .insert(hooksWithUser)
      .select(); // Select all columns of the inserted rows
    
    if (error) {
      console.error('[saveHooks] Error saving hooks to Supabase:', error);
      console.log('[saveHooks] Falling back to local save due to Supabase error.');
      return saveHooksLocally(hooks);
    }
    
    // *** Add detailed log of returned data ***
    console.log('[saveHooks] Supabase insert successful. Returning data:', JSON.stringify(data, null, 2)); 
    
    if (!data || data.length === 0) {
       console.warn('[saveHooks] Supabase insert returned ok, but no data array received back.');
       // Fallback? Or maybe return something to indicate partial success?
       // For now, let's still try local save as something went wrong.
       return saveHooksLocally(hooks);
    }
    
    return data; // Should contain the hooks with DB IDs
    
  } catch (error) {
    console.error('[saveHooks] Unexpected error:', error);
    console.log('[saveHooks] Falling back to local save due to unexpected error.');
    return saveHooksLocally(hooks);
  }
};

/**
 * Load hooks from Supabase
 * @returns {Promise<Array>} Array of hooks
 */
export const loadHooks = async () => {
  try {
    // Set a short timeout for Supabase calls to prevent UI hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase request timed out')), 2500)
    );

    // First check localStorage for a fast response
    const localHooks = JSON.parse(localStorage.getItem(HOOKS_STORAGE_KEY) || '[]');
    
    // Get current user session with timeout
    let session;
    try {
      const sessionPromise = supabase.auth.getSession();
      const { data } = await Promise.race([sessionPromise, timeoutPromise]);
      session = data.session;
    } catch (error) {
      console.warn('Session fetch timed out or failed, using local hooks:', error);
      // Return local hooks immediately if there's a timeout
      return localHooks;
    }
    
    // If no session, use local hooks
    if (!session) {
      return localHooks;
    }
    
    // Load hooks with timeout
    try {
      const hooksPromise = supabase
        .from('hooks')
        .select()
        .order('created_at', { ascending: false });
      
      const { data, error } = await Promise.race([hooksPromise, timeoutPromise]);
      
      if (error) {
        console.error('Error loading hooks from Supabase:', error);
        return localHooks;
      }
      
      // Cache result in localStorage for faster loading next time
      try {
        localStorage.setItem(HOOKS_STORAGE_KEY, JSON.stringify(data || []));
      } catch (storageError) {
        console.warn('Failed to cache hooks in localStorage:', storageError);
      }
      
      return data || [];
    } catch (error) {
      console.warn('Hooks fetch timed out or failed:', error);
      return localHooks;
    }
  } catch (error) {
    console.error('Supabase hook load error:', error);
    // Fallback to localStorage
    return loadHooksLocally();
  }
};

/**
 * Load hooks from Supabase for a specific user
 * @returns {Promise<Array>} Array of hooks
 */
export const loadUserHooks = async () => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session, return empty array
    if (!session) {
      return [];
    }
    
    // Load hooks for current user
    const { data, error } = await supabase
      .from('hooks')
      .select()
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading user hooks from Supabase:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Supabase user hook load error:', error);
    return [];
  }
};

/**
 * Toggle favorite status for a hook
 * @param {object} hook The hook object to favorite/unfavorite
 * @param {boolean} shouldBeFavorite The desired favorite state
 * @returns {Promise<boolean>} Success status
 */
export const toggleFavorite = async (hook, shouldBeFavorite) => {
  const hookId = hook?.id;
  if (!hookId) {
    console.error('[toggleFavorite] Invalid hook object passed:', hook);
    return false;
  }
  console.log(`[toggleFavorite] Attempting to set favorite status for hook ${hookId} to ${shouldBeFavorite}`);
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Handle logged-out state (use localStorage)
    if (!session || !session.user) {
      console.log(`[toggleFavorite ${hookId}] User logged out. Using localStorage.`);
      const localFavorites = loadFavoritesLocally();
      let updatedFavorites;
      if (shouldBeFavorite) {
        if (!localFavorites.some(fav => fav.id === hookId)) {
          updatedFavorites = [...localFavorites, hook];
          console.log(`[toggleFavorite ${hookId}] Added to local favorites.`);
        } else {
          updatedFavorites = localFavorites; 
          console.log(`[toggleFavorite ${hookId}] Already in local favorites.`);
        }
      } else {
        updatedFavorites = localFavorites.filter(fav => fav.id !== hookId);
        console.log(`[toggleFavorite ${hookId}] Removed from local favorites.`);
      }
      saveFavoritesLocally(updatedFavorites);
      return true;
    }
    
    // Handle logged-in state (use Supabase)
    const userId = session.user.id;
    console.log(`[toggleFavorite ${hookId}] User logged in (${userId}). Using Supabase.`);
    
    if (shouldBeFavorite) {
      // Add favorite to Supabase
      console.log(`[toggleFavorite ${hookId}] Attempting to insert into user_favorites...`);
      const { data: insertData, error: insertError } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, hook_id: hookId })
        .select()
        .maybeSingle(); 
        
      if (insertError && insertError.code !== '23505') { // 23505 = unique_violation
        console.error(`[toggleFavorite ${hookId}] Error adding favorite to Supabase:`, insertError);
        return false;
      }
      if (insertError && insertError.code === '23505') {
         console.log(`[toggleFavorite ${hookId}] Favorite already exists in Supabase (unique violation).`);
      } else if (!insertError) {
         console.log(`[toggleFavorite ${hookId}] Successfully added favorite to Supabase. Result:`, insertData);
      }
      return true; 
      
    } else {
      // Remove favorite from Supabase
      console.log(`[toggleFavorite ${hookId}] Attempting to delete from user_favorites...`);
      const { error: deleteError, count: deleteCount } = await supabase
        .from('user_favorites')
        .delete({ count: 'exact' })
        .eq('user_id', userId)
        .eq('hook_id', hookId);
      
      if (deleteError) {
        console.error(`[toggleFavorite ${hookId}] Error removing favorite from Supabase:`, deleteError);
        return false;
      }
      console.log(`[toggleFavorite ${hookId}] Successfully deleted favorite from Supabase. Rows affected: ${deleteCount}`);
      return true;
    }
  } catch (error) {
    console.error(`[toggleFavorite ${hookId}] Unexpected error:`, error);
    return false;
  }
};

/**
 * Load favorite hooks for the current user
 * @returns {Promise<Array>} Array of favorite hooks
 */
export const loadFavorites = async () => {
  try {
    // Set a short timeout for Supabase calls to prevent UI hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase request timed out')), 2500)
    );

    // First check localStorage for a fast response
    const localFavorites = JSON.parse(localStorage.getItem('favorite_hooks') || '[]');
    
    // Get current user session with timeout
    let session;
    try {
      const sessionPromise = supabase.auth.getSession();
      const { data } = await Promise.race([sessionPromise, timeoutPromise]);
      session = data.session;
    } catch (error) {
      console.warn('Session fetch timed out or failed, using local favorites:', error);
      return localFavorites;
    }
    
    // If no session, return local favorites
    if (!session) {
      return localFavorites;
    }
    
    // Load favorites with timeout
    try {
      const favoritesPromise = supabase
        .from('user_favorites')
        .select(`
          id,
          hook_id,
          created_at,
          hooks (*)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      const { data, error } = await Promise.race([favoritesPromise, timeoutPromise]);
      
      if (error) {
        console.error('Error loading favorites from Supabase:', error);
        return localFavorites;
      }
      
      // Extract hook data from the joined query and cache in localStorage
      const extractedHooks = data ? data.map(favorite => favorite.hooks) : [];
      try {
        localStorage.setItem('favorite_hooks', JSON.stringify(extractedHooks));
      } catch (storageError) {
        console.warn('Failed to cache favorites in localStorage:', storageError);
      }
      
      return extractedHooks;
    } catch (error) {
      console.warn('Favorites fetch timed out or failed:', error);
      return localFavorites;
    }
  } catch (error) {
    console.error('Supabase favorites load error:', error);
    return JSON.parse(localStorage.getItem('favorite_hooks') || '[]');
  }
};

/**
 * Check if a specific hook is favorited by the current user
 * @param {string} hookId ID of the hook to check
 * @returns {Promise<boolean>} True if the hook is favorited, false otherwise
 */
export const isHookFavorite = async (hookId) => {
  // Basic validation: Ensure hookId looks like a UUID before querying
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (typeof hookId !== 'string' || !uuidRegex.test(hookId)) {
    console.warn(`[isHookFavorite] Invalid hookId provided: ${hookId}. Skipping Supabase check.`);
    // Fallback to local storage check even with invalid ID format, though unlikely to match
    const localFavorites = loadFavoritesLocally(); // Use helper function
    return localFavorites.some(hook => hook.id === hookId);
  }
  
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      // Fallback: Check local storage
      const localFavorites = loadFavoritesLocally();
      return localFavorites.some(hook => hook.id === hookId);
    }
    
    // Check the user_favorites table
    const { error, count } = await supabase
      .from('user_favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('hook_id', hookId); // hookId should be a valid UUID here
      
    if (error) {
      // Log the specific error from Supabase
      console.error(`[isHookFavorite] Error checking favorite status in Supabase for hook ${hookId}:`, error.message);
      return false; // Assume not favorited on error
    }
    
    return count > 0;
    
  } catch (error) {
    console.error(`[isHookFavorite] Unexpected error for hook ${hookId}:`, error);
    return false;
  }
};

// Local storage fallback methods
const HOOKS_STORAGE_KEY = 'hookVault365_hooks';
const FAVORITES_STORAGE_KEY = 'favorite_hooks'; // Define key for local favorites

/**
 * Save hooks to localStorage
 * @param {Array} hooks Array of hook objects to save
 * @returns {Promise<Array>} Saved hooks with IDs
 */
const saveHooksLocally = async (hooks) => {
  try {
    // Generate IDs and timestamps for new hooks
    const hooksWithIds = hooks.map(hook => ({
      ...hook,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ai_generated: true
    }));
    
    // Get existing hooks from localStorage
    const existingHooks = JSON.parse(localStorage.getItem(HOOKS_STORAGE_KEY) || '[]');
    
    // Combine with new hooks
    const allHooks = [...hooksWithIds, ...existingHooks];
    
    // Save to localStorage
    localStorage.setItem(HOOKS_STORAGE_KEY, JSON.stringify(allHooks));
    
    return hooksWithIds;
  } catch (error) {
    console.error('Local hook save error:', error);
    throw error;
  }
};

/**
 * Load hooks from localStorage
 * @returns {Promise<Array>} Array of hooks
 */
const loadHooksLocally = async () => {
  try {
    const hooks = JSON.parse(localStorage.getItem(HOOKS_STORAGE_KEY) || '[]');
    return hooks;
  } catch (error) {
    console.error('Local hook load error:', error);
    return [];
  }
};

/**
 * Save favorites to localStorage (used as fallback or when logged out)
 * @param {Array} favorites Array of favorite hook objects
 */
const saveFavoritesLocally = (favorites) => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Local favorites save error:', error);
  }
};

/**
 * Load favorites from localStorage
 * @returns {Array} Array of favorite hooks
 */
const loadFavoritesLocally = () => {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Local favorites load error:', error);
    return [];
  }
};

export default {
  saveHooks,
  loadHooks,
  toggleFavorite,
  loadFavorites,
  isHookFavorite,
  loadUserHooks
}; 