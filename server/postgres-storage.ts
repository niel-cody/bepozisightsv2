import { db } from './db';
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
  type InsertChatMessage,
  users,
  tills,
  operatorSummaries,
  products,
  transactions,
  tillSummaries,
  chatMessages
} from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import type { IStorage } from './storage';

export class PostgresStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getTills(): Promise<Till[]> {
    return await db.select().from(tills);
  }

  async getTill(id: string): Promise<Till | undefined> {
    const result = await db.select().from(tills).where(eq(tills.id, id)).limit(1);
    return result[0];
  }

  async createTill(till: InsertTill): Promise<Till> {
    const result = await db.insert(tills).values(till).returning();
    return result[0];
  }

  async getOperators(): Promise<OperatorSummary[]> {
    return await db.select().from(operatorSummaries);
  }

  async getOperator(id: string): Promise<OperatorSummary | undefined> {
    const result = await db.select().from(operatorSummaries).where(eq(operatorSummaries.id, id)).limit(1);
    return result[0];
  }

  async createOperator(operator: InsertOperatorSummary): Promise<OperatorSummary> {
    const result = await db.insert(operatorSummaries).values(operator).returning();
    return result[0];
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.timestamp));
  }

  async getTransactionsByDate(date: string): Promise<Transaction[]> {
    // PostgreSQL date filtering for a specific day
    const result = await db.select().from(transactions)
      .where(eq(transactions.timestamp, new Date(date)));
    return result;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }

  async getDailySummaries(): Promise<TillSummary[]> {
    return await db.select().from(tillSummaries).orderBy(tillSummaries.date);
  }

  async getDailySummary(date: string): Promise<TillSummary | undefined> {
    const result = await db.select().from(tillSummaries).where(eq(tillSummaries.date, date)).limit(1);
    return result[0];
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).orderBy(chatMessages.timestamp);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const messageToInsert = {
      message: message.message,
      response: message.response || "",
      userId: message.userId || null
    };
    const result = await db.insert(chatMessages).values(messageToInsert).returning();
    return result[0];
  }
}