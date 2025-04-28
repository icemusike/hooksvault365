import { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import FilterControls from './FilterControls';
import HookList from './HookList';
import AIHookGenerator from './AIHookGenerator';
import { loadHooks, saveHooks } from '../utils/hookStorage';
import { showSuccess, showError } from '../utils/notificationUtils';

const HookVault = ({ initialHooks }) => {
  // Ensure initialHooks is an array even if undefined
  const safeInitialHooks = Array.isArray(initialHooks) ? initialHooks : [];
  
  const [hooks, setHooks] = useState(safeInitialHooks || []);
  const [filteredHooks, setFilteredHooks] = useState(hooks);
  const [filters, setFilters] = useState({
    searchTerm: '',
    niche: 'all',
    tone: 'all',
    length: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Fuse instance for fuzzy search
  const fuse = new Fuse(hooks, {
    keys: ['text', 'niche', 'tone'],
    threshold: 0.4, // Lower threshold means more strict matching
    includeScore: true
  });

  // Apply filters whenever they change
  useEffect(() => {
    let results = [...hooks];
    
    // Apply category filters first (niche, tone, length)
    if (filters.niche !== 'all') {
      results = results.filter(hook => hook.niche === filters.niche);
    }
    
    if (filters.tone !== 'all') {
      results = results.filter(hook => hook.tone === filters.tone);
    }
    
    if (filters.length !== 'all') {
      results = results.filter(hook => hook.length === filters.length);
    }
    
    // Apply search term if present
    if (filters.searchTerm.trim()) {
      const searchResults = fuse.search(filters.searchTerm);
      results = searchResults.map(result => result.item);
    }
    
    setFilteredHooks(results);
  }, [hooks, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleHooksGenerated = async (newHooks) => {
    console.log('[HookVault] handleHooksGenerated called with temporary hooks:', newHooks);
    // Show temporary loading/saving indicator?
    
    try {
      // Save generated hooks to DB (Supabase/localStorage)
      // saveHooks should return the *saved* hooks with proper IDs
      const savedHooks = await saveHooks(newHooks); 
      
      if (!savedHooks || savedHooks.length === 0) {
        throw new Error('Hooks were generated but failed to save.');
      }
      
      console.log('[HookVault] Hooks saved successfully, received back:', savedHooks);
      
      // Add the *saved* hooks (with DB IDs) to the main state
      setHooks(prevHooks => {
        // Filter out any temporary hooks that might have the same text if generation was rapid
        const prevHookTexts = new Set(prevHooks.map(h => h.text));
        const uniqueNewSavedHooks = savedHooks.filter(sh => !prevHookTexts.has(sh.text));
        return [...uniqueNewSavedHooks, ...prevHooks];
      });
      
      // Show success notification
      showSuccess(`${savedHooks.length} new hooks generated and saved!`);
      
    } catch (error) {
      console.error("[HookVault] Hook generation/save error:", error);
      showError(error.message || "Failed to save generated hooks.");
    }
  };

  const handleGeneratorError = (errorMessage) => {
    showError(errorMessage);
  };

  // Load all hooks on initial render
  useEffect(() => {
    let mounted = true;
    console.log('[HookVault] Component mounted.');
    
    // Failsafe timeout
    const failsafeTimeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('[HookVault] Failsafe timeout triggered: Forcing isLoading to false.');
        // Fallback to initial hooks if still loading
        setHooks(safeInitialHooks);
        setIsLoading(false);
      }
    }, 10000); // 10 seconds failsafe
    
    const loadAllHooks = async () => {
      if (!mounted) return;
      console.log('[HookVault] Starting loadAllHooks...');
      setIsLoading(true);
      
      let loadedHooks = [];
      try {
        // Try loading from Supabase/localStorage via hookStorage
        const loadPromise = loadHooks(); // Uses hookStorage with internal timeouts
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Hook loading took too long')), 7000) // 7 second overall timeout
        );

        loadedHooks = await Promise.race([loadPromise, timeoutPromise]);
        console.log(`[HookVault] Loaded ${loadedHooks?.length || 0} hooks via loadHooks.`);
        
      } catch (error) {
        console.error('[HookVault] Error loading hooks:', error);
        showError('Failed to load hooks. Using default hooks.');
        loadedHooks = []; // Clear partial data on error
      }

      if (mounted) {
        // Combine loaded hooks with initial/default hooks
        const combinedHooks = [...loadedHooks];
        const existingIds = new Set(loadedHooks.map(h => h.id));
        safeInitialHooks.forEach(hook => {
          if (!existingIds.has(hook.id)) {
            combinedHooks.push(hook);
          }
        });
        
        console.log(`[HookVault] Setting final combined hooks count: ${combinedHooks.length}`);
        setHooks(combinedHooks);
        // Ensure isLoading is set to false *after* state update
        console.log('[HookVault] Setting isLoading to false in loadAllHooks.');
        setIsLoading(false);
      }
    };

    loadAllHooks();

    // Cleanup function
    return () => {
      mounted = false;
      clearTimeout(failsafeTimeoutId); // Clear failsafe timer
      console.log('[HookVault] Component unmounted.');
    };
  }, [safeInitialHooks]); // Depend on safeInitialHooks

  return (
    <div className="hook-vault">
      {/* Render AI Generator Directly */}
      <AIHookGenerator 
        onHooksGenerated={handleHooksGenerated} 
        onError={handleGeneratorError} 
      />

      {/* Separator or Header for Hook List */}
      <div className="hook-list-header">
        <h2>Your Hook Collection</h2>
        <div className="results-count">
          {isLoading ? (
            <span><i className="fas fa-spinner fa-spin"></i> Loading hooks...</span>
          ) : (
            <span>Showing {filteredHooks.length} of {hooks.length} hooks</span>
          )}
        </div>
      </div>

      <FilterControls hooks={hooks} onFilterChange={handleFilterChange} />
      
      {isLoading ? (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin fa-3x"></i>
          <p>Loading your hooks...</p>
        </div>
      ) : (
        <HookList hooks={filteredHooks} />
      )}
    </div>
  );
};

export default HookVault; 