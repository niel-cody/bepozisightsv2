import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { agentChat } from "./services/agent";
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

      // Get AI response using function calling (no token limits!)
      const agentResponse = await agentChat(messageData.message, messageData.model || 'gpt-4o-mini');
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
        sales: parseFloat(summary.nettTotal),
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
