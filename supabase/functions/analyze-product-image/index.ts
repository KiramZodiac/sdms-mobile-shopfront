import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

Deno.serve(async (req) => {
  console.log(`Received ${req.method} request to analyze-product-image`);
  
  // Skip authentication check since this is now a public function
  // (Storage is already public, so this can be public too)
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  }

  if (req.method !== "POST") {
    console.log(`Method ${req.method} not allowed`);
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    });
  }

  try {
    console.log("Parsing request body...");
    const body = await req.json();
    console.log("Request body parsed:", body);
    
    // Support both imageUrl and image_url for backward compatibility
    const imageUrl = body.imageUrl || body.image_url;
    
    if (!imageUrl) {
      console.error("Missing imageUrl in request body:", body);
      return new Response(JSON.stringify({
        error: "Missing imageUrl parameter",
        received: Object.keys(body)
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        }
      });
    }

    console.log("Image URL received:", imageUrl);

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("OPENAI_API_KEY environment variable not set");
      return new Response(JSON.stringify({
        error: "OpenAI API key not configured"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        }
      });
    }

    console.log("Creating OpenAI client...");
    const openai = new OpenAI({
      apiKey: apiKey
    });

    console.log("Making OpenAI API request...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional product description writer for e-commerce. Analyze the product image and create: a concise title (max 60 characters), detailed description (150-200 words), short description (max 100 characters), unique SKU (6-8 characters from product name + 4-digit number), and 3-5 key features. Return ONLY valid JSON with fields: 'title', 'description', 'short_description', 'sku', 'features' (array of strings)."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this product image and generate complete product information."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 600,
      response_format: {
        type: "json_object"
      }
    });

    console.log("OpenAI response received");
    const messageContent = response.choices?.[0]?.message?.content;
    
    if (!messageContent) {
      console.error("No content in OpenAI response");
      return new Response(JSON.stringify({
        error: "No response from AI service"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        }
      });
    }

    console.log("Raw AI response:", messageContent);

    let data;
    try {
      data = JSON.parse(messageContent);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw content:", messageContent);
      return new Response(JSON.stringify({
        error: "Invalid response from AI service",
        details: parseError.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        }
      });
    }

    console.log("Parsed AI data:", data);

    // Create response with fallback values
    const result = {
      title: data.title || "Untitled Product",
      description: data.description || "No description generated.",
      short_description: data.short_description || "No short description generated.",
      sku: data.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      features: Array.isArray(data.features) ? data.features : []
    };

    console.log("Returning result:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });

  } catch (error) {
    console.error("Error in analyze-product-image:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({
      error: "Failed to analyze image",
      details: error.message,
      type: error.name || "UnknownError"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}); 