import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

import { eq, sql } from "drizzle-orm";
import * as schema from "../db/schema";

const provider = neon(process.env.NEON_DATABASE_URL!);

const db = drizzle(provider, { schema });

async function test() {
  const course = {
    title: "Mandarin",
    imageSrc:
      "http://res.cloudinary.com/mcjosh/image/upload/v1726926890/linguify/images/chinese_skdgxz.svg",
  };

  const unit = {
    courseId: 2,
    title: "Unit 1",
    description: "Learn the basics of Spanish",
    order: 1,
  };

  const lesson = {
        unitId: 1,
        title: "Nouns",
        order: 1,
  }

  const challenge = {
    lessonId: 1,
    type: "SELECT" as "SELECT",
    order: 1,
    question: 'Which one of these is "the man"?',
  };

  await db.update(schema.courses).set({
    ...course
  })

  // for (let i = 0; i <= 10; i++){
  //   await db.insert(schema.challenges).values({...challenge})
  // }
}

test();
// createTrigger();
