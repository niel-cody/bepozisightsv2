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
    // Load the compiled comprehensive context file
    const compiledPath = path.join(process.cwd(), 'context', 'compiled', 'alex_context.compiled.json');
    
    try {
      const compiledFile = await fs.readFile(compiledPath, 'utf-8');
      const compiledConfig = JSON.parse(compiledFile);
      
      console.log('✓ Loaded comprehensive Alex context from compiled configuration');
      console.log('Agent:', compiledConfig.agent?.name, '-', compiledConfig.agent?.role);
      console.log('Schema version:', compiledConfig.schemaVersion);
      
      return compiledConfig;
    } catch (compiledError) {
      console.log('⚠ Compiled context not found, trying modular context files');
      
      // Fallback to modular approach
      const basePath = path.join(process.cwd(), 'context', 'context.base.json');
      const dataModelPath = path.join(process.cwd(), 'context', 'data_model.json');
      
      let composedConfig: any = {};
      
      try {
        // Load base configuration
        const baseFile = await fs.readFile(basePath, 'utf-8');
        const baseConfig = JSON.parse(baseFile);
        composedConfig = { ...baseConfig };
        
        // Load data model configuration
        const dataModelFile = await fs.readFile(dataModelPath, 'utf-8');
        const dataModelConfig = JSON.parse(dataModelFile);
        composedConfig.dataModel = dataModelConfig.dataModel;
        
        console.log('✓ Loaded modular AI context from context/ folder');
        return composedConfig;
      } catch (contextError) {
        console.log('⚠ All context files not found, using minimal configuration');
        return null;
      }
    }
  } catch (error) {
    console.warn('Could not load AI agent config, using default behavior');
    return null;
  }
}

// Intelligent data filtering based on query context
function filterRelevantData(query: string, context: PosAnalysisContext): PosAnalysisContext {
  const queryLower = query.toLowerCase();
  
  // Determine time range needed based on query keywords
  let daysNeeded = 7; // default
  
  if (queryLower.includes('last month') || queryLower.includes('this month') || queryLower.includes('compare') && queryLower.includes('month')) {
    daysNeeded = 60; // Need 2 months for comparison
  } else if (queryLower.includes('last week') || queryLower.includes('this week')) {
    daysNeeded = 14; // Need 2 weeks for comparison
  } else if (queryLower.includes('yesterday') || queryLower.includes('today')) {
    daysNeeded = 2; // Just recent data
  } else if (queryLower.includes('quarter') || queryLower.includes('seasonal')) {
    daysNeeded = 90; // 3 months for quarterly analysis
  } else if (queryLower.includes('year') || queryLower.includes('annual')) {
    daysNeeded = 365; // Full year data
  }
  
  // Filter daily summaries to only relevant timeframe, but cap at maximum 3 to prevent token limits
  const maxDays = Math.min(daysNeeded, 3);
  const filteredDailySummaries = context.allDailySummaries 
    ? context.allDailySummaries.slice(-maxDays)
    : context.allDailySummaries;
  
  // Determine which data types are needed
  const needsOperatorData = queryLower.includes('staff') || queryLower.includes('operator') || 
                           queryLower.includes('employee') || queryLower.includes('performance');
  const needsProductData = queryLower.includes('product') || queryLower.includes('item') || 
                          queryLower.includes('coffee') || queryLower.includes('food') || queryLower.includes('selling');
  const needsTillData = queryLower.includes('till') || queryLower.includes('register') || 
                       queryLower.includes('counter') || queryLower.includes('location');
  const needsTransactionData = queryLower.includes('transaction') || queryLower.includes('payment') || 
                              queryLower.includes('customer') || queryLower.includes('sale');
  
  // Create minimal context - remove large datasets entirely
  const filteredContext: PosAnalysisContext = {
    tills: [], // Removed to prevent token overflow
    operators: [], // Removed to prevent token overflow  
    products: [], // Removed to prevent token overflow
    dailySummary: context.dailySummary, // Keep current summary only
    recentTransactions: [], // Removed to prevent token overflow
    allDailySummaries: [], // Removed to prevent token overflow - use summary stats instead
    importedData: {
      hasImportedData: context.importedData?.hasImportedData || false,
      totalDays: context.importedData?.totalDays || 0,
      dateRange: context.importedData?.dateRange || null
    }
  };
  
  return filteredContext;
}

export async function analyzePosQuery(
  query: string, 
  context: PosAnalysisContext,
  model: string = 'gpt-4o-mini'
): Promise<{ response: string; data?: any }> {
  try {
    const agentConfig = await loadAgentConfig();
    
    // Filter data based on query context to optimize token usage
    const filteredContext = filterRelevantData(query, context);
    
    let systemPrompt = `You are an AI assistant for a Point of Sale (POS) system, acting as a virtual manager for venue operations. 
    
IMPORTANT: You have access to real business data including:
- Till summaries and cash balances
- Operator performance metrics  
- Product sales data and inventory
- Daily sales summaries (${filteredContext.importedData?.hasImportedData ? `${filteredContext.allDailySummaries?.length || 0} days of filtered historical data` : 'sample data only'})
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

Business Summary: 
- Total historical days: ${context.importedData?.totalDays || 0}
- Date range: ${context.importedData?.dateRange?.earliest || 'N/A'} to ${context.importedData?.dateRange?.latest || 'N/A'}
- Today's summary: ${context.dailySummary ? `$${context.dailySummary.totalSales || 0} revenue, ${context.dailySummary.transactionCount || 0} transactions` : 'No data available'}

NOTE: Detailed data filtered to prevent token limits. Provide insights based on available summary information.

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
      // Handle both modular context format (with agent object) and legacy format
      const agentInfo = agentConfig.agent || agentConfig;
      const commStyle = agentConfig.communicationStyle || {};
      
      systemPrompt = `You are ${agentInfo.name || 'Alex'}, a ${agentInfo.role || agentConfig.role}. ${agentInfo.purpose || agentConfig.purpose}

Personality: ${agentInfo.personality || agentConfig.personality || 'Professional and helpful'}

${agentConfig.businessContext ? `Business Context: 
- Venue Type: ${agentConfig.businessContext.venueType}
- Tills: ${agentConfig.businessContext.tills.join(', ')}
- Staff Roles: ${agentConfig.businessContext.staffRoles.join(', ')}
- Product Categories: ${agentConfig.businessContext.productCategories.join(', ')}` : ''}

DATA CONTEXT: ${filteredContext.importedData?.hasImportedData ? `You have access to ${filteredContext.allDailySummaries?.length || 0} days of filtered real McBrew - QLD business data relevant to this query. Use this actual data to provide specific insights.` : 'Currently using sample data only. Recommend importing real business data for better insights.'}

Communication Style: ${commStyle.tone || (agentConfig.communicationStyle && agentConfig.communicationStyle.tone) || 'Professional and supportive'}
${commStyle.language ? `Language: ${commStyle.language}` : ''}
${commStyle.rules ? `Guidelines: ${commStyle.rules.join('. ')}` : ''}
${agentConfig.communicationStyle && agentConfig.communicationStyle.requirements ? `Requirements: ${agentConfig.communicationStyle.requirements.join('. ')}` : ''}

${agentConfig.responsibilities ? `Key Responsibilities:
- Performance Analysis: ${agentConfig.responsibilities.performanceAnalysis.join(', ')}
- Alert Management: ${agentConfig.responsibilities.alertManagement.join(', ')}
- Business Insights: ${agentConfig.responsibilities.businessInsights.join(', ')}` : ''}

${agentConfig.alertThresholds ? `Alert Thresholds: ${JSON.stringify(agentConfig.alertThresholds)}` : ''}

${agentConfig.principles ? `Key Principles: ${agentConfig.principles.join('. ')}` : ''}
${agentConfig.keyPrinciples ? `Key Principles: ${agentConfig.keyPrinciples.join('. ')}` : ''}

${agentConfig.responseContract ? `Response Requirements: ${agentConfig.responseContract.requirements.join('. ')}` : ''}

IMPORTANT: 
- Always introduce yourself as ${agentInfo.name || 'Alex'} when greeting users or when it feels natural in conversation
- Be personable and remember you're their dedicated virtual manager who knows their business well
- Use ACTUAL data from the database - reference specific dates, amounts, and business names
- Provide insights based on real patterns and trends from the historical data

Current context data: ${JSON.stringify(context, null, 2)}

${systemPrompt}`;
    }

    const response = await openai.chat.completions.create({
      model: model, // Dynamic model selection: nano/mini/4o based on user preference
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
      model: "gpt-4o-mini", // Default for insights generation
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
