import OpenAI from "openai";
import fs from 'fs/promises';
import path from 'path';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface PosAnalysisContext {
  tills: any[];
  operators: any[];
  products: any[];
  dailySummary: any;
  recentTransactions: any[];
}

async function loadAgentInstructions(): Promise<string> {
  try {
    const instructionsPath = path.join(process.cwd(), 'ai-agent-instructions.md');
    const instructions = await fs.readFile(instructionsPath, 'utf-8');
    return instructions;
  } catch (error) {
    console.warn('Could not load AI agent instructions, using default behavior');
    return '';
  }
}

export async function analyzePosQuery(
  query: string, 
  context: PosAnalysisContext
): Promise<{ response: string; data?: any }> {
  try {
    const agentInstructions = await loadAgentInstructions();
    
    const systemPrompt = agentInstructions || `You are an AI assistant for a Point of Sale (POS) system, acting as a virtual manager for venue operations. 
    
You have access to the following data:
- Till summaries and cash balances
- Operator performance metrics
- Product sales data and inventory
- Daily sales summaries
- Transaction history

Your role is to:
1. Analyze POS data and provide insights
2. Answer manager questions about business performance
3. Identify trends, alerts, and opportunities
4. Provide actionable recommendations
5. Present data in a clear, manager-friendly way

When responding:
- Be conversational but professional
- Focus on actionable insights
- Highlight important metrics and trends
- Suggest specific actions when appropriate
- Use the actual data provided in context

Current context data: ${JSON.stringify(context)}

Respond in JSON format with this structure:
{
  "response": "Your conversational response to the manager",
  "data": {
    "metrics": [{"label": "metric name", "value": "metric value", "change": "percentage change"}],
    "insights": ["insight 1", "insight 2"],
    "recommendations": ["action 1", "action 2"],
    "charts": [{"type": "bar|line|pie", "title": "chart title", "data": []}]
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      response: result.response || "I'm having trouble processing that request right now.",
      data: result.data || null
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to analyze query. Please try again.");
  }
}

export async function generateInsights(context: PosAnalysisContext): Promise<string[]> {
  try {
    const prompt = `Based on this POS data, generate 3-5 key business insights that a manager should know:
    
${JSON.stringify(context)}

Respond with JSON: {"insights": ["insight 1", "insight 2", ...]}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.insights || [];
  } catch (error) {
    console.error("Error generating insights:", error);
    return ["Unable to generate insights at this time."];
  }
}
