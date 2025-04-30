// Disable static generation for this endpoint
export const prerender = false;

export async function POST({ request }) {
  try {
    const { prompt, niche, tone, count, model } = await request.json();
    
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

    // Validate inputs
    if (!prompt || !niche || !tone || !count) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use provided model or default to gpt-3.5-turbo
    const selectedModel = model || "gpt-3.5-turbo";

    // Construct a detailed prompt for OpenAI
    const systemPrompt = `You are an expert copywriter specializing in creating compelling hook sentences that grab attention.
    You create pattern interrupt hooks that make people stop scrolling and pay attention.`;
    
    const userPrompt = `Generate ${count} unique, attention-grabbing hook sentences for the ${niche} niche with a ${tone} tone.
    ${prompt ? `The hooks should be about: ${prompt}` : ''}
    
    Rules:
    - Each hook should be 10-20 words maximum
    - Hooks should be engaging and make people want to read more
    - Avoid clickbait clichés while still being compelling
    - Make each hook different in structure and approach
    - Return ONLY the hooks, one per line, without numbering or any other text.`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.85,
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return new Response(
        JSON.stringify({ error: data.error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse the response and format hooks
    const content = data.choices[0].message.content.trim();
    const hooks = content.split('\n')
      .filter(hook => hook.trim().length > 0)
      .map((text, index) => ({
        id: `ai-${Date.now()}-${index}`,
        text: text.trim().replace(/^["']|["']$/g, ''), // Remove quotes if present
        niche,
        tone,
        length: text.length < 50 ? "short" : text.length > 100 ? "long" : "medium",
        ai_generated: true,
        model: selectedModel // Include the model used for generation
      }));

    return new Response(
      JSON.stringify({ hooks }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error generating hooks:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate hooks: " + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 