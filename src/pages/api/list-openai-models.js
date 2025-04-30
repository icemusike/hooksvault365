// Disable static generation for this endpoint
export const prerender = false;

export async function GET({ request }) {
  try {
    // Get API key from request header
    const apiKey = request.headers.get('x-openai-key');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: "Missing OpenAI API key. Please add your API key in Settings." 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call OpenAI API to get models list
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });

    const data = await response.json();
    
    if (data.error) {
      return new Response(
        JSON.stringify({ error: data.error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Filter for only GPT models that are suitable for chat completions
    // and organize them by type
    const gptModels = data.data
      .filter(model => {
        const id = model.id.toLowerCase();
        return (
          (id.includes('gpt-3.5') || id.includes('gpt-4')) && 
          !id.includes('instruct') && 
          !id.includes('vision')
        );
      })
      .map(model => ({
        id: model.id,
        created: model.created,
        ownedBy: model.owned_by
      }));

    // Categorize models
    const categorizedModels = {
      recommended: [
        'gpt-3.5-turbo',
        'gpt-4',
        'gpt-4-turbo-preview'
      ],
      gpt35: gptModels.filter(model => model.id.includes('gpt-3.5')),
      gpt4: gptModels.filter(model => model.id.includes('gpt-4'))
    };

    return new Response(
      JSON.stringify({ models: categorizedModels }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error fetching OpenAI models:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch models: " + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 