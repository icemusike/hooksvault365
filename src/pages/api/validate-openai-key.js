// src/pages/api/validate-openai-key.js
// Disable static generation for this endpoint
export const prerender = false;

export async function POST({ request }) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ valid: false, error: 'API Key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Make a simple, low-cost request to OpenAI to validate the key
    // Listing models is a good way to check authentication without significant cost
    const validationUrl = 'https://api.openai.com/v1/models'; 
    const response = await fetch(validationUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      // Key is valid if the request succeeds
      return new Response(JSON.stringify({ valid: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Key is invalid or there was another issue
      const errorData = await response.json().catch(() => ({})); // Try to get error details
      console.error('OpenAI API Key Validation Error:', response.status, errorData);
      return new Response(JSON.stringify({ 
        valid: false, 
        error: errorData?.error?.message || `Invalid API Key (Status: ${response.status})` 
      }), {
        status: 401, // Unauthorized or Bad Request are common for invalid keys
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error("Error validating OpenAI key:", error);
    return new Response(JSON.stringify({ valid: false, error: 'Server error during validation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 