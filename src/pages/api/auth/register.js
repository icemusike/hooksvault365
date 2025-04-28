export async function post({ request }) {
  try {
    const data = await request.json();
    const { name, email, password } = data;
    
    if (!name || !email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Name, email, and password are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // In a real application, you would store the user in a database
    // For this demo, we'll simply return a success response
    // You would also hash the password before storing it
    
    // Check if email is already used (demo@example.com is reserved)
    if (email === 'demo@example.com') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email is already registered'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: 'Registration successful'
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
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