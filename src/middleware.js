// Authentication middleware for API routes

export function isAuthenticated(request) {
  // Check for authenticated session in cookies
  const sessionData = request.cookies.get('hookVault365_session')?.value;
  
  if (!sessionData) {
    return false;
  }
  
  try {
    const session = JSON.parse(sessionData);
    return session && session.isLoggedIn && session.email;
  } catch (error) {
    console.error('Session parsing error:', error);
    return false;
  }
}

// Middleware function to handle API authentication
export async function handleApiAuth(context, next) {
  // Skip auth check for login and registration routes
  if (
    context.url.pathname === '/api/auth/login' || 
    context.url.pathname === '/api/auth/register'
  ) {
    return await next();
  }
  
  // Check if user is authenticated
  if (!isAuthenticated(context.request)) {
    return new Response(JSON.stringify({ 
      success: false,
      message: 'Authentication required'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  // User is authenticated, proceed to the next handler
  return await next();
} 