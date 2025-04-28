/**
 * Theme Loader
 * 
 * This script handles theme initialization on page load.
 * Include this in the head of the base layout to ensure
 * consistent theme handling across the application.
 */

import { initializeTheme, setTheme, THEMES } from './themeUtils';

// Export the functions for use in Astro components
export { initializeTheme, setTheme, THEMES };

// The browser-specific code will be loaded via <script> tags in the layouts
// This prevents server-side execution errors

export default initializeTheme; 