import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function analyzeSentiment(text: string): Promise<{
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  confidence: number;
  category: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a sentiment analysis expert. Analyze the sentiment of customer feedback and provide:
          1. sentiment: "positive", "negative", or "neutral"
          2. score: rating from 1-5 (1=very negative, 3=neutral, 5=very positive)
          3. confidence: confidence level 0-100
          4. category: main topic category like "Product Quality", "Customer Service", "Shipping & Delivery", "Pricing", "Features", or "General"
          
          Respond with JSON in this exact format: { "sentiment": "positive", "score": 4, "confidence": 85, "category": "Product Quality" }`
        },
        {
          role: "user",
          content: `Analyze this customer feedback: "${text}"`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      sentiment: result.sentiment || "neutral",
      score: Math.max(1, Math.min(5, Math.round(result.score || 3))),
      confidence: Math.max(0, Math.min(100, result.confidence || 50)),
      category: result.category || "General"
    };
  } catch (error) {
    console.error("Failed to analyze sentiment:", error);
    // Return neutral sentiment as fallback
    return {
      sentiment: "neutral",
      score: 3,
      confidence: 0,
      category: "General"
    };
  }
}
