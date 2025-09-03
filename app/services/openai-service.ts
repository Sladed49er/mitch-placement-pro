// app/services/openai-service.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function testOpenAIConnection() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "user", 
          content: "Say 'OpenAI connected successfully!' if you can read this." 
        }
      ],
      max_tokens: 50,
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI connection error:', error);
    throw error;
  }
}

export async function predictCarrierAppetite(placement: any, carriers: any[]) {
  const systemPrompt = `You are an expert Canadian commercial insurance broker.
  
  Analyze this business and predict which carriers would be most likely to quote.
  Consider: industry risk, revenue size, location, years in business, and loss history.
  
  Available carriers: ${carriers.map(c => c.name).join(', ')}
  
  Return a JSON object with this exact structure:
  {
    "topCarriers": [
      {
        "carrierName": "Intact Insurance",
        "quoteProbability": 85,
        "reasoning": "Strong appetite for construction in Ontario",
        "concerns": ["Large employee count"],
        "tips": ["Highlight safety program"]
      }
    ]
  }
  
  Return exactly 5 carriers, ranked by probability.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // Changed from gpt-4-turbo-preview
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Business Details: ${JSON.stringify(placement)}` }
      ],
      temperature: 0.3,
    });
    
    const content = completion.choices[0].message.content;
    console.log('AI Response:', content); // Debug log
    
    try {
      return JSON.parse(content || '{"topCarriers":[]}');
    } catch (parseError) {
      console.error('JSON Parse error:', parseError);
      return { topCarriers: [] };
    }
  } catch (error) {
    console.error('Prediction error:', error);
    throw error;
  }
}
