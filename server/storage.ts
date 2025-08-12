import { 
  type User, 
  type InsertUser, 
  type Till, 
  type InsertTill,
  type OperatorSummary,
  type InsertOperatorSummary,
  type Product,
  type InsertProduct,
  type Transaction,
  type InsertTransaction,
  type TillSummary,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";
import { randomUUID } from "crypto";
import { PostgresStorage } from "./postgres-storage";
import { seedDatabase } from "./seed-data";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTills(): Promise<Till[]>;
  getTill(id: string): Promise<Till | undefined>;
  createTill(till: InsertTill): Promise<Till>;
  
  getOperators(): Promise<OperatorSummary[]>;
  getOperator(id: string): Promise<OperatorSummary | undefined>;
  createOperator(operator: InsertOperatorSummary): Promise<OperatorSummary>;
  
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByDate(date: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  getDailySummaries(): Promise<TillSummary[]>;
  getDailySummary(date: string): Promise<TillSummary | undefined>;
  
  getChatMessages(): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tills: Map<string, Till>;
  private operators: Map<string, OperatorSummary>;
  private products: Map<string, Product>;
  private transactions: Map<string, Transaction>;
  private dailySummaries: Map<string, TillSummary>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.users = new Map();
    this.tills = new Map();
    this.operators = new Map();
    this.products = new Map();
    this.transactions = new Map();
    this.dailySummaries = new Map();
    this.chatMessages = new Map();
    
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Initialize tills
    const tillsData = [
      { name: "Till 1", location: "Front Counter", status: "active", cashBalance: "1250.00" },
      { name: "Till 2", location: "Drive Through", status: "active", cashBalance: "850.00" },
      { name: "Till 3", location: "Back Counter", status: "active", cashBalance: "420.00" }
    ];
    
    tillsData.forEach(tillData => {
      const id = randomUUID();
      const till: Till = {
        id,
        name: tillData.name,
        location: tillData.location || null,
        status: tillData.status || "active",
        cashBalance: tillData.cashBalance || null,
        lastTransaction: new Date()
      };
      this.tills.set(id, till);
    });

    // Initialize operators
    const operatorsData = [
      { name: "Maria Rodriguez", employeeId: "EMP001", role: "Senior Cashier", status: "active", totalSales: "3200.00", transactionCount: 45 },
      { name: "James Wilson", employeeId: "EMP002", role: "Cashier", status: "active", totalSales: "2800.00", transactionCount: 38 },
      { name: "Sarah Chen", employeeId: "EMP003", role: "Cashier", status: "active", totalSales: "2400.00", transactionCount: 32 },
      { name: "Mike Johnson", employeeId: "EMP004", role: "Part-time", status: "active", totalSales: "2100.00", transactionCount: 28 },
      { name: "Lisa Thompson", employeeId: "EMP005", role: "Cashier", status: "active", totalSales: "1900.00", transactionCount: 25 }
    ];
    
    operatorsData.forEach(operatorData => {
      const id = randomUUID();
      const operator: Operator = { 
        id, 
        name: operatorData.name,
        employeeId: operatorData.employeeId || null,
        role: operatorData.role,
        status: operatorData.status || "active",
        totalSales: operatorData.totalSales || null,
        transactionCount: operatorData.transactionCount || null
      };
      this.operators.set(id, operator);
    });

    // Initialize products
    const productsData = [
      { name: "Americano", category: "Coffee", price: "3.50", stock: 50, soldToday: 45, revenue: "157.50" },
      { name: "Latte", category: "Coffee", price: "4.25", stock: 40, soldToday: 38, revenue: "161.50" },
      { name: "Matcha Latte", category: "Specialty", price: "5.00", stock: 25, soldToday: 32, revenue: "160.00" },
      { name: "Club Sandwich", category: "Food", price: "8.50", stock: 20, soldToday: 15, revenue: "127.50" },
      { name: "Croissant", category: "Pastry", price: "3.25", stock: 30, soldToday: 22, revenue: "71.50" }
    ];
    
    productsData.forEach(productData => {
      const id = randomUUID();
      const product: Product = { 
        id, 
        name: productData.name,
        category: productData.category,
        price: productData.price,
        stock: productData.stock || null,
        soldToday: productData.soldToday || null,
        revenue: productData.revenue || null
      };
      this.products.set(id, product);
    });

    // Initialize daily summaries
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const summariesData = [
      { date: today, totalSales: "8247.00", transactionCount: 164, averageTransaction: "50.29", topProduct: "Matcha Latte", topOperator: "Maria Rodriguez" },
      { date: yesterday, totalSales: "12847.00", transactionCount: 247, averageTransaction: "52.02", topProduct: "Latte", topOperator: "Maria Rodriguez" }
    ];
    
    summariesData.forEach(summaryData => {
      const id = randomUUID();
      const summary: DailySummary = { id, ...summaryData };
      this.dailySummaries.set(summaryData.date, summary);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTills(): Promise<Till[]> {
    return Array.from(this.tills.values());
  }

  async getTill(id: string): Promise<Till | undefined> {
    return this.tills.get(id);
  }

  async createTill(insertTill: InsertTill): Promise<Till> {
    const id = randomUUID();
    const till: Till = { 
      id,
      name: insertTill.name,
      location: insertTill.location || null,
      status: insertTill.status || 'active',
      cashBalance: insertTill.cashBalance || null,
      lastTransaction: insertTill.lastTransaction || null
    };
    this.tills.set(id, till);
    return till;
  }

  async getOperators(): Promise<OperatorSummary[]> {
    return Array.from(this.operators.values());
  }

  async getOperator(id: string): Promise<OperatorSummary | undefined> {
    return this.operators.get(id);
  }

  async createOperator(insertOperator: InsertOperatorSummary): Promise<OperatorSummary> {
    const id = randomUUID();
    const operator: OperatorSummary = { 
      id,
      name: insertOperator.name,
      employeeId: insertOperator.employeeId || null,
      role: insertOperator.role || 'Staff',
      status: insertOperator.status || 'active',
      totalSales: insertOperator.totalSales || null,
      transactionCount: insertOperator.transactionCount || null,
      grossSales: insertOperator.grossSales || null,
      totalDiscount: insertOperator.totalDiscount || null,
      nettTotal: insertOperator.nettTotal || null,
      profitAmount: insertOperator.profitAmount || null,
      profitPercent: insertOperator.profitPercent || null,
      averageSale: insertOperator.averageSale || null,
      venue: insertOperator.venue || null,
      lastTransactionDate: insertOperator.lastTransactionDate || null
    };
    this.operators.set(id, operator);
    return operator;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      id,
      name: insertProduct.name,
      category: insertProduct.category,
      price: insertProduct.price,
      stock: insertProduct.stock || null,
      soldToday: insertProduct.soldToday || null,
      revenue: insertProduct.revenue || null
    };
    this.products.set(id, product);
    return product;
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransactionsByDate(date: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.timestamp.toISOString().split('T')[0] === date
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      timestamp: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getDailySummaries(): Promise<TillSummary[]> {
    return Array.from(this.dailySummaries.values());
  }

  async getDailySummary(date: string): Promise<TillSummary | undefined> {
    return this.dailySummaries.get(date);
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      id,
      message: insertMessage.message,
      response: insertMessage.response || "",
      userId: insertMessage.userId || null,
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }
}

// Use PostgreSQL storage if DATABASE_URL is available
export const storage = process.env.DATABASE_URL 
  ? new PostgresStorage()
  : new MemStorage();

// Initialize database with sample data if using PostgreSQL
if (process.env.DATABASE_URL) {
  seedDatabase().catch(console.error);
}
