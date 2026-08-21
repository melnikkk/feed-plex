CREATE TABLE "feeds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feeds_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "interests" DROP CONSTRAINT "interests_topic_unique";--> statement-breakpoint
ALTER TABLE "sources" DROP CONSTRAINT "sources_url_unique";--> statement-breakpoint
DELETE FROM "suggestion_runs";--> statement-breakpoint
DELETE FROM "sources";--> statement-breakpoint
DELETE FROM "interests";--> statement-breakpoint
ALTER TABLE "interests" ADD COLUMN "feed_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "feed_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "suggestion_runs" ADD COLUMN "feed_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "interests" ADD CONSTRAINT "interests_feed_id_feeds_id_fk" FOREIGN KEY ("feed_id") REFERENCES "public"."feeds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_feed_id_feeds_id_fk" FOREIGN KEY ("feed_id") REFERENCES "public"."feeds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestion_runs" ADD CONSTRAINT "suggestion_runs_feed_id_feeds_id_fk" FOREIGN KEY ("feed_id") REFERENCES "public"."feeds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interests" ADD CONSTRAINT "interests_feed_id_topic_unique" UNIQUE("feed_id","topic");--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_feed_id_url_unique" UNIQUE("feed_id","url");