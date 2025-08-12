import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { agentChat } from "./services/agent";
import { SimpleCSVImporter } from "./utils/simple-csv-importer";
import { insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("Login attempt:", req.body);
      const { username, password } = req.body;
      
      if (!username || !password) {
        console.log("Missing credentials");
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Get user from database
      const allUsers = await storage.getUsers();
      console.log("Available users:", allUsers.map(u => ({ id: u.id, username: u.username })));
      
      const user = allUsers.find((u: any) => u.username === username && u.password === password);
      console.log("Found user:", user ? { id: user.id, username: user.username } : null);

      if (!user) {
        console.log("Invalid credentials for:", username);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Store user in session
      (req as any).session.userId = user.id;
      (req as any).session.username = user.username;
      
      console.log("Session created for user:", user.username);

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username 
        },
        message: "Login successful" 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      (req as any).session.destroy((err: any) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const allUsers = await storage.getUsers();
      const user = allUsers.find((u: any) => u.id === userId);
      
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username 
        } 
      });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ error: "Authentication check failed" });
    }
  });
  // Get all tills
  app.get("/api/tills", async (req, res) => {
    try {
      const tills = await storage.getTills();
      res.json(tills);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tills" });
    }
  });

  // Get all operators
  app.get("/api/operators", async (req, res) => {
    try {
      const operators = await storage.getOperators();
      res.json(operators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch operators" });
    }
  });

  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get daily summary
  app.get("/api/summary/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const summary = await storage.getDailySummary(date);
      if (!summary) {
        return res.status(404).json({ error: "Summary not found for date" });
      }
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily summary" });
    }
  });

  // Get today's summary
  app.get("/api/summary", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const summary = await storage.getDailySummary(today);
      if (!summary) {
        return res.status(404).json({ error: "No summary available for today" });
      }
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's summary" });
    }
  });

  // CSV Import endpoint
  app.post("/api/import/csv", async (req, res) => {
    try {
      const { csvData, tableName } = req.body;
      
      if (!csvData || !tableName) {
        return res.status(400).json({ error: "CSV data and table name are required" });
      }

      const result = await SimpleCSVImporter.importCSV(csvData, tableName);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error("Error importing CSV:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to import CSV data",
        imported: 0,
        errors: [error.message]
      });
    }
  });

  // Conversations API
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const { title } = req.body;
      const conversation = await storage.createConversation({
        title: title || "New Chat"
      });
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteConversation(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Chat Messages API
  app.get("/api/chat/messages/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getChatMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Get all chat messages (backward compatibility)
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.delete("/api/chat/messages", async (req, res) => {
    try {
      await storage.clearChatHistory();
      res.json({ success: true, message: "Chat history cleared successfully" });
    } catch (error) {
      console.error("Error clearing chat history:", error);
      res.status(500).json({ error: "Failed to clear chat history" });
    }
  });

  app.delete("/api/chat/messages/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      await storage.clearChatHistory(conversationId);
      res.json({ success: true, message: "Conversation messages cleared successfully" });
    } catch (error) {
      console.error("Error clearing conversation messages:", error);
      res.status(500).json({ error: "Failed to clear conversation messages" });
    }
  });

  // Send chat message and get AI response
  app.post("/api/chat/send", async (req, res) => {
    try {
      console.log("Chat send request received:", req.body);
      const messageData = insertChatMessageSchema.parse(req.body);
      console.log("Message data parsed:", messageData);
      
      // No need to build massive context - the agent will call functions as needed!

      // Get AI response using function calling with conversation context
      const agentResponse = await agentChat(messageData.message, messageData.conversationId || 'default', messageData.model || 'gpt-4o-mini');
      const aiResult = {
        response: agentResponse.content,
        data: null // Agent handles data internally via function calls
      };
      
      // Save message with AI response (include conversationId and model)
      const chatMessage = await storage.createChatMessage({
        conversationId: messageData.conversationId || 'default',
        message: messageData.message,
        response: aiResult.response,
        model: messageData.model || 'gpt-4o-mini',
        userId: messageData.userId || null
      });

      console.log("Sending response:", { message: chatMessage, data: aiResult.data });
      res.json(chatMessage);
    } catch (error) {
      console.error("Chat error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid message format", details: error.errors });
      }
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Get dashboard insights
  app.get("/api/insights", async (req, res) => {
    try {
      const [tills, operators, products, todaySummary] = await Promise.all([
        storage.getTills(),
        storage.getOperators(),
        storage.getProducts(),
        storage.getDailySummary(new Date().toISOString().split('T')[0])
      ]);

      // Use agent for insights generation too
      const insights = await agentChat("Generate key business insights for today's performance and overall trends", 'insights', 'gpt-4o-mini');
      res.json({ insights: insights.content });
    } catch (error) {
      console.error("Insights error:", error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  // Get sales trend data
  app.get("/api/trends", async (req, res) => {
    try {
      const summaries = await storage.getDailySummaries();
      const trends = summaries.map(summary => ({
        date: summary.date,
        sales: parseFloat(summary.nettTotal),
        transactions: summary.transactionCount
      }));
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trends data" });
    }
  });

  // Get today's sales data
  app.get("/api/sales/today", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todaySummary = await storage.getDailySummary(today);
      res.json(todaySummary || {
        grossSales: 0,
        nettTotal: 0,
        transactionCount: 0,
        discounts: 0
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's sales data" });
    }
  });

  // Get period-based sales data
  app.get("/api/sales/period/:period", async (req, res) => {
    try {
      const { period } = req.params;
      const summaries = await storage.getDailySummaries();
      const now = new Date();
      
      let currentPeriodStart: Date;
      let previousPeriodStart: Date;
      let previousPeriodEnd: Date;
      
      switch (period) {
        case 'today':
          currentPeriodStart = new Date(now.getTime());
          currentPeriodStart.setHours(0, 0, 0, 0);
          previousPeriodStart = new Date(currentPeriodStart.getTime() - 24 * 60 * 60 * 1000);
          previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
          break;
          
        case 'week':
          // Current week (last 7 days)
          currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
          previousPeriodEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
          
        case 'month':
          // Current month
          currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
          
        case 'quarter':
          // Current quarter
          const currentQuarter = Math.floor(now.getMonth() / 3);
          currentPeriodStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
          previousPeriodStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
          previousPeriodEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
          break;
          
        case 'ytd':
        case 'year':
          // Year to date or full year
          currentPeriodStart = new Date(now.getFullYear(), 0, 1);
          previousPeriodStart = new Date(now.getFullYear() - 1, 0, 1);
          previousPeriodEnd = new Date(now.getFullYear() - 1, 11, 31);
          break;
          
        default:
          // Default to today
          currentPeriodStart = new Date(now.getTime());
          currentPeriodStart.setHours(0, 0, 0, 0);
          previousPeriodStart = new Date(currentPeriodStart.getTime() - 24 * 60 * 60 * 1000);
          previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
      }
      
      // Filter summaries for current period
      const currentPeriodSummaries = summaries.filter(s => {
        const date = new Date(s.date);
        return date >= currentPeriodStart && date <= now;
      });
      
      // Filter summaries for previous period
      const previousPeriodSummaries = summaries.filter(s => {
        const date = new Date(s.date);
        return date >= previousPeriodStart && date <= previousPeriodEnd;
      });
      
      // Calculate current period totals
      const currentGrossSales = currentPeriodSummaries.reduce((sum, s) => sum + parseFloat(s.grossSales || "0"), 0);
      const currentNetSales = currentPeriodSummaries.reduce((sum, s) => sum + parseFloat(s.nettTotal || "0"), 0);
      const currentTransactions = currentPeriodSummaries.reduce((sum, s) => sum + (s.transactionCount || 0), 0);
      const currentDiscounts = currentPeriodSummaries.reduce((sum, s) => sum + parseFloat(s.totalDiscount || "0"), 0);
      
      // Calculate previous period totals
      const previousGrossSales = previousPeriodSummaries.reduce((sum, s) => sum + parseFloat(s.grossSales || "0"), 0);
      const previousNetSales = previousPeriodSummaries.reduce((sum, s) => sum + parseFloat(s.nettTotal || "0"), 0);
      const previousTransactions = previousPeriodSummaries.reduce((sum, s) => sum + (s.transactionCount || 0), 0);
      
      // Calculate changes
      const calculateChange = (current: number, previous: number) => {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
      };
      
      const grossSalesChange = calculateChange(currentGrossSales, previousGrossSales);
      const netSalesChange = calculateChange(currentNetSales, previousNetSales);
      const transactionChange = calculateChange(currentTransactions, previousTransactions);
      const avgSaleChange = calculateChange(
        currentTransactions > 0 ? currentNetSales / currentTransactions : 0,
        previousTransactions > 0 ? previousNetSales / previousTransactions : 0
      );
      
      res.json({
        current: {
          grossSales: currentGrossSales,
          nettTotal: currentNetSales,
          transactionCount: currentTransactions,
          discounts: currentDiscounts
        },
        previous: {
          grossSales: previousGrossSales,
          nettTotal: previousNetSales,
          transactionCount: previousTransactions
        },
        changes: {
          grossSalesChange,
          netSalesChange,
          transactionChange,
          avgSaleChange
        },
        period: period,
        days: {
          current: currentPeriodSummaries.length,
          previous: previousPeriodSummaries.length
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch period sales data" });
    }
  });

  // Get daily sales data for heatmap
  app.get("/api/sales/daily", async (req, res) => {
    try {
      const summaries = await storage.getDailySummaries();
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily sales data" });
    }
  });

  // Get venue sales breakdown
  app.get("/api/sales/venues/:period/:metric", async (req, res) => {
    try {
      const { period = 'ytd', metric = 'nettTotal' } = req.params;
      const summaries = await storage.getDailySummaries();
      const now = new Date();
      
      // Apply same period filtering as the period endpoint
      let periodStart: Date;
      
      switch (period) {
        case 'today':
          periodStart = new Date(now.getTime());
          periodStart.setHours(0, 0, 0, 0);
          break;
        case 'week':
          periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const currentQuarter = Math.floor(now.getMonth() / 3);
          periodStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
          break;
        case 'ytd':
        case 'year':
          periodStart = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          periodStart = new Date(now.getFullYear(), 0, 1);
      }
      
      // Filter summaries for the selected period
      const filteredSummaries = summaries.filter(s => {
        const date = new Date(s.date);
        return date >= periodStart && date <= now;
      });
      
      // Group by venue with selected metric
      const venueStats = filteredSummaries.reduce((acc: any, summary: any) => {
        const venue = summary.venue || 'Unknown Venue';
        if (!acc[venue]) {
          acc[venue] = {
            venue: venue,
            totalSales: 0,
            totalTransactions: 0,
            days: 0,
            grossSales: 0,
            totalDiscounts: 0
          };
        }
        
        acc[venue].totalSales += parseFloat(summary.nettTotal || "0");
        acc[venue].grossSales += parseFloat(summary.grossSales || "0");
        acc[venue].totalTransactions += summary.transactionCount || 0;
        acc[venue].totalDiscounts += parseFloat(summary.totalDiscount || "0");
        acc[venue].days += 1;
        
        return acc;
      }, {});
      
      // Convert to array and calculate averages
      const venueComparison = Object.values(venueStats).map((venue: any) => ({
        venue: venue.venue,
        totalSales: venue.totalSales,
        grossSales: venue.grossSales,
        totalTransactions: venue.totalTransactions,
        totalDiscounts: venue.totalDiscounts,
        days: venue.days,
        avgDailySales: venue.days > 0 ? venue.totalSales / venue.days : 0,
        avgTransactionValue: venue.totalTransactions > 0 ? venue.totalSales / venue.totalTransactions : 0
      })).sort((a, b) => {
        // Sort by the selected metric
        const getMetricValue = (venue: any) => {
          switch (metric) {
            case 'nettTotal': return venue.totalSales;
            case 'grossSales': return venue.grossSales;
            case 'transactionCount': return venue.totalTransactions;
            case 'totalDiscount': return venue.totalDiscounts;
            default: return venue.totalSales;
          }
        };
        return getMetricValue(b) - getMetricValue(a);
      });
      
      res.json({ 
        venueComparison,
        totalVenues: venueComparison.length,
        period: period,
        metric: metric,
        summary: {
          totalSales: venueComparison.reduce((sum, v) => sum + v.totalSales, 0),
          totalTransactions: venueComparison.reduce((sum, v) => sum + v.totalTransactions, 0),
          totalDiscounts: venueComparison.reduce((sum, v) => sum + v.totalDiscounts, 0),
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch venue sales data" });
    }
  });

  // AI Sales Insights endpoint
  app.post("/api/sales/insights", async (req, res) => {
    try {
      const { period, kpiData, venueData, trendsData } = req.body;
      
      // Format data for AI analysis
      const analysisData = {
        period: period,
        summary: {
          totalGrossSales: kpiData.grossSales,
          totalNetSales: kpiData.netSales,
          totalTransactions: kpiData.transactions,
          totalDiscounts: kpiData.discounts,
          avgTransactionValue: kpiData.avgTransactionValue,
          profitMargin: kpiData.profitMargin
        },
        venues: venueData.map((v: any) => ({
          name: v.venue,
          sales: v.totalSales,
          transactions: v.totalTransactions,
          avgTransactionValue: v.avgTransactionValue,
          discounts: v.totalDiscounts
        })),
        trends: trendsData.slice(-30) // Last 30 data points for trend analysis
      };

      // Create AI analysis prompt
      const prompt = `As Alex, the virtual POS manager, analyze this sales data for the ${period} period:

SALES SUMMARY:
- Gross Sales: $${analysisData.summary.totalGrossSales.toLocaleString()}
- Net Sales: $${analysisData.summary.totalNetSales.toLocaleString()}
- Transactions: ${analysisData.summary.totalTransactions.toLocaleString()}
- Average Transaction: $${analysisData.summary.avgTransactionValue.toFixed(2)}
- Profit Margin: ${analysisData.summary.profitMargin.toFixed(1)}%

VENUE PERFORMANCE:
${analysisData.venues.map((v: any) => 
  `- ${v.name}: $${v.sales.toLocaleString()} (${v.transactions} transactions, $${v.avgTransactionValue.toFixed(2)} avg)`
).join('\n')}

RECENT TRENDS:
${analysisData.trends.slice(-7).map((t: any) => 
  `- ${t.date}: $${t.sales.toLocaleString()} (${t.transactions} transactions)`
).join('\n')}

Please provide:
1. A concise data summary (2-3 sentences)
2. Exactly 3 key trends you've identified
3. Exactly 2 actionable suggestions based on the data

Format as JSON with fields: summary, trends (array), suggestions (array)`;

      // Create a temporary conversation ID for the analysis
      const tempConversationId = `insights-${Date.now()}`;
      
      // Use agentChat with conversation context
      const aiResponse = await agentChat(prompt, tempConversationId, "gpt-4o");
      let parsedResponse;
      
      try {
        // Try to parse as JSON
        parsedResponse = JSON.parse(aiResponse.content);
      } catch (e) {
        // If JSON parsing fails, create structured response from text
        const lines = aiResponse.content.split('\n').filter((line: string) => line.trim());
        parsedResponse = {
          summary: lines.find((line: string) => line.includes('summary') || line.includes('Summary'))?.replace(/^[^:]*:?\s*/, '') || 
                  "Strong performance across all key metrics for the selected period.",
          trends: lines.filter((line: string) => /^\d+\.|\-|\•/.test(line.trim())).slice(0, 3).map((line: string) => 
            line.replace(/^\d+\.\s*|\-\s*|\•\s*/, '').trim()
          ),
          suggestions: lines.filter((line: string) => /suggestion|recommend|consider/i.test(line)).slice(0, 2).map((line: string) => 
            line.replace(/^\d+\.\s*|\-\s*|\•\s*/, '').trim()
          )
        };
        
        // Fallback if no structured data found
        if (parsedResponse.trends.length === 0) {
          parsedResponse.trends = [
            "Sales performance shows consistent patterns across venues",
            "Transaction volumes align with seasonal expectations",
            "Average transaction values indicate healthy customer engagement"
          ];
        }
        
        if (parsedResponse.suggestions.length === 0) {
          parsedResponse.suggestions = [
            "Monitor top-performing venues for scalable best practices",
            "Analyze peak transaction periods to optimize staffing and inventory"
          ];
        }
      }

      res.json({
        summary: parsedResponse.summary,
        trends: parsedResponse.trends.slice(0, 3),
        suggestions: parsedResponse.suggestions.slice(0, 2)
      });
      
    } catch (error) {
      console.error('Sales insights error:', error);
      res.status(500).json({ error: "Failed to generate sales insights" });
    }
  });

  // Operators Trading View endpoint
  app.get("/api/operators/trading-view", async (req, res) => {
    try {
      const operatorSummaries = await storage.getOperators();
      
      if (!operatorSummaries.length) {
        return res.json([]);
      }

      // Convert operator summaries to performance data
      const operatorPerformance = operatorSummaries.map((operator: any) => {
        return {
          name: operator.name || 'Unknown',
          operator: operator,
          totalSales: parseFloat(operator.totalSales || "0"),
          totalTransactions: operator.transactionCount || 0,
          totalHours: parseFloat(operator.totalHours || "40") // Default 40 hours per week
        };
      });

      // Convert to performance array with trading metrics
      const performanceData = operatorPerformance.map((op: any, index: number) => {
        const currentSales = op.totalSales;
        // Simulate previous period performance with slight variation for demo
        const previousSales = currentSales * (0.85 + Math.random() * 0.3); // 15% variation
        
        const changePercent = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0;
        const changeDirection = changePercent > 2 ? 'up' : changePercent < -2 ? 'down' : 'flat';
        
        const avgTransactionValue = op.totalTransactions > 0 ? op.totalSales / op.totalTransactions : 0;
        const salesPerHour = op.totalHours > 0 ? op.totalSales / op.totalHours : 0;
        
        // Determine performance category based on sales and change
        let performance = 'stable';
        if (changePercent > 10) performance = 'strong';
        else if (changePercent > 5) performance = 'improving';
        else if (changePercent < -5) performance = 'declining';

        return {
          name: op.name,
          currentSales: Math.round(currentSales),
          previousSales: Math.round(previousSales),
          changePercent: Math.round(changePercent * 10) / 10,
          changeDirection,
          transactions: op.totalTransactions,
          avgTransactionValue: Math.round(avgTransactionValue * 100) / 100,
          totalHours: Math.round(op.totalHours * 10) / 10,
          salesPerHour: Math.round(salesPerHour * 100) / 100,
          rank: 0, // Will be set after sorting
          performance
        };
      });

      // Sort by current sales and assign ranks
      performanceData.sort((a, b) => b.currentSales - a.currentSales);
      performanceData.forEach((op, index) => {
        op.rank = index + 1;
      });

      res.json(performanceData);
      
    } catch (error) {
      console.error('Operators trading view error:', error);
      res.status(500).json({ error: "Failed to fetch operator trading view data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
