import { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

const AIHookGenerator = ({ onHooksGenerated, onError }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [niche, setNiche] = useState('marketing');
  const [tone, setTone] = useState('curious');
  const [count, setCount] = useState(3);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Define templates
  const templates = [
    { name: 'Viral', prompt: 'Create a hook designed to go viral about', tone: 'intriguing' },
    { name: 'Curiosity', prompt: 'Generate a hook that sparks intense curiosity about', tone: 'curious' },
    { name: 'Attention', prompt: 'Write an attention-grabbing hook for', tone: 'shocking' },
    { name: 'High CTR', prompt: 'Craft a hook optimized for high click-through rates about', tone: 'urgent' },
    { name: 'Professional', prompt: 'Compose a professional and authoritative hook regarding', tone: 'authoritative' },
    { name: 'Funny', prompt: 'Make a funny and relatable hook about', tone: 'humorous' }, // Add humorous tone if needed
    { name: 'Business', prompt: 'Write a business-focused hook concerning', tone: 'authoritative' },
  ];

  // Function to apply a template
  const applyTemplate = (template) => {
    setPrompt(template.prompt + ' '); // Add space for user input
    setTone(template.tone);
    // Focus the prompt input
    document.getElementById('hook-prompt')?.focus();
  };

  // Load API key from reliable sources
  useEffect(() => {
    let mounted = true;
    console.log('[AIHookGenerator] Component mounted.');
    
    // Failsafe timeout to ensure loading state eventually clears
    const failsafeTimeoutId = setTimeout(() => {
      if (mounted && isLoading) { // Check isLoading state here
        console.warn('[AIHookGenerator] Failsafe timeout triggered: Forcing isLoading to false.');
        setIsLoading(false);
      }
    }, 8000); // 8 seconds failsafe

    const loadApiKey = async () => {
      if (!mounted) return;
      console.log('[AIHookGenerator] Starting loadApiKey...');
      
      // Optimistically assume not loading if key exists in state
      if (apiKey) {
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
      
      let loadedKey = '';
      let source = 'None';
      
      try {
        // Priority 1: Check localStorage
        loadedKey = localStorage.getItem('openai_api_key') || '';
        if (loadedKey) {
          source = 'localStorage';
          console.log(`[AIHookGenerator] Found key in ${source}.`);
          if (mounted && loadedKey !== apiKey) {
            setApiKey(loadedKey);
            console.log(`[AIHookGenerator] Set apiKey state from ${source}.`);
          }
        } else {
           // Priority 2: Check Supabase only if localStorage is empty
           console.log('[AIHookGenerator] Key not in localStorage, checking Supabase profile...');
           try {
             const { data: { session }, error: sessionError } = await supabase.auth.getSession();
             if (sessionError) {
               console.warn('[AIHookGenerator] Error getting Supabase session:', sessionError.message);
             } else if (session?.user) {
               const { data: profileData, error: profileError } = await supabase
                 .from('user_profiles')
                 .select('openai_api_key')
                 .eq('id', session.user.id)
                 .maybeSingle();
               
               if (profileError) {
                 console.warn('[AIHookGenerator] Error fetching user profile:', profileError.message);
               } else if (profileData?.openai_api_key) {
                 loadedKey = profileData.openai_api_key;
                 source = 'Supabase Profile';
                 localStorage.setItem('openai_api_key', loadedKey);
                 localStorage.setItem('api_keys_updated_at', Date.now().toString());
                 console.log(`[AIHookGenerator] Loaded API key from ${source} and cached locally.`);
                 if (mounted && loadedKey !== apiKey) {
                   setApiKey(loadedKey);
                   console.log(`[AIHookGenerator] Set apiKey state from ${source}.`);
                 }
               } else {
                 console.log('[AIHookGenerator] No key found in user_profiles table.');
               }
             } else {
               console.log('[AIHookGenerator] No active session found for Supabase check.');
             }
           } catch (supabaseError) {
             console.warn('[AIHookGenerator] Could not retrieve API key from Supabase:', supabaseError);
           }
        }
        
      } catch (error) {
        console.error('[AIHookGenerator] Error during loadApiKey:', error);
      } finally {
        if (mounted) {
           // Always ensure isLoading is set to false in finally
           console.log('[AIHookGenerator] Reached finally block in loadApiKey. Setting isLoading=false.');
           setIsLoading(false); 
        }
      }
    };

    loadApiKey();

    // Listener for cross-tab changes
    const handleStorageChange = (e) => {
      if (e.key === 'openai_api_key') {
        if (mounted) {
          const newValue = e.newValue || '';
          console.log(`[AIHookGenerator] Storage event detected. New key empty: ${!newValue}`);
          setApiKey(newValue);
          setIsLoading(false); // Ensure loading is false after update
        }
      }
    };

    // Listener for same-tab changes (from settings page save)
    const handleApiKeyUpdatedEvent = (e) => {
      if (mounted) {
        const newKey = e.detail?.openaiKey || localStorage.getItem('openai_api_key') || '';
        console.log(`[AIHookGenerator] Custom event 'apiKeyUpdated' received. New key empty: ${!newKey}`);
        setApiKey(newKey);
        setIsLoading(false); 
        console.log('[AIHookGenerator] setIsLoading(false) after custom event.');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('apiKeyUpdated', handleApiKeyUpdatedEvent);

    // Cleanup function
    return () => {
      mounted = false;
      clearTimeout(failsafeTimeoutId); // Clear the failsafe timer on unmount
      console.log('[AIHookGenerator] Component unmounted.');
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('apiKeyUpdated', handleApiKeyUpdatedEvent);
    };
  }, []); // Run only once on mount

  // Log state just before returning the JSX
  console.log(`[AIHookGenerator] FINAL RENDER STATE - isLoading: ${isLoading}, apiKey empty: ${!apiKey}`);

  // Navigate to settings with integrations tab active
  const goToIntegrations = () => {
    window.location.href = '/settings';
    // Store in session that we want to switch to integrations tab
    sessionStorage.setItem('open_settings_tab', 'integrations');
  };

  // Force refresh API key state directly before generation
  const generateHooks = async () => {
    const currentApiKey = localStorage.getItem('openai_api_key') || apiKey;
    if (!currentApiKey) {
      onError("OpenAI API key is required. Please add your API key in Settings → Integrations.");
      return;
    }
    
    setApiKey(currentApiKey); // Ensure state is up-to-date

    if (!prompt) {
      onError("Please enter a topic or select a template.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-hooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openai-key': currentApiKey // Use the most recently fetched key
        },
        body: JSON.stringify({
          prompt,
          niche,
          tone,
          count: parseInt(count)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate hooks.');
      }

      onHooksGenerated(data.hooks);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="ai-generator card-style">
      <div className="generator-header">
        <h3>
          <i className="fas fa-wand-magic-sparkles"></i> Create with AI
        </h3>
        <p>Generate custom hooks instantly. Start with a template or write your own prompt.</p>
      </div>

      {/* Template Section */}
      <div className="template-section">
        <p className="template-title">Start with a Template:</p>
        <div className="template-buttons">
          {templates.map((template) => (
            <button 
              key={template.name}
              className="template-button"
              onClick={() => applyTemplate(template)}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="generator-separator"><span>OR</span></div>

      {/* Generator Form */}
      <div className="generator-form">
        <div className="form-group">
          <label htmlFor="hook-prompt">Describe your hook topic:</label>
          <textarea
            id="hook-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'a surprising fact about coffee' or 'the biggest mistake new investors make'"
            className="prompt-input"
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="hook-niche">Niche</label>
            <select
              id="hook-niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="select-input"
            >
              <option value="marketing">Marketing</option>
              <option value="finance">Finance</option>
              <option value="health">Health</option>
              <option value="fitness">Fitness</option>
              <option value="business">Business</option>
              <option value="relationships">Relationships</option>
              <option value="personal development">Personal Development</option>
              <option value="technology">Technology</option>
              <option value="general">General / Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="hook-tone">Tone</label>
            <select
              id="hook-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="select-input"
            >
              <option value="curious">Curious</option>
              <option value="urgent">Urgent</option>
              <option value="intriguing">Intriguing</option>
              <option value="shocking">Shocking</option>
              <option value="authoritative">Authoritative</option>
              <option value="controversial">Controversial</option>
              <option value="contrarian">Contrarian</option>
              <option value="inspiring">Inspiring</option>
              <option value="humorous">Funny / Humorous</option>
            </select>
          </div>

          <div className="form-group count-group">
            <label htmlFor="hook-count">Number</label>
            <select
              id="hook-count"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="select-input"
            >
              <option value="1">1</option>
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
            </select>
          </div>
        </div>

        <div className="generator-actions">
          <button
            className="generate-button"
            onClick={generateHooks}
            disabled={isGenerating || !prompt.trim() || !apiKey || isLoading}
          >
            {isGenerating ? (
              <><i className="fas fa-spinner fa-spin"></i> Generating...</>
            ) : isLoading ? (
              <><i className="fas fa-spinner fa-spin"></i> Loading API Key...</>
            ) : (
              <><i className="fas fa-wand-magic-sparkles"></i> Generate Hooks</>
            )}
          </button>
        </div>
      </div>

      {!apiKey && !isLoading && (
        <div className="api-key-notice">
          <i className="fas fa-info-circle"></i>
          <p>
            OpenAI API key is required. Please add your API key in{" "}
            <button onClick={goToIntegrations} className="link-button">
              Settings &rarr; Integrations
            </button>
          </p>
        </div>
      )}
      
      {apiKey && (
        <div className="api-key-status">
          <i className="fas fa-check-circle"></i>
          <p>
            API key is loaded.{" "}
            <button
              onClick={() => {
                // Force reload the API key
                setIsLoading(true);
                setTimeout(() => {
                  const freshKey = localStorage.getItem('openai_api_key') || '';
                  setApiKey(freshKey);
                  setIsLoading(false);
                }, 500);
              }}
              className="link-button"
            >
              Reload API Key
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default AIHookGenerator; 