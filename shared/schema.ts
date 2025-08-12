import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tills = pgTable("tills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location"),
  status: text("status").notNull().default("active"),
  cashBalance: decimal("cash_balance", { precision: 10, scale: 2 }).default("0.00"),
  lastTransaction: timestamp("last_transaction"),
});

export const operators = pgTable("operators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  employeeId: text("employee_id"),
  role: text("role").notNull().default('Staff'),
  status: text("status").notNull().default("active"),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0.00"),
  transactionCount: integer("transaction_count").default(0),
  grossSales: decimal("gross_sales", { precision: 10, scale: 2 }),
  totalDiscount: decimal("total_discount", { precision: 10, scale: 2 }),
  nettTotal: decimal("nett_total", { precision: 10, scale: 2 }),
  profitAmount: decimal("profit_amount", { precision: 10, scale: 2 }),
  profitPercent: decimal("profit_percent", { precision: 10, scale: 2 }),
  averageSale: decimal("average_sale", { precision: 10, scale: 2 }),
  venue: text("venue"),
  lastTransactionDate: timestamp("last_transaction_date"),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0),
  soldToday: integer("sold_today").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0.00"),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tillId: varchar("till_id").notNull().references(() => tills.id),
  operatorId: varchar("operator_id").notNull().references(() => operators.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  items: jsonb("items").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  paymentMethod: text("payment_method").notNull(),
});

export const dailySummaries = pgTable("daily_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).notNull(),
  transactionCount: integer("transaction_count").notNull(),
  averageTransaction: decimal("average_transaction", { precision: 10, scale: 2 }).notNull(),
  topProduct: text("top_product"),
  topOperator: text("top_operator"),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  message: text("message").notNull(),
  response: text("response").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTillSchema = createInsertSchema(tills).omit({
  id: true,
});

export const insertOperatorSchema = createInsertSchema(operators).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
}).partial({ response: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTill = z.infer<typeof insertTillSchema>;
export type Till = typeof tills.$inferSelect;
export type InsertOperator = z.infer<typeof insertOperatorSchema>;
export type Operator = typeof operators.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type DailySummary = typeof dailySummaries.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
