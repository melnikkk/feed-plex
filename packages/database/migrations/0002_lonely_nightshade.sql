ALTER TABLE "feeds" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "feeds" ADD COLUMN "last_viewed_at" timestamp with time zone;