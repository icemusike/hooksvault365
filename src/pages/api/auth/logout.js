export async function post() {
  // Clear the authentication cookie by setting an expired date
  return new Response(JSON.stringify({
    success: true,
    message: 'Logged out successfully'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'hookVault365_session=; Path=/; HttpOnly; Max-Age=0'
    }
  });
} 