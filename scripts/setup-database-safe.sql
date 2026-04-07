CREATE TABLE IF NOT EXISTS "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"email_type" varchar(50) NOT NULL,
	"recipient_email" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"next_retry_at" timestamp,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gdpr_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"consented_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"privacy_policy_version" varchar(10) DEFAULT '1.0'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_sequences" (
	"year" integer PRIMARY KEY NOT NULL,
	"current_number" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" varchar(100) NOT NULL,
	"qty" integer NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"shipping_cents_per_unit" integer NOT NULL,
	"name_snapshot" varchar(255) NOT NULL,
	"image_snapshot" varchar(500)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" varchar(20) NOT NULL,
	"fulfillment_mode" varchar(10) NOT NULL,
	"pickup_location_id" varchar(50),
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(20),
	"refdet" varchar(30) NOT NULL,
	"idop" varchar(255),
	"payfip_result_trans" varchar(1),
	"payfip_num_auto" varchar(16),
	"payfip_date_trans" varchar(8),
	"payfip_heure_trans" varchar(4),
	"items_total_cents" integer NOT NULL,
	"shipping_total_cents" integer NOT NULL,
	"grand_total_cents" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	"fulfilled_at" timestamp,
	"canceled_at" timestamp,
	"tracking_number" varchar(255),
	"tracking_url" text,
	CONSTRAINT "orders_refdet_unique" UNIQUE("refdet")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payfip_operations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idop" varchar(255) NOT NULL,
	"order_id" uuid NOT NULL,
	"refdet" varchar(30) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp,
	"result_trans" varchar(1),
	"num_auto" varchar(16),
	"date_trans" varchar(8),
	"heure_trans" varchar(4),
	"notification_received_at" timestamp,
	"raw_notification" text,
	CONSTRAINT "payfip_operations_idop_unique" UNIQUE("idop")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pickup_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"used_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metadata" json,
	CONSTRAINT "pickup_tokens_order_id_unique" UNIQUE("order_id"),
	CONSTRAINT "pickup_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_stock" (
	"product_id" varchar(100) PRIMARY KEY NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"reserved" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_queue" ADD CONSTRAINT "email_queue_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gdpr_consents" ADD CONSTRAINT "gdpr_consents_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payfip_operations" ADD CONSTRAINT "payfip_operations_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickup_tokens" ADD CONSTRAINT "pickup_tokens_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "accounts_compound_key" ON "accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_status_retry" ON "email_queue" USING btree ("status","next_retry_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_order_email" ON "email_queue" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_order" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refdet" ON "orders" USING btree ("refdet");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_idop_order" ON "orders" USING btree ("idop");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email" ON "orders" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_idop" ON "payfip_operations" USING btree ("idop");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_order_payfip" ON "payfip_operations" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refdet_payfip" ON "payfip_operations" USING btree ("refdet");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_expires" ON "payfip_operations" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hash" ON "pickup_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_order_token" ON "pickup_tokens" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_tokens_compound_key" ON "verification_tokens" USING btree ("identifier","token");CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"price_cents" integer NOT NULL,
	"shipping_cents" integer NOT NULL,
	"images" json DEFAULT '[]'::json NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"stock_alert_threshold" integer DEFAULT 5 NOT NULL,
	"weight_grams" integer,
	"tags" text[],
	"payfip_product_code" varchar(10) DEFAULT '11',
	"edition_number" integer,
	"edition_total" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"quantity" integer NOT NULL,
	"order_id" uuid,
	"note" text,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_products_slug" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_products_active" ON "products" USING btree ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_products_stock" ON "products" USING btree ("stock_quantity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_product" ON "stock_movements" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_order" ON "stock_movements" USING btree ("order_id");