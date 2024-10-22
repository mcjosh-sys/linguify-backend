// https://chatgpt.com/share/57da4815-45fc-4d48-b43f-1842458ee1dd

import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

import { sql } from "drizzle-orm";
import * as schema from "../db/schema";

const provider = neon(process.env.NEON_DATABASE_URL!);

const db = drizzle(provider, { schema });

createTriggerFunction();
createTrigger();
// createTiggerProcedure()
// createEventTriggerTableCreation();
// createEventTriggerTableUpdate();

async function createTriggerFunction() {
  await db
    .execute(
      sql`CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`
    )
    .then((res: any) =>
      console.log("create-trigger-function \n", { data: res })
    )
    .catch((error: any) =>
      console.error("create-trigger-function \n", { error })
    );
}
async function createTrigger() {
  await db
    .execute(
      sql`DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
  EXECUTE format('
      CREATE TRIGGER set_timestamp_%I
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();
    ', r.table_name, r.table_name);
    END LOOP;
    END $$;

    `
    )
    .then((res: any) => console.log("create-trigger \n", { data: res }))
    .catch((error: any) => console.error("create-trigger \n", { error }));
}
async function createUpdateAtProcedure() {
  await db
    .execute(
      sql`CREATE OR REPLACE PROCEDURE add_updated_at_trigger(table_name text)
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format('
    CREATE TRIGGER set_timestamp_%I
    BEFORE UPDATE ON %I
    FOR EACH ROW
    WHEN (NEW.updated_at IS DISTINCT FROM OLD.updated_at)
    EXECUTE FUNCTION update_timestamp();', 
    table_name, table_name
  );
END;
$$;

    `
    )
    .then((res: any) => console.log("create-trigger \n", { data: res }))
    .catch((error: any) => console.error("create-trigger \n", { error }));
}
async function createTriggerForTableCreation() {
  await db
    .execute(
      sql`CREATE OR REPLACE FUNCTION create_updated_at_trigger_on_new_table()
RETURNS EVENT TRIGGER AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Loop through all columns of the created table to check for 'updated_at'
  FOR rec IN
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = TG_TABLE_NAME
      AND column_name = 'updated_at'
  LOOP
    -- If the column 'updated_at' exists, add the trigger
    PERFORM add_updated_at_trigger(TG_TABLE_NAME);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Event trigger for new table creation
CREATE EVENT TRIGGER set_updated_at_on_new_table
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE')
EXECUTE FUNCTION create_updated_at_trigger_on_new_table();

    `
    )
    .then((res: any) => console.log("create-trigger \n", { data: res }))
    .catch((error: any) => console.error("create-trigger \n", { error }));
}
async function createTriggerForTableUpdate() {
  await db
    .execute(
      sql`CREATE OR REPLACE FUNCTION create_updated_at_trigger_on_table_update()
RETURNS EVENT TRIGGER AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Loop through all columns of the altered table to check for 'updated_at'
  FOR rec IN
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = TG_TABLE_NAME
      AND column_name = 'updated_at'
  LOOP
    -- If the column 'updated_at' exists, add the trigger
    PERFORM add_updated_at_trigger(TG_TABLE_NAME);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Event trigger for table alteration (add/update column)
CREATE EVENT TRIGGER set_updated_at_on_table_update
ON ddl_command_end
WHEN TAG IN ('ALTER TABLE')
EXECUTE FUNCTION create_updated_at_trigger_on_table_update();


    `
    )
    .then((res: any) => console.log("create-trigger \n", { data: res }))
    .catch((error: any) => console.error("create-trigger \n", { error }));
}

async function createTiggerProcedure() {
  await db
    .execute(
      sql`
        CREATE OR REPLACE PROCEDURE add_updated_at_trigger(table_name text)
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format('
    CREATE TRIGGER set_timestamp_%I
    BEFORE UPDATE ON %I
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();', 
    table_name, table_name
  );
END;
$$;
    `
    )
    .then((res: any) =>
      console.log("create-trigger-procedure \n", { data: res })
    )
    .catch((error: any) =>
      console.error("create-trigger-procedure \n", { error })
    );
}

async function createEventTriggerTableCreation() {
  await db
    .execute(
      sql`
    CREATE OR REPLACE FUNCTION create_updated_at_trigger_on_new_table()
RETURNS TRIGGER AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Check if the new table has an 'updated_at' column
  FOR rec IN
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = TG_TABLE_NAME
      AND column_name = 'updated_at'
  LOOP
    -- If 'updated_at' column exists, add the row-level trigger
    PERFORM add_updated_at_trigger(TG_TABLE_NAME);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create an event trigger for new table creation
CREATE EVENT TRIGGER set_updated_at_on_new_table
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE')
EXECUTE FUNCTION create_updated_at_trigger_on_new_table();


    `
    )
    .then((res: any) =>
      console.log("create-trigger-event-table-create \n", { data: res })
    )
    .catch((error: any) =>
      console.error("create-trigger-event-table-create \n", { error })
    );
}
async function createEventTriggerTableUpdate() {
  await db
    .execute(
      sql`
    CREATE OR REPLACE FUNCTION create_updated_at_trigger_on_table_update()
RETURNS TRIGGER AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Loop through all columns of the altered table to check for 'updated_at'
  FOR rec IN
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = TG_TABLE_NAME
      AND column_name = 'updated_at'
  LOOP
    -- If the column 'updated_at' exists, add the trigger
    PERFORM add_updated_at_trigger(TG_TABLE_NAME);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Event trigger for table alteration (add/update column)
CREATE EVENT TRIGGER set_updated_at_on_table_update
ON ddl_command_end
WHEN TAG IN ('ALTER TABLE')
EXECUTE FUNCTION create_updated_at_trigger_on_table_update();

    `
    )
    .then((res: any) =>
      console.log("create-trigger-event-table-update \n", { data: res })
    )
    .catch((error: any) =>
      console.error("create-trigger-event-table-update \n", { error })
    );
}
