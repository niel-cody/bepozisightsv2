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
  allDailySummaries?: any[];
  importedData?: {
    hasImportedData: boolean;
    totalDays: number;
    dateRange: {
      earliest: string;
      latest: string;
    } | null;
  };
}

async function loadAgentConfig(): Promise<any> {
  try {
    const configPath = path.join(process.cwd(), 'ai-agent-config.json');
    const configFile = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configFile);
  } catch (error) {
    console.warn('Could not load AI agent config, using default behavior');
    return null;
  }
}

export async function analyzePosQuery(
  query: string, 
  context: PosAnalysisContext
): Promise<{ response: string; data?: any }> {
  try {
    const agentConfig = await loadAgentConfig();
    
    let systemPrompt = `You are an AI assistant for a Point of Sale (POS) system, acting as a virtual manager for venue operations. 
    
IMPORTANT: You have access to real business data including:
- Till summaries and cash balances
- Operator performance metrics  
- Product sales data and inventory
- Daily sales summaries (${context.importedData?.hasImportedData ? `${context.importedData.totalDays} days of historical data from ${context.importedData.dateRange?.earliest} to ${context.importedData.dateRange?.latest}` : 'sample data only'})
- Transaction history

${context.importedData?.hasImportedData ? 'REAL DATA AVAILABLE: You have access to actual historical business data. Use specific dates, amounts, and trends from this real data in your responses.' : 'SAMPLE DATA: Currently using sample data only. Encourage user to import their real business data for better insights.'}

Your role is to:
1. Analyze actual POS data and provide specific insights
2. Answer manager questions with real numbers and trends
3. Identify patterns from historical data
4. Provide actionable recommendations based on actual performance
5. Reference specific dates, amounts, and business names from the data

When responding:
- Always use specific numbers, dates, and names from the actual data
- Reference real trends and patterns from the database
- Be conversational but data-driven
- Focus on actionable insights from real business performance
- Highlight notable changes, patterns, or concerns in the data

Current context data: ${JSON.stringify(context)}

Respond in JSON format with this structure:
{
  "response": "Your conversational response using actual data and specific details",
  "data": {
    "metrics": [{"label": "metric name", "value": "actual value from data", "change": "real percentage change"}],
    "insights": ["specific insight from real data", "trend from historical data"],
    "recommendations": ["actionable step based on actual performance", "specific improvement based on data"],
    "charts": [{"type": "bar|line|pie", "title": "chart title", "data": [real data points]}]
  }
}`;

    // If we have custom config, enhance the system prompt with Alex's personality
    if (agentConfig) {
      systemPrompt = `You are ${agentConfig.name}, a ${agentConfig.role}. ${agentConfig.purpose}

Personality: ${agentConfig.personality || 'Professional and helpful'}

Business Context: 
- Venue Type: ${agentConfig.businessContext.venueType}
- Tills: ${agentConfig.businessContext.tills.join(', ')}
- Staff Roles: ${agentConfig.businessContext.staffRoles.join(', ')}
- Product Categories: ${agentConfig.businessContext.productCategories.join(', ')}

DATA CONTEXT: ${context.importedData?.hasImportedData ? `You have access to ${context.importedData.totalDays} days of real McBrew - QLD business data from ${context.importedData.dateRange?.earliest} to ${context.importedData.dateRange?.latest}. Use this actual data to provide specific insights.` : 'Currently using sample data only. Recommend importing real business data for better insights.'}

Communication Style: ${agentConfig.communicationStyle.tone}. ${agentConfig.communicationStyle.language}
Requirements: ${agentConfig.communicationStyle.requirements.join('. ')}

Key Responsibilities:
- Performance Analysis: ${agentConfig.responsibilities.performanceAnalysis.join(', ')}
- Alert Management: ${agentConfig.responsibilities.alertManagement.join(', ')}
- Business Insights: ${agentConfig.responsibilities.businessInsights.join(', ')}

Alert Thresholds: ${JSON.stringify(agentConfig.alertThresholds)}

Key Principles: ${agentConfig.keyPrinciples.join('. ')}

IMPORTANT: 
- Always introduce yourself as ${agentConfig.name} when greeting users or when it feels natural in conversation
- Be personable and remember you're their dedicated virtual manager who knows their business well
- Use ACTUAL data from the database - reference specific dates, amounts, and business names
- Provide insights based on real patterns and trends from the historical data

Current context data: ${JSON.stringify(context, null, 2)}

${systemPrompt}`;
    }

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
