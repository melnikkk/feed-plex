ALTER TABLE "feeds" ADD COLUMN "refresh_interval_hours" integer;--> statement-breakpoint
ALTER TABLE "feeds" ADD COLUMN "next_refresh_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "feeds_next_refresh_at_idx" ON "feeds" USING btree ("next_refresh_at") WHERE "feeds"."refresh_interval_hours" IS NOT NULL;