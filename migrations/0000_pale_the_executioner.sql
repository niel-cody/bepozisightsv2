CREATE TABLE "chat_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"response" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar
);
--> statement-breakpoint
CREATE TABLE "daily_summaries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" text NOT NULL,
	"total_sales" numeric(10, 2) NOT NULL,
	"transaction_count" integer NOT NULL,
	"average_transaction" numeric(10, 2) NOT NULL,
	"top_product" text,
	"top_operator" text
);
--> statement-breakpoint
CREATE TABLE "operators" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"employee_id" text,
	"role" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"total_sales" numeric(10, 2) DEFAULT '0.00',
	"transaction_count" integer DEFAULT 0,
	CONSTRAINT "operators_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer DEFAULT 0,
	"sold_today" integer DEFAULT 0,
	"revenue" numeric(10, 2) DEFAULT '0.00'
);
--> statement-breakpoint
CREATE TABLE "tills" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"location" text,
	"status" text DEFAULT 'active' NOT NULL,
	"cash_balance" numeric(10, 2) DEFAULT '0.00',
	"last_transaction" timestamp
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"till_id" varchar NOT NULL,
	"operator_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"items" jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"payment_method" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_till_id_tills_id_fk" FOREIGN KEY ("till_id") REFERENCES "public"."tills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_operator_id_operators_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id") ON DELETE no action ON UPDATE no action;