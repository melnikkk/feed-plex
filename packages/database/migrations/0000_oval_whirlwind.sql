CREATE TABLE IF NOT EXISTS "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"link" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"source_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_link_unique" UNIQUE("link")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic" text NOT NULL,
	"weight" real NOT NULL,
	"keywords" jsonb NOT NULL,
	"embedding" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "interests_topic_unique" UNIQUE("topic")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ranked_article_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"suggestion_run_id" text NOT NULL,
	"article_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"score" real NOT NULL,
	"semantic_similarity" real NOT NULL,
	"lexical_score" real NOT NULL,
	"freshness_score" real NOT NULL,
	"source_affinity" real NOT NULL,
	"novelty_penalty" real NOT NULL,
	"diversity_adjustment" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"source_affinity" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sources_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "suggestion_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ranked_article_scores" ADD CONSTRAINT "ranked_article_scores_suggestion_run_id_suggestion_runs_id_fk" FOREIGN KEY ("suggestion_run_id") REFERENCES "public"."suggestion_runs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ranked_article_scores" ADD CONSTRAINT "ranked_article_scores_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
