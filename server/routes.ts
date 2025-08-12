import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzePosQuery, generateInsights, type PosAnalysisContext } from "./services/openai";
import { SimpleCSVImporter } from "./utils/simple-csv-importer";
import { insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Get chat messages
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  // Send chat message and get AI response
  app.post("/api/chat/message", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      
      // Get comprehensive context data for AI analysis
      const [tills, operators, products, todaySummary, recentTransactions, allDailySummaries] = await Promise.all([
        storage.getTills(),
        storage.getOperators(),
        storage.getProducts(),
        storage.getDailySummary(new Date().toISOString().split('T')[0]),
        storage.getTransactions(),
        storage.getDailySummaries()
      ]);

      const context: PosAnalysisContext = {
        tills,
        operators,
        products,
        dailySummary: todaySummary,
        recentTransactions: recentTransactions.slice(-10), // Last 10 transactions
        allDailySummaries: allDailySummaries.slice(-30), // Last 30 days of summaries
        importedData: {
          hasImportedData: allDailySummaries.length > 7, // More than seed data
          totalDays: allDailySummaries.length,
          dateRange: allDailySummaries.length > 0 ? {
            earliest: allDailySummaries[0]?.date,
            latest: allDailySummaries[allDailySummaries.length - 1]?.date
          } : null
        }
      };

      // Get AI response
      const aiResult = await analyzePosQuery(messageData.message, context);
      
      // Save message with AI response
      const chatMessage = await storage.createChatMessage({
        message: messageData.message,
        response: aiResult.response,
        userId: messageData.userId || null
      });

      res.json({
        message: chatMessage,
        data: aiResult.data
      });
    } catch (error) {
      console.error("Chat error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid message format" });
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

      const context: PosAnalysisContext = {
        tills,
        operators,
        products,
        dailySummary: todaySummary,
        recentTransactions: []
      };

      const insights = await generateInsights(context);
      res.json({ insights });
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
        sales: parseFloat(summary.totalSales),
        transactions: summary.transactionCount
      }));
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trends data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
