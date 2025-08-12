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

export const operatorSummaries = pgTable("operator_summaries", {
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
  operatorId: varchar("operator_id").notNull().references(() => operatorSummaries.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  items: jsonb("items").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  paymentMethod: text("payment_method").notNull(),
});

export const tillSummaries = pgTable("till_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  venue: text("venue").notNull(), // McBrew - QLD
  transactionCount: integer("transaction_count").notNull(),
  dateTimeFirstTrans: timestamp("datetime_first_trans"),
  dateTimeLastTrans: timestamp("datetime_last_trans"),
  grossSales: decimal("gross_sales", { precision: 10, scale: 2 }),
  totalDiscount: decimal("total_discount", { precision: 10, scale: 2 }),
  nettTotal: decimal("nett_total", { precision: 10, scale: 2 }).notNull(),
  percentOfNettTotal: decimal("percent_of_nett_total", { precision: 10, scale: 4 }),
  costOfSales: decimal("cost_of_sales", { precision: 10, scale: 2 }),
  profitAmount: decimal("profit_amount", { precision: 10, scale: 2 }),
  profitPercent: decimal("profit_percent", { precision: 10, scale: 2 }),
  quantityCancelled: integer("quantity_cancelled"),
  cancelled: decimal("cancelled", { precision: 10, scale: 2 }),
  quantityReturns: integer("quantity_returns"),
  returns: decimal("returns", { precision: 10, scale: 2 }),
  quantityTraining: integer("quantity_training"),
  trainingTotal: decimal("training_total", { precision: 10, scale: 2 }),
  quantityNoSales: integer("quantity_no_sales"),
  quantityNoSaleAfterCancel: integer("quantity_no_sale_after_cancel"),
  noSaleAfterCancel: decimal("no_sale_after_cancel", { precision: 10, scale: 2 }),
  quantityTableRefundAfterPrint: integer("quantity_table_refund_after_print"),
  tableRefundAfterPrint: decimal("table_refund_after_print", { precision: 10, scale: 2 }),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id).notNull(),
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

export const insertOperatorSummarySchema = createInsertSchema(operatorSummaries).omit({
  id: true,
});

export const insertTillSummarySchema = createInsertSchema(tillSummaries).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
}).partial({ response: true }).extend({
  conversationId: z.string().optional().default('default'),
  model: z.enum(['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4o']).optional().default('gpt-4o-mini'),
});

// Customer account summaries table - matches CS file structure
export const customerSummaries = pgTable("customer_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(), // TimeSpan field
  accountId: text("account_id").notNull(),
  accountName: text("account_name").notNull(),
  balanceStart: decimal("balance_start", { precision: 10, scale: 2 }).default("0.00"),
  balanceEnd: decimal("balance_end", { precision: 10, scale: 2 }).default("0.00"),
  pointsStart: decimal("points_start", { precision: 10, scale: 2 }).default("0.00"),
  pointsEnd: decimal("points_end", { precision: 10, scale: 2 }).default("0.00"),
  payments: decimal("payments", { precision: 10, scale: 2 }).default("0.00"),
  charges: decimal("charges", { precision: 10, scale: 2 }).default("0.00"),
  paymentsMinusCharges: decimal("payments_minus_charges", { precision: 10, scale: 2 }).default("0.00"),
  nettTurnover: decimal("nett_turnover", { precision: 10, scale: 2 }).default("0.00"),
  grossTurnover: decimal("gross_turnover", { precision: 10, scale: 2 }).default("0.00"),
  turnoverDiscount: decimal("turnover_discount", { precision: 10, scale: 2 }).default("0.00"),
  visits: integer("visits").default(0),
  title: text("title"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  status: text("status").default("OK"),
});

export const insertCustomerSummarySchema = createInsertSchema(customerSummaries).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTill = z.infer<typeof insertTillSchema>;
export type Till = typeof tills.$inferSelect;
export type InsertOperatorSummary = z.infer<typeof insertOperatorSummarySchema>;
export type OperatorSummary = typeof operatorSummaries.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type TillSummary = typeof tillSummaries.$inferSelect;
export type InsertTillSummary = z.infer<typeof insertTillSummarySchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type CustomerSummary = typeof customerSummaries.$inferSelect;
export type InsertCustomerSummary = z.infer<typeof insertCustomerSummarySchema>;
