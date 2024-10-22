import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../db/schema";

const sql = neon(process.env.NEON_DATABASE_URL!);

const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("Seeding database...");

    await db.delete(schema.courses);
    await db.delete(schema.userProgress);
    await db.delete(schema.units);
    await db.delete(schema.lessons);
    await db.delete(schema.challenges);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.userSubscription);
    // await db.delete(schema.users);
    // await db.delete(schema.userProgress)
    // await db.delete(schema.staff)

    // await db.insert(schema.users).values({
    //   id: "user_2iWBeeroX5IViv775WgHCFQKUzU",
    //   userName: "erosennin",
    //   avatarUrl:
    //     "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzJtTzhCdHNpVWZ5c3dqZVZCUjJkMVR0b2tSNyJ9",
    // });
    await db.insert(schema.courses).values([
      {
        id: 1,
        title: "Spanish",
        imageSrc: "/images/es.svg",
      },
      {
        id: 2,
        title: "Italian",
        imageSrc: "/images/it.svg",
      },
      {
        id: 3,
        title: "French",
        imageSrc: "/images/fr.svg",
      },
      {
        id: 4,
        title: "Croatian",
        imageSrc: "/images/hr.svg",
      },
      {
        id: 5,
        title: "Japanese",
        imageSrc: "/images/jp.svg",
      },
    ]);

    await db.insert(schema.units).values({
      id: 1,
      courseId: 1,
      title: "Unit 1",
      description: "Learn the basics of Spanish",
      order: 1,
    });
    await db.insert(schema.lessons).values([
      {
        id: 1,
        unitId: 1,
        title: "Nouns",
        order: 1,
      },
      {
        id: 2,
        unitId: 1,
        title: "Verbs",
        order: 2,
      },
      {
        id: 3,
        unitId: 1,
        title: "Adjectives",
        order: 3,
      },
      {
        id: 4,
        unitId: 1,
        title: "Adverbs",
        order: 4,
      },
      {
        id: 5,
        unitId: 1,
        title: "Prepositions",
        order: 5,
      },
    ]);

    await db.insert(schema.challenges).values([
      {
        id: 1,
        lessonId: 1,
        type: "SELECT",
        order: 1,
        question: 'Which one of these is "the man"?',
      },
      {
        id: 2,
        lessonId: 1,
        type: "ASSIST",
        order: 2,
        question: '"the woman"',
      },
      {
        id: 3,
        lessonId: 1,
        type: "SELECT",
        order: 3,
        question: 'Which one of these is "the robot"?',
      },
    ]);
    await db.insert(schema.challenges).values([
      {
        id: 4,
        lessonId: 2,
        type: "SELECT",
        order: 1,
        question: 'Which one of these is "the man"?',
      },
      {
        id: 5,
        lessonId: 2,
        type: "ASSIST",
        order: 2,
        question: '"the woman"',
      },
      {
        id: 6,
        lessonId: 2,
        type: "SELECT",
        order: 3,
        question: 'Which one of these is "the robot"?',
      },
    ]);

    await db.insert(schema.challengeOptions).values([
      {
        challengeId: 1,
        imageSrc: "/images/man.svg",
        correct: true,
        text: "el hombre",
        audioSrc: "/audio/es_man.mp3",
      },
      {
        challengeId: 1,
        imageSrc: "/images/woman.svg",
        correct: false,
        text: "la mujer",
        audioSrc: "/audio/es_woman.mp3",
      },
      {
        challengeId: 1,
        imageSrc: "/images/robot.svg",
        correct: false,
        text: "el robot",
        audioSrc: "/audio/es_robot.mp3",
      },
    ]);
    await db.insert(schema.challengeOptions).values([
      {
        challengeId: 2,
        correct: false,
        text: "el hombre",
        audioSrc: "/audio/es_man.mp3",
      },
      {
        challengeId: 2,
        correct: true,
        text: "la mujer",
        audioSrc: "/audio/es_woman.mp3",
      },
      {
        challengeId: 2,
        correct: false,
        text: "el robot",
        audioSrc: "/audio/es_robot.mp3",
      },
    ]);
    await db.insert(schema.challengeOptions).values([
      {
        challengeId: 3,
        imageSrc: "/images/man.svg",
        correct: false,
        text: "el hombre",
        audioSrc: "/audio/es_man.mp3",
      },
      {
        challengeId: 3,
        imageSrc: "/images/woman.svg",
        correct: false,
        text: "la mujer",
        audioSrc: "/audio/es_woman.mp3",
      },
      {
        challengeId: 3,
        imageSrc: "/images/robot.svg",
        correct: true,
        text: "el robot",
        audioSrc: "/audio/es_robot.mp3",
      },
    ]);
    await db.insert(schema.challengeOptions).values([
      {
        challengeId: 4,
        imageSrc: "/images/man.svg",
        correct: true,
        text: "el hombre",
        audioSrc: "/audio/es_man.mp3",
      },
      {
        challengeId: 4,
        imageSrc: "/images/woman.svg",
        correct: false,
        text: "la mujer",
        audioSrc: "/audio/es_woman.mp3",
      },
      {
        challengeId: 4,
        imageSrc: "/images/robot.svg",
        correct: false,
        text: "el robot",
        audioSrc: "/audio/es_robot.mp3",
      },
    ]);
    await db.insert(schema.challengeOptions).values([
      {
        challengeId: 5,
        correct: false,
        text: "el hombre",
        audioSrc: "/audio/es_man.mp3",
      },
      {
        challengeId: 5,
        correct: true,
        text: "la mujer",
        audioSrc: "/audio/es_woman.mp3",
      },
      {
        challengeId: 5,
        correct: false,
        text: "el robot",
        audioSrc: "/audio/es_robot.mp3",
      },
    ]);
    await db.insert(schema.challengeOptions).values([
      {
        challengeId: 6,
        imageSrc: "/images/man.svg",
        correct: false,
        text: "el hombre",
        audioSrc: "/audio/es_man.mp3",
      },
      {
        challengeId: 6,
        imageSrc: "/images/woman.svg",
        correct: false,
        text: "la mujer",
        audioSrc: "/audio/es_woman.mp3",
      },
      {
        challengeId: 6,
        imageSrc: "/images/robot.svg",
        correct: true,
        text: "el robot",
        audioSrc: "/audio/es_robot.mp3",
      },
    ]);
    console.log("Seeding finished.");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed databse.");
  }
};

main();
