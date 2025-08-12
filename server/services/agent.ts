import OpenAI from "openai";
import { storage } from "../storage";

// Initialize OpenAI client directly with function calling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Tool definitions for function calling
const tools = [
  {
    type: "function" as const,
    function: {
      name: "getRevenueComparison",
      description: "Get revenue data to compare time periods (this month vs last month, etc.)",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            description: "Time period for comparison: 'month', 'week', 'day'",
            enum: ["month", "week", "day"]
          }
        },
        required: ["period"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getBusinessSummary",
      description: "Get overall business summary and key metrics",
      parameters: {
        type: "object",
        properties: {
          includeToday: {
            type: "boolean",
            description: "Whether to include today's data",
            default: true
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getTopPerformingStaff",
      description: "Get information about top performing operators/staff members",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            description: "Time period to analyze: 'week', 'month'",
            enum: ["week", "month"]
          },
          limit: {
            type: "number",
            description: "Number of top performers to return",
            default: 5
          }
        },
        required: ["period"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getStaffDetails",
      description: "Get detailed information about a specific staff member including refunds, sales metrics, etc.",
      parameters: {
        type: "object",
        properties: {
          staffName: {
            type: "string",
            description: "Name or partial name of the staff member to look up"
          }
        },
        required: ["staffName"]
      }
    }
  }
];

// Function implementations
const functions = {

  getRevenueComparison: async (args: { period: string }) => {
    try {
      const summaries = await storage.getDailySummaries();
      const now = new Date();
      
      let currentPeriodStart: Date;
      let previousPeriodStart: Date;
      let previousPeriodEnd: Date;
      
      if (args.period === "month") {
        // Current month
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        // Previous month
        previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      } else if (args.period === "week") {
        // Current week (last 7 days)
        currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        // Previous week
        previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        // Yesterday vs day before
        currentPeriodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        previousPeriodEnd = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      
      // Filter summaries for current period
      const currentPeriodSummaries = summaries.filter(s => {
        const date = new Date(s.date);
        return date >= currentPeriodStart;
      });
      
      // Filter summaries for previous period
      const previousPeriodSummaries = summaries.filter(s => {
        const date = new Date(s.date);
        return date >= previousPeriodStart && date <= previousPeriodEnd;
      });
      
      // Calculate totals using the correct field name
      const currentRevenue = currentPeriodSummaries.reduce((sum, s) => sum + parseFloat(s.nettTotal || "0"), 0);
      const previousRevenue = previousPeriodSummaries.reduce((sum, s) => sum + parseFloat(s.nettTotal || "0"), 0);
      const currentTransactions = currentPeriodSummaries.reduce((sum, s) => sum + (s.transactionCount || 0), 0);
      const previousTransactions = previousPeriodSummaries.reduce((sum, s) => sum + (s.transactionCount || 0), 0);
      
      const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const transactionChange = previousTransactions > 0 ? ((currentTransactions - previousTransactions) / previousTransactions) * 100 : 0;
      
      return {
        currentPeriod: {
          revenue: currentRevenue,
          transactions: currentTransactions,
          days: currentPeriodSummaries.length,
          avgDaily: currentPeriodSummaries.length > 0 ? currentRevenue / currentPeriodSummaries.length : 0
        },
        previousPeriod: {
          revenue: previousRevenue,
          transactions: previousTransactions,
          days: previousPeriodSummaries.length,
          avgDaily: previousPeriodSummaries.length > 0 ? previousRevenue / previousPeriodSummaries.length : 0
        },
        changes: {
          revenueChange: revenueChange,
          transactionChange: transactionChange,
          revenueDirection: revenueChange > 0 ? "increased" : revenueChange < 0 ? "decreased" : "stayed the same"
        }
      };
    } catch (error) {
      console.error("Error getting revenue comparison:", error);
      return { error: "Could not retrieve revenue comparison data" };
    }
  },

  getTopPerformingStaff: async (args: { period: string; limit?: number }) => {
    try {
      const operators = await storage.getOperators();
      const limit = args.limit || 5;
      
      // Sort operators by total sales and return top performers
      const topOperators = operators
        .sort((a, b) => parseFloat(b.totalSales || "0") - parseFloat(a.totalSales || "0"))
        .slice(0, limit)
        .map(op => ({
          name: op.name,
          totalSales: parseFloat(op.totalSales || "0"),
          transactionCount: op.transactionCount || 0,
          avgTransaction: op.transactionCount && op.transactionCount > 0 ? parseFloat(op.totalSales || "0") / op.transactionCount : 0,
          // Include additional details for context
          role: op.role,
          status: op.status,
          employeeId: op.employeeId
        }));
      
      return { topPerformers: topOperators, period: args.period };
    } catch (error) {
      console.error("Error getting top performing staff:", error);
      return { error: "Could not retrieve staff performance data" };
    }
  },

  getStaffDetails: async (args: { staffName: string }) => {
    try {
      const operators = await storage.getOperators();
      
      // Find staff member by name (case insensitive)
      const staffMember = operators.find(op => 
        op.name.toLowerCase().includes(args.staffName.toLowerCase())
      );
      
      if (!staffMember) {
        return { error: `Could not find staff member with name containing "${args.staffName}"` };
      }
      
      return {
        name: staffMember.name,
        role: staffMember.role,
        status: staffMember.status,
        employeeId: staffMember.employeeId,
        totalSales: parseFloat(staffMember.totalSales || "0"),
        transactionCount: staffMember.transactionCount || 0,
        avgTransaction: staffMember.transactionCount && staffMember.transactionCount > 0 ? 
          parseFloat(staffMember.totalSales || "0") / staffMember.transactionCount : 0,
        grossSales: parseFloat(staffMember.grossSales || "0"),
        totalDiscount: parseFloat(staffMember.totalDiscount || "0"),
        lastTransactionDate: staffMember.lastTransactionDate
      };
    } catch (error) {
      console.error("Error getting staff details:", error);
      return { error: "Could not retrieve staff details" };
    }
  },

  getProductSales: async (args: { type: string; limit?: number }) => {
    try {
      const products = await storage.getProducts();
      
      if (args.type === "top-selling") {
        const limit = args.limit || 10;
        const topProducts = products
          .sort((a, b) => parseFloat(b.revenue || "0") - parseFloat(a.revenue || "0"))
          .slice(0, limit)
          .map(p => ({
            name: p.name,
            revenue: parseFloat(p.revenue || "0"),
            quantitySold: p.soldToday || 0,
            avgPrice: (p.soldToday && p.soldToday > 0) ? parseFloat(p.revenue || "0") / p.soldToday : parseFloat(p.price || "0")
          }));
        
        return { topProducts, period: "all-time" };
      } else {
        return { 
          totalProducts: products.length,
          totalRevenue: products.reduce((sum, p) => sum + parseFloat(p.revenue || "0"), 0),
          totalQuantity: products.reduce((sum, p) => sum + (p.soldToday || 0), 0)
        };
      }
    } catch (error) {
      console.error("Error getting product sales:", error);
      return { error: "Could not retrieve product sales data" };
    }
  },

  getBusinessSummary: async (args: { includeToday?: boolean }) => {
    try {
      const [tills, operators, products, todaySummary, summaries] = await Promise.all([
        storage.getTills(),
        storage.getOperators(),
        storage.getProducts(),
        args.includeToday ? storage.getDailySummary(new Date().toISOString().split('T')[0]) : null,
        storage.getDailySummaries()
      ]);
      
      return {
        today: todaySummary ? {
          revenue: parseFloat(todaySummary.nettTotal || "0"),
          transactions: todaySummary.transactionCount || 0,
          avgTransaction: todaySummary.transactionCount > 0 ? parseFloat(todaySummary.nettTotal || "0") / todaySummary.transactionCount : 0
        } : null,
        totals: {
          tills: tills.length,
          operators: operators.length,
          products: products.length,
          historicalDays: summaries.length,
          totalHistoricalRevenue: summaries.reduce((sum, s) => sum + parseFloat(s.nettTotal || "0"), 0),
          dateRange: summaries.length > 0 ? {
            earliest: summaries[0]?.date,
            latest: summaries[summaries.length - 1]?.date
          } : null
        }
      };
    } catch (error) {
      console.error("Error getting business summary:", error);
      return { error: "Could not retrieve business summary data" };
    }
  }
};

// Main agent chat function with function calling and conversation memory
export async function agentChat(message: string, conversationId: string, model: string = "gpt-4o-mini"): Promise<{ content: string }> {
  try {
    // Get conversation history to maintain context
    const conversationHistory = await storage.getChatMessages(conversationId);
    
    // Build conversation context from history
    const messages = [
      {
        role: "system" as const,
        content: `You are Alex, a virtual manager AI assistant for a Point of Sale (POS) system. 
        
Your role is to help analyze business data and provide insights about sales, staff performance, and operations.

You have access to these functions to get real business data:
- getRevenueComparison: Compare revenue across time periods
- getBusinessSummary: Get overall business metrics and today's performance  
- getTopPerformingStaff: Get information about top performing staff members
- getStaffDetails: Get detailed information about a specific staff member

IMPORTANT: Maintain conversation context. When users ask follow-up questions like "did he also do refunds?" or mention names like "Brendan Catering", refer back to previous messages in the conversation to understand what they're referring to. Use getStaffDetails to get specific information about staff members mentioned in conversation.

Use these functions to answer questions with real data. Be conversational, friendly, and provide actionable insights.

When users ask about revenue comparisons, use getRevenueComparison.
When users ask for general business overview, use getBusinessSummary.
When users ask about staff performance, use getTopPerformingStaff.
When users ask about specific staff members or refunds, use getStaffDetails.`
      }
    ];

    // Add conversation history (limit to last 10 exchanges to avoid token limits)
    const recentHistory = conversationHistory.slice(-10);
    for (const historyItem of recentHistory) {
      messages.push({
        role: "user" as const,
        content: historyItem.message
      });
      messages.push({
        role: "assistant" as const,
        content: historyItem.response
      });
    }

    // Add current message
    messages.push({
      role: "user" as const,
      content: message
    });

    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      tools: tools,
      tool_choice: "auto"
    });

    const responseMessage = response.choices[0].message;
    
    // Handle function calls
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const functionResults = [];
      
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        if (functions[functionName as keyof typeof functions]) {
          const result = await (functions as any)[functionName](functionArgs);
          functionResults.push({
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          });
        }
      }
      
      // Add function results to conversation and get final response
      const finalMessages = [
        ...messages,
        responseMessage,
        ...functionResults.map(result => ({
          role: "tool" as const,
          tool_call_id: result.tool_call_id,
          content: result.content
        }))
      ];
      
      const finalResponse = await openai.chat.completions.create({
        model: model,
        messages: finalMessages
      });
      
      return { content: finalResponse.choices[0].message.content || "I couldn't generate a response." };
    }
    
    return { content: responseMessage.content || "I couldn't generate a response." };
  } catch (error) {
    console.error("Agent chat error:", error);
    throw new Error("Failed to get AI response");
  }
}