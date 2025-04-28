import { useState, useEffect } from 'react';
import { toggleFavorite, isHookFavorite } from '../utils/hookStorage';
import { showSuccess, showInfo, showError } from '../utils/notificationUtils';

const HookCard = ({ hook }) => {
  const [copied, setCopied] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(true);
  
  // Determine if the hook has a temporary ID
  const isTemporaryHook = typeof hook.id === 'string' && hook.id.startsWith('ai-');

  // Check if hook is favorited on component mount or when hook ID changes
  useEffect(() => {
    let mounted = true;
    // Skip check if ID is temporary or invalid
    const hookIdIsValid = typeof hook.id === 'string' && !isTemporaryHook;
    
    console.log(`[HookCard ${hook.id}] Mounting/ID changed. Is Temp: ${isTemporaryHook}, Is Valid: ${hookIdIsValid}. Checking favorite.`);
    
    // Set loading state correctly based on validity
    setIsLoadingFavorite(hookIdIsValid); 

    const checkFavorite = async () => {
      if (!hookIdIsValid) {
        if (mounted) setIsLoadingFavorite(false); // Ensure loading stops if ID is invalid
        return;
      }
      
      try {
        const isFavorite = await isHookFavorite(hook.id);
        if (mounted) {
          setFavorite(isFavorite);
          console.log(`[HookCard ${hook.id}] Favorite status checked: ${isFavorite}`);
        }
      } catch (error) {
        console.error(`[HookCard ${hook.id}] Error checking favorite status:`, error);
        // Keep favorite state as false on error
        if (mounted) setFavorite(false);
      } finally {
        if (mounted) {
          setIsLoadingFavorite(false);
          console.log(`[HookCard ${hook.id}] Finished checking favorite status.`);
        }
      }
    };
    
    if (hookIdIsValid) {
      checkFavorite();
    } else if (mounted) {
      // Explicitly set loading false if we skipped the check
      setIsLoadingFavorite(false);
    }

    return () => {
      mounted = false; 
    };
  }, [hook.id]); // Re-run if hook.id changes

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hook.text);
    setCopied(true);
    showInfo('Hook copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Debounce toggle favorite to prevent rapid clicks
  let debounceTimer;
  const handleToggleFavorite = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      console.log(`[HookCard ${hook?.id}] handleToggleFavorite called. Hook object:`, hook);
      
      // Prevent favoriting temporary hooks
      if (isTemporaryHook || !hook || !hook.id) {
        console.error(`[HookCard ${hook?.id || 'UNKNOWN'}] Attempted to favorite invalid/temporary hook.`);
        showError('Cannot favorite this hook yet. Please wait a moment.');
        return; 
      }
      
      const newFavoriteState = !favorite;
      const originalState = favorite;
      
      // Optimistically update UI
      setFavorite(newFavoriteState); 
      setIsLoadingFavorite(true); 
      console.log(`[HookCard ${hook.id}] Toggling favorite to: ${newFavoriteState}`);
      
      try {
        const success = await toggleFavorite(hook, newFavoriteState);
        if (success) {
          if (newFavoriteState) {
            showSuccess('Hook added to favorites!');
          } else {
            showInfo('Hook removed from favorites');
          }
        } else {
          // Revert UI if backend failed
          console.warn(`[HookCard ${hook.id}] Toggle favorite failed on backend. Reverting UI.`);
          setFavorite(originalState);
          showError('Could not update favorite status.');
        }
      } catch (error) {
        console.error(`[HookCard ${hook.id}] Error toggling favorite:`, error);
        // Revert UI state if operation failed unexpectedly
        setFavorite(originalState);
        showError('An error occurred while updating favorites.');
      } finally {
        // Always ensure loading state is false after attempt
        setIsLoadingFavorite(false);
        console.log(`[HookCard ${hook.id}] Finished toggling favorite status.`);
      }
    }, 300); // 300ms debounce
  };

  return (
    <div className={`hook-card ${hook.ai_generated ? 'ai-generated' : ''}`}>
      {hook.ai_generated && (
        <span className="ai-badge">
          <i className="fas fa-robot"></i> AI
        </span>
      )}
      
      <div className="hook-text">{hook.text}</div>
      
      <div className="hook-meta">
        {hook.niche && (
          <span className="hook-tag hook-niche">
            <i className="fas fa-tag"></i> {hook.niche}
          </span>
        )}
        {hook.tone && (
          <span className="hook-tag hook-tone">
            <i className="fas fa-music"></i> {hook.tone}
          </span>
        )}
        {hook.length && (
          <span className="hook-tag hook-length">
            <i className="fas fa-ruler"></i> {hook.length}
          </span>
        )}
      </div>
      
      <div className="hook-actions">
        <button 
          className={`action-button favorite-button ${favorite ? 'favorited' : ''}`}
          onClick={handleToggleFavorite}
          title={favorite ? "Remove from favorites" : "Add to favorites"}
          // Disable if loading OR if it's a temporary hook ID
          disabled={isLoadingFavorite || isTemporaryHook} 
        >
          {isLoadingFavorite ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className={`${favorite ? 'fas' : 'far'} fa-star`}></i>
          )}
        </button>
        <button 
          className={`action-button copy-button ${copied ? 'copied' : ''}`} 
          onClick={copyToClipboard}
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <i className="fas fa-check"></i> Copied
            </>
          ) : (
            <>
              <i className="fas fa-copy"></i> Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const HookList = ({ hooks }) => {
  if (!hooks || hooks.length === 0) {
    return (
      <div className="no-hooks">
        <i className="fas fa-search fa-3x"></i>
        <h3>No hooks found</h3>
        <p>Try adjusting your filters or search criteria.</p>
      </div>
    );
  }

  return (
    <div className="hook-list">
      {hooks.map(hook => (
        <HookCard key={hook.id} hook={hook} />
      ))}
    </div>
  );
};

export default HookList; 