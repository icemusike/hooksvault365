// Authentication middleware for API routes

import { defineMiddleware, sequence } from "astro:middleware";

function isAuthenticated(request) {
  // Check for authenticated session in cookies
  const sessionData = request.cookies.get('hookVault365_session')?.value;
  
  if (!sessionData) {
    return false;
  }
  
  try {
    const session = JSON.parse(sessionData);
    // You might want to add more robust validation here (e.g., token expiry)
    return session && session.isLoggedIn && session.email;
  } catch (error) {
    console.error('Session parsing error:', error);
    // Clear potentially invalid cookie
    request.cookies.delete('hookVault365_session'); 
    return false;
  }
}

// Define the authentication middleware
const authMiddleware = defineMiddleware(async (context, next) => {
  const { request, url } = context;

  // Allow access to auth API routes and the landing page without authentication
  const publicPaths = ['/api/auth/login', '/api/auth/register', '/landing'];
  if (publicPaths.includes(url.pathname) || url.pathname.startsWith('/assets/') || url.pathname.endsWith('.svg')) {
    return await next();
  }

  // Redirect to login if not authenticated and trying to access protected routes
  if (!isAuthenticated(request)) {
    // For API routes, return 401
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Authentication required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // For page routes, redirect to login
    return context.redirect('/login'); 
  }

  // User is authenticated, proceed
  return await next();
});

// Export the middleware sequence
export const onRequest = sequence(authMiddleware); 