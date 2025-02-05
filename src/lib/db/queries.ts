import logger from "@/lib/utils/logger";
import { and, eq } from "drizzle-orm";
import db from "./drizzle";
import {
  challengeOptions,
  challengeProgress,
  challenges,
  courses,
  lessons,
  media,
  staff,
  units,
  userProgress,
  userSubscription,
} from "./schema";

type MutationType = "create" | "update" | "delete";

export const POINTS_TO_REFILL = 50;

export const fetchUserProgress = async (userId: string) => {
  try {
    const progress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
      with: {
        activeCourse: true,
      },
    });
    return progress;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const fetchUnits = async (userId: string) => {
  try {
    const userProgress = await fetchUserProgress(userId);
    if (!userProgress) {
      return null;
    }
    const data = await db.query.units.findMany({
      where: eq(units.courseId, userProgress?.activeCourseId!),
      orderBy: (units, { asc }) => [asc(units.order)],
      with: {
        lessons: {
          orderBy: (lesson, { asc }) => [asc(lesson.order)],
          with: {
            challenges: {
              orderBy: (challenges, { asc }) => [asc(challenges.order)],
              with: {
                challengeProgress: {
                  where: eq(challengeProgress.userId, userId),
                },
              },
            },
          },
        },
      },
    });
    // const normalizedData = data.map((unit) => {
    //   const lessons = unit.lessons.reduce((acc, lesson) => {
    //     const completed = lesson.challenges.every((challenge) => {
    //       return (
    //         challenge.challengeProgress &&
    //         challenge.challengeProgress.length > 0 &&
    //         challenge.challengeProgress.every((progress) => progress.completed)
    //       );
    //     });
    //     return { ...acc, lesson: { ...lesson, completed } };
    //   }, {});
    //   return { ...unit, lessons };
    // });
    const normalizedData = data.map((unit) => {
      const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
        if (!lesson.challenges.length) return { ...lesson, completed: false };
        const allCompletedChallenges = lesson.challenges.every((challenge) => {
          return (
            challenge.challengeProgress &&
            challenge.challengeProgress.length > 0 &&
            challenge.challengeProgress.every((progress) => progress.completed)
          );
        });
        return { ...lesson, completed: allCompletedChallenges };
      });
      return { ...unit, lessons: lessonsWithCompletedStatus };
    });
    return normalizedData;
  } catch (error) {
    throw error;
  }
};

export const fetchUnitsInActiveCourse = async (
  uProgress: typeof userProgress.$inferSelect
) => {
  try {
    const data = await db.query.units.findMany({
      orderBy: (units, { asc }) => [asc(units.order)],
      where: eq(units.courseId, uProgress.activeCourseId!),
      with: {
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.order)],
          with: {
            unit: true,
            challenges: {
              with: {
                challengeProgress: {
                  where: eq(challengeProgress.userId, uProgress.userId),
                },
              },
            },
          },
        },
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchCourseProgress = async (userId: string) => {
  try {
    const uProgress = await fetchUserProgress(userId);
    if (!uProgress) {
      return null;
    }
    const unitsInActiveCourse = await fetchUnitsInActiveCourse(uProgress);
    const firstUncompletedLesson = unitsInActiveCourse
      .flatMap((unit) => unit.lessons)
      .find((lesson) => {
        return lesson.challenges.some((challenge) => {
          return (
            !challenge.challengeProgress ||
            challenge.challengeProgress.length === 0 ||
            challenge.challengeProgress.some((progress) => !progress.completed)
          );
        });
      });

    return {
      activeLesson: firstUncompletedLesson,
      activeLessonId: firstUncompletedLesson?.id,
    };
  } catch (error) {
    throw error;
  }
};

export const fetchLesson = async (userId: string, id?: number) => {
  try {
    const courseProgress = await fetchCourseProgress(userId);
    const lessonId = id ?? courseProgress?.activeLessonId;

    if (!lessonId) return null;

    const data = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        challenges: {
          orderBy: (challenges, { asc }) => [asc(challenges.order)],
          with: {
            challengeOptions: true,
            challengeProgress: {
              where: eq(challengeProgress.userId, userId),
            },
          },
        },
      },
    });

    if (!data?.challenges) return null;

    const normalizedChallenges = data.challenges.map((challenge) => {
      const completed =
        challenge.challengeProgress &&
        challenge.challengeProgress.length > 0 &&
        challenge.challengeProgress.every((progress) => progress.completed);
      return { ...challenge, completed };
    });

    return { ...data, challenges: normalizedChallenges };
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const fetchChallengeProgress = async (
  userId: string,
  challengeId: number
) => {
  try {
    const existingChallengeProgress =
      await db.query.challengeProgress.findFirst({
        where: and(
          eq(challengeProgress.userId, userId),
          eq(challengeProgress.challengeId, challengeId)
        ),
      });

    return existingChallengeProgress;
  } catch (error) {
    throw error;
  }
};

export const fetchChallenge = async (challengeId: number) => {
  try {
    const challenge = await db.query.challenges.findFirst({
      where: eq(challenges.id, challengeId),
    });

    return challenge;
  } catch (error) {
    throw error;
  }
};

export const upsertChallengeProgress = async (
  challengeId: number,
  currentUserProgress: typeof userProgress.$inferSelect,
  existingChallengeProgress?: typeof challengeProgress.$inferSelect
) => {
  try {
    if (existingChallengeProgress) {
      await db
        .update(challengeProgress)
        .set({ completed: true })
        .where(eq(challengeProgress.id, existingChallengeProgress.id));

      await db
        .update(userProgress)
        .set({
          hearts: Math.min(currentUserProgress.hearts + 1, 5),
          points: currentUserProgress.points + 10,
        })
        .where(eq(userProgress.userId, currentUserProgress.userId));
      return;
    }
    await db.insert(challengeProgress).values({
      challengeId,
      userId: currentUserProgress.userId,
      completed: true,
    });

    await db
      .update(userProgress)
      .set({
        points: currentUserProgress.points + 10,
      })
      .where(eq(userProgress.userId, currentUserProgress.userId));
  } catch (error) {
    throw error;
  }
};

export const mutateHeartQuery = async (
  currentUserProgress: typeof userProgress.$inferSelect,
  type: "reduce" | "refill"
) => {
  try {
    switch (type) {
      case "reduce":
        await db
          .update(userProgress)
          .set({
            hearts: Math.max(currentUserProgress.hearts - 1, 0),
          })
          .where(eq(userProgress.userId, currentUserProgress.userId));
        break;

      case "refill":
        await db
          .update(userProgress)
          .set({
            hearts: 5,
            points: currentUserProgress.points - POINTS_TO_REFILL,
          })
          .where(eq(userProgress.userId, currentUserProgress.userId));
        break;

      default:
        break;
    }
  } catch (error) {
    throw error;
  }
};

const DAY_IN_MS = 86_400_000;
export const fetchUserSubscription = async (userId: string) => {
  try {
    const data = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, userId),
    });

    if (!data) return null;
    const isActive =
      data.stripePriceId &&
      data.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

    return {
      ...data,
      isActive: !!isActive,
    };
  } catch (error) {
    throw error;
  }
};

export const fetchCourseById = async (courseId: number) => {
  try {
    const data = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchCourses = async () => {
  try {
    const data = await db.query.courses.findMany({
      with: {
        units: {
          with: {
            lessons: true,
          },
        },
      },
      orderBy: (courses, { desc }) => [desc(courses.updatedAt)],
    });
    return data;
  } catch (error) {
    throw error;
  }
};

type Course = typeof courses.$inferInsert;
export const mutateCourse = async <Type extends MutationType>(
  ...args: Type extends "create"
    ? [type: Type, course: Course]
    : Type extends "update"
    ? [type: Type, { course: Partial<Course>; courseId: number }]
    : [type: Type, courseId: number]
) => {
  try {
    const [type, payload] = args;
    switch (type) {
      case "create":
        console.log("creating");
        await db.insert(courses).values({
          ...payload,
        });
        break;
      case "update":
        await db
          .update(courses)
          .set({
            ...payload.course,
          })
          .where(eq(courses.id, payload.courseId));
        break;
      case "delete":
        await db.delete(courses).where(eq(courses.id, payload));
        break;
      default:
        break;
    }
  } catch (error) {
    throw error;
  }
};

export const fetchUnits2 = async () => {
  try {
    const data = await db.query.units.findMany({
      orderBy: (units, { desc }) => [desc(units.updatedAt)],
      with: {
        course: {
          columns: { title: true },
        },
        lessons: {
          columns: {
            id: true,
          },
        },
      },
    });
    return data.map((u) => ({ ...u, lessons: u.lessons.length }));
  } catch (error) {
    throw error;
  }
};

export const fetchUnitById = async (unitId: number) => {
  try {
    const data = await db.query.units.findFirst({
      where: eq(units.id, unitId),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

type Unit = typeof units.$inferInsert;
export const mutateUnit = async <Type extends MutationType>(
  ...args: Type extends "create"
    ? [type: Type, { unit: Unit }]
    : Type extends "update"
    ? [type: Type, { unit: Partial<Unit>; unitId: number }]
    : [type: Type, { unitId: number }]
) => {
  try {
    const [type, payload] = args;
    switch (type) {
      case "create":
        await db.insert(units).values({
          ...payload.unit,
        });
        break;
      case "update":
        await db
          .update(units)
          .set({
            ...payload.unit,
          })
          .where(eq(units.id, payload.unitId));
        break;
      case "delete":
        await db.delete(units).where(eq(units.id, payload.unitId));
        break;
      default:
        break;
    }
  } catch (error) {
    throw error;
  }
};

export const fetchLessons = async () => {
  try {
    const data = await db.query.lessons.findMany({
      orderBy: (lessons, { desc }) => [desc(lessons.updatedAt)],
      with: {
        unit: {
          columns: {
            courseId: true,
            title: true,
          },
        },
        challenges: true,
      },
    });
    const formattedData = data.map((lesson) => ({
      courseId: lesson.unit.courseId,
      ...lesson,
      challenges: lesson.challenges.length,
    }));
    return formattedData;
  } catch (error) {
    throw error;
  }
};

export const fetchLessonById = async (
  lessonId: number
): Promise<typeof lessons.$inferSelect & { courseId: number }> => {
  try {
    const data = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        unit: true,
      },
    });
    const courseId = data?.unit.courseId;
    return {
      ...data,
      courseId,
    } as any;
  } catch (error) {
    throw error;
  }
};

type Lesson = typeof lessons.$inferInsert;
export const mutateLesson = async <Type extends MutationType>(
  ...args: Type extends "create"
    ? [type: Type, { lesson: Lesson }]
    : Type extends "update"
    ? [type: Type, { lesson: Partial<Lesson>; lessonId: number }]
    : [type: Type, { lessonId: number }]
) => {
  try {
    const [type, payload] = args;
    switch (type) {
      case "create":
        await db.insert(lessons).values({
          ...payload.lesson,
        });
        break;
      case "update":
        await db
          .update(lessons)
          .set({
            ...payload.lesson,
          })
          .where(eq(lessons.id, payload.lessonId));
        break;
      case "delete":
        await db.delete(lessons).where(eq(lessons.id, payload.lessonId));
        break;
      default:
        break;
    }
  } catch (error) {
    throw error;
  }
};

export const fetchChallenges = async () => {
  try {
    const data = await db.query.challenges.findMany({
      orderBy: (challenges, { desc }) => [desc(challenges.updatedAt)],
      with: {
        lesson: {
          columns: {
            title: true,
          },
          with: {
            unit: {
              columns: { courseId: true },
            },
          },
        },
        challengeOptions: {
          columns: {
            id: true,
          },
        },
      },
    });

    const formattedData = data.map((challenge) => {
      const courseId = challenge.lesson.unit.courseId;
      delete (challenge.lesson as any).unit;
      return {
        courseId,
        ...challenge,
        challengeOptions: challenge.challengeOptions.length || 0,
      };
    });
    return formattedData;
  } catch (error) {
    throw error;
  }
};

export const fetchChallengeById = async (
  challengeId: number
): Promise<typeof challenges.$inferSelect & { courseId: number }> => {
  try {
    const data = await db.query.challenges.findFirst({
      where: eq(challenges.id, challengeId),
      with: {
        lesson: {
          columns: {},
          with: {
            unit: {
              columns: {
                courseId: true,
              },
            },
          },
        },
        // challengeOptions: true,
      },
    });
    const courseId = data?.lesson.unit.courseId;
    delete (data as any)?.lesson;
    return {
      ...data,
      courseId,
    } as any;
  } catch (error) {
    throw error;
  }
};

type Challenge = typeof challenges.$inferInsert;
export const mutateChallenge = async <Type extends MutationType>(
  ...args: Type extends "create"
    ? [type: Type, { challenge: Challenge }]
    : Type extends "update"
    ? [type: Type, { challenge: Partial<Challenge>; challengeId: number }]
    : [type: Type, { challengeId: number }]
) => {
  try {
    const [type, payload] = args;
    switch (type) {
      case "create":
        await db.insert(challenges).values({
          ...payload.challenge,
        });
        break;
      case "update":
        await db
          .update(challenges)
          .set({
            ...payload.challenge,
          })
          .where(eq(challenges.id, payload.challengeId));
        break;
      case "delete":
        await db
          .delete(challenges)
          .where(eq(challenges.id, payload.challengeId));
        break;
      default:
        break;
    }
  } catch (error) {
    throw error;
  }
};

export const fetchChallengeOptions = async () => {
  try {
    const data = await db.query.challengeOptions.findMany({
      orderBy: (challengeOptions, { desc }) => [
        desc(challengeOptions.updatedAt),
      ],
      with: {
        challenge: {
          columns: {
            question: true,
          },
          with: {
            lesson: {
              columns: {},
              with: {
                unit: {
                  columns: { courseId: true },
                },
              },
            },
          },
        },
      },
    });
    const formattedData = data.map((option) => {
      const courseId = option.challenge.lesson.unit.courseId;
      delete (option.challenge as any).lesson;

      return {
        courseId,
        ...option,
      };
    });
    return formattedData;
  } catch (error) {
    throw error;
  }
};

export const fetchChallengeOptionById = async (optionId: number) => {
  try {
    const data = await db.query.challengeOptions.findFirst({
      where: eq(challengeOptions.id, optionId),
      with: {
        challenge: {
          columns: {},
          with: {
            lesson: {
              columns: {},
              with: {
                unit: {
                  columns: {
                    courseId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const courseId = data?.challenge.lesson.unit.courseId;
    delete (data as any)?.challenge;
    return {
      ...data,
      courseId,
    };
  } catch (error) {
    throw error;
  }
};

type ChallengeOption = typeof challengeOptions.$inferInsert;
export const mutateChallengeOption = async <Type extends MutationType>(
  ...args: Type extends "create"
    ? [type: Type, { challengeOption: ChallengeOption }]
    : Type extends "update"
    ? [
        type: Type,
        { challengeOption: Partial<ChallengeOption>; challengeOptionId: number }
      ]
    : [type: Type, { challengeOptionId: number }]
) => {
  try {
    const [type, payload] = args;
    switch (type) {
      case "create":
        await db.insert(challengeOptions).values({
          ...payload.challengeOption,
        });
        break;
      case "update":
        await db
          .update(challengeOptions)
          .set({
            ...payload.challengeOption,
          })
          .where(eq(challengeOptions.id, payload.challengeOptionId));
        break;
      case "delete":
        await db
          .delete(challengeOptions)
          .where(eq(challengeOptions.id, payload.challengeOptionId));
        break;
      default:
        break;
    }
  } catch (error) {
    throw error;
  }
};

export const fetchTopTenUsers = async () => {
  try {
    const data = db.query.userProgress.findMany({
      orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
      limit: 10,
      columns: {
        points: true,
        userId: true,
      },
      with: {
        user: true,
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchMedia = async () => {
  try {
    const data = await db.query.media.findMany({
      orderBy: (media, { desc }) => [desc(media.updatedAt)],
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const insertMedia = async (payload: typeof media.$inferInsert) => {
  try {
    await db.insert(media).values({
      ...payload,
    });
  } catch (error) {
    throw error;
  }
};

export const checkIfAdmin = async (userId: string) => {
  try {
    const data = await db.query.staff.findFirst({
      where: eq(staff.userId, userId),
    });
    return data?.role === "ADMIN";
  } catch (error) {
    throw error;
  }
};
export const checkIfStaff = async (userId: string) => {
  try {
    const data = await db.query.staff.findFirst({
      where: eq(staff.userId, userId),
    });
    return !!data;
  } catch (error) {
    throw error;
  }
};

export const fetchStaff = async (userId: string) => {
  try {
    const data = await db.query.staff.findFirst({
      where: eq(staff.userId, userId),
      with: {
        permissions: {
          columns: {
            courseId: true,
          },
        },
      },
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const checkIfPermitted = async (userId: string, courseId?: number) => {
  try {
    const staff = await fetchStaff(userId);
    if (staff?.role === "ADMIN") return true;
    if (courseId) {
      return !!staff?.permissions.find((perm) => perm.courseId === courseId);
    }
    return false;
  } catch (error) {
    throw error;
  }
};
