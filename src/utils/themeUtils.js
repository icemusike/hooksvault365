/**
 * Theme management utilities
 */

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// CSS variables for themes
export const THEME_VARS = {
  [THEMES.LIGHT]: {
    '--bg-primary': '#ffffff', /* Pure White */
    '--bg-secondary': '#f7f7f7', /* Very Light Gray */
    '--text-primary': '#1a1a1a', /* Near Black */
    '--text-secondary': '#5c5c5c', /* Medium Gray */
    '--border-color': '#e0e0e0', /* Light Gray Border */
    '--accent': '195, 27, 27', /* Primary Red (e.g., #C31B1B) */
    '--accent-dark': '166, 22, 22', /* Darker Red for hover (e.g., #A61616) */
    '--accent-light': '249, 224, 224', /* Lighter Red for backgrounds (e.g., #F9E0E0) */
    '--accent-text': '255, 255, 255', /* White text for high contrast on accent */
    '--accent-gradient': 'linear-gradient(45deg, rgb(var(--accent)), rgb(var(--accent-dark)) 30%, rgb(var(--accent-light)) 60%)',
    '--success': '#10b981',
    '--error': '#ef4444',
    '--warning': '#f59e0b',
    '--info': '#3b82f6',
    '--card-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    '--input-bg': '#f9fafb'
  },
  [THEMES.DARK]: {
    '--bg-primary': '#121212', /* Very dark gray, similar to YouTube dark */
    '--bg-secondary': '#212121', /* Dark gray, for cards and sidebar */
    '--text-primary': '#ffffff', /* Pure white text for high contrast */
    '--text-secondary': '#aaaaaa', /* Light gray text for secondary elements */
    '--border-color': '#303030', /* Medium dark gray for borders */
    '--accent': '230, 33, 23', /* Slightly brighter red for dark mode */
    '--accent-light': '255, 120, 110', /* Lighter red */
    '--accent-dark': '180, 27, 18', /* Darker red */
    '--accent-text': '255, 255, 255', /* White text for high contrast on accent */
    '--accent-gradient': 'linear-gradient(45deg, rgb(var(--accent)), rgb(var(--accent-light)) 30%, #303030 60%)',
    '--success': '#34d399', /* Emerald 400 */
    '--error': '#f87171', /* Red 400 */
    '--warning': '#fbbf24', /* Amber 400 */
    '--info': '#60a5fa', /* Blue 400 */
    '--card-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -1px rgba(0, 0, 0, 0.25)',
    '--input-bg': '#1e1e1e' /* Darker input background */
  }
};

/**
 * Initialize theme based on stored preference or system preference
 */
export const initializeTheme = () => {
  if (typeof window === 'undefined') return;
  
  // Check if user wants to remember theme preference
  const rememberTheme = localStorage.getItem('remember_theme') !== 'false';
  
  if (rememberTheme) {
    // Use the stored preference or default to light theme
    const storedTheme = localStorage.getItem('app_theme') || THEMES.LIGHT;
    setTheme(storedTheme, false); // Apply without saving again
  } else {
    // Default to light theme if not remembering preferences
    setTheme(THEMES.LIGHT, false);
  }
};

/**
 * Apply theme to document
 * @param {string} theme - Theme to apply (light, dark, system)
 * @param {boolean} savePreference - Whether to save the theme preference to localStorage (default: true)
 */
export const setTheme = (theme, savePreference = true) => {
  if (typeof window === 'undefined') return;
  
  // Save theme preference if requested
  if (savePreference) {
    localStorage.setItem('app_theme', theme);
  }
  
  // Determine which theme to apply
  let activeTheme = theme;
  if (theme === THEMES.SYSTEM) {
    activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? THEMES.DARK 
      : THEMES.LIGHT;
  }
  
  // Apply theme class to document
  document.documentElement.classList.remove(THEMES.LIGHT, THEMES.DARK);
  document.documentElement.classList.add(activeTheme);
  
  // Apply CSS variables
  const themeVars = THEME_VARS[activeTheme];
  Object.entries(themeVars).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
};

/**
 * Toggle between light and dark themes
 */
export const toggleTheme = () => {
  if (typeof window === 'undefined') return;
  
  const currentTheme = localStorage.getItem('app_theme') || THEMES.LIGHT;
  const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
  
  setTheme(newTheme);
  return newTheme;
};

/**
 * Get current theme
 * @returns {string} Current theme
 */
export const getCurrentTheme = () => {
  if (typeof window === 'undefined') return THEMES.LIGHT;
  return localStorage.getItem('app_theme') || THEMES.LIGHT;
};

export default {
  THEMES,
  initializeTheme,
  setTheme,
  toggleTheme,
  getCurrentTheme
}; 