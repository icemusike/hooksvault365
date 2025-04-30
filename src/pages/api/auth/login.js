// Astro API endpoint for user login
import { DEMO_USER } from '../../../utils/authUtils';

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { email, password } = data;
    
    console.log('API login attempt:', { email }); // Log for debugging
    
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email and password are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Check if credentials match
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      console.log('API login successful for user:', email);
      
      // Create session data
      const sessionData = {
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        isLoggedIn: true,
        isDemoUser: true,
        timestamp: Date.now()
      };
      
      // Set a cookie with session data
      return new Response(JSON.stringify({
        success: true, 
        message: 'Login successful',
        user: {
          email: DEMO_USER.email,
          name: DEMO_USER.name,
          isDemoUser: true
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `hookVault365_session=${JSON.stringify(sessionData)}; Path=/; HttpOnly; Max-Age=604800` // 7 days
        }
      });
    } else {
      console.log('API login failed: invalid credentials');
      
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid email or password'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 