CREATE TABLE "courses" (
	"id" text PRIMARY KEY NOT NULL,
	"external_id" text,
	"api_source" text,
	"name" text NOT NULL,
	"club_name" text,
	"city" text,
	"state" text,
	"country" text,
	"latitude" real,
	"longitude" real,
	"number_of_holes" integer DEFAULT 18,
	"tees" jsonb NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"last_fetched_at" text,
	"is_favorite" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" text PRIMARY KEY NOT NULL,
	"stat_category" text NOT NULL,
	"target_value" real NOT NULL,
	"start_value" real NOT NULL,
	"target_date" text NOT NULL,
	"direction" text NOT NULL,
	"created_at" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" text
);
--> statement-breakpoint
CREATE TABLE "live_events" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"course_name" text NOT NULL,
	"join_code" text NOT NULL,
	"organizer_secret" text NOT NULL,
	"hole_pars" jsonb NOT NULL,
	"status" text DEFAULT 'lobby' NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "live_events_join_code_unique" UNIQUE("join_code")
);
--> statement-breakpoint
CREATE TABLE "live_players" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"group_number" integer,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"player_id" text NOT NULL,
	"hole_number" integer NOT NULL,
	"strokes" integer NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "live_scores_player_hole" UNIQUE("event_id","player_id","hole_number")
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"course_name" text NOT NULL,
	"course_tees" text NOT NULL,
	"course_rating" real NOT NULL,
	"course_slope" integer NOT NULL,
	"course_total_par" integer NOT NULL,
	"course_hole_pars" jsonb NOT NULL,
	"course_hole_distances" jsonb NOT NULL,
	"holes" jsonb NOT NULL,
	"total_score" integer NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
