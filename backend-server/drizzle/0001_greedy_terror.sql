-- Add userId column as nullable first
ALTER TABLE "boards" ADD COLUMN "user_id" text;

-- Set a default userId for any existing boards (they will be orphaned but functional)
UPDATE "boards" SET "user_id" = 'system' WHERE "user_id" IS NULL;

-- Now make the column NOT NULL
ALTER TABLE "boards" ALTER COLUMN "user_id" SET NOT NULL;