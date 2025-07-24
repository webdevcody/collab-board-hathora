CREATE TABLE "boards" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"data" jsonb DEFAULT '{"shapes":[],"cursors":[]}'::jsonb NOT NULL,
	"hathora_room_id" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
