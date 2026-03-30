/**
 * Seed script: Creates "Tiger Hood" demo user with 50 detailed rounds + goals.
 * Run: npx tsx scripts/seed-tiger-hood.ts
 *
 * Requires DATABASE_URL in .env.local
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users, rounds, goals } from "../lib/db/schema";
import { seedCourses, buildRoundFromScores } from "../lib/seed-data";
import type { CourseInfo } from "../lib/types";

// ── Deterministic random ───────────────────────────────────────

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ── Generate realistic per-hole scores ─────────────────────────

function generateScores(
  course: CourseInfo,
  targetTotal: number,
  seed: number,
): number[] {
  const rand = seededRandom(seed);
  const pars = course.holePars;

  // Start with all pars
  const scores = [...pars];
  let total = pars.reduce((a, b) => a + b, 0);
  const diff = targetTotal - total;

  if (diff < 0) {
    // Need birdies
    const birdieCount = Math.abs(diff);
    const indices = Array.from({ length: 18 }, (_, i) => i);
    // Shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    for (let b = 0; b < birdieCount && b < 18; b++) {
      scores[indices[b]] -= 1;
    }
  } else if (diff > 0) {
    // Need bogeys (and possibly doubles)
    let remaining = diff;
    const indices = Array.from({ length: 18 }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    let idx = 0;
    while (remaining > 0 && idx < 18) {
      const add = remaining >= 3 && rand() < 0.15 ? 2 : 1;
      scores[indices[idx]] += add;
      remaining -= add;
      idx++;
    }
  }

  // Sometimes add a birdie + bogey pair for realism (doesn't change total)
  if (rand() < 0.6) {
    const swapCount = Math.floor(rand() * 2) + 1;
    for (let s = 0; s < swapCount; s++) {
      const i = Math.floor(rand() * 18);
      const j = Math.floor(rand() * 18);
      if (i !== j && scores[i] >= pars[i] && scores[j] <= pars[j]) {
        scores[i] += 1;
        scores[j] -= 1;
      }
    }
  }

  return scores;
}

// ── Tiger Hood's 50 rounds ─────────────────────────────────────

const TIGER_USER_ID = "tiger-hood-demo-001";

interface TigerRoundDef {
  courseKey: string;
  date: string;
  targetTotal: number;
  notes: string;
  seed: number;
}

const courseKeys = Object.keys(seedCourses);

const tigerRounds: TigerRoundDef[] = [
  // October 2025 — Season opener, shaking off rust
  { courseKey: "royalWellington", date: "2025-10-01", targetTotal: 73, notes: "Season opener. Felt a bit rusty off the tee but short game was sharp. Happy to be back out.", seed: 5001 },
  { courseKey: "paraparaumu", date: "2025-10-05", targetTotal: 71, notes: "Links conditions — wind howling. Kept it low and controlled. Good scrambling day.", seed: 5002 },
  { courseKey: "taraIti", date: "2025-10-09", targetTotal: 68, notes: "Found my rhythm early. Four birdies on the front. This course suits my eye perfectly.", seed: 5003 },
  { courseKey: "kauriCliffs", date: "2025-10-13", targetTotal: 70, notes: "Stunning views, solid ball-striking. Two-putted from off the fringe on 16 for birdie.", seed: 5004 },
  { courseKey: "capeKidnappers", date: "2025-10-18", targetTotal: 74, notes: "Tough conditions at the Cape. Wind gusting 30+. Double on 13 from the cliffs. Grinded it out.", seed: 5005 },
  { courseKey: "wairakei", date: "2025-10-22", targetTotal: 71, notes: "First time here. Tree-lined fairways demand accuracy. Hit 13 fairways — iron play was money.", seed: 5006 },
  { courseKey: "titirangi", date: "2025-10-26", targetTotal: 67, notes: "Bogey-free round! Everything clicked. Driver was a weapon, putts were dropping. Season best so far.", seed: 5007 },

  // November 2025 — Australia swing
  { courseKey: "royalMelbourne", date: "2025-11-02", targetTotal: 72, notes: "First sandbelt experience. Fast greens, tricky bunkers. Even par feels like a win here.", seed: 5008 },
  { courseKey: "kingstonHeath", date: "2025-11-06", targetTotal: 74, notes: "Tough setup. Pins were tucked. Three-putted twice on the back nine. Need to read these greens better.", seed: 5009 },
  { courseKey: "theAustralian", date: "2025-11-10", targetTotal: 69, notes: "Approach game was elite today — hit 15 greens. Four birdies, one bogey. Love this track.", seed: 5010 },
  { courseKey: "newSouthWales", date: "2025-11-14", targetTotal: 71, notes: "Coastal wind made it interesting. Kept it in play, wedges were tight. Solid scoring round.", seed: 5011 },
  { courseKey: "barnbougleDunes", date: "2025-11-19", targetTotal: 69, notes: "Links heaven in Tasmania. Ran the ball in beautifully. Three birdies on the stretch from 5-9.", seed: 5012 },
  { courseKey: "barnbougleLostFarm", date: "2025-11-20", targetTotal: 72, notes: "Back-to-back Barnbougle. Legs were tired. Started bogey-bogey but fought back to even par.", seed: 5013 },
  { courseKey: "nationalGC", date: "2025-11-24", targetTotal: 75, notes: "Cape Schanck is brutal. Wind off the ocean, firm and fast. Worst round of the trip — humbling.", seed: 5014 },

  // December 2025 — Home stretch, tournaments
  { courseKey: "clearwater", date: "2025-12-01", targetTotal: 70, notes: "Pro-Am round. Played smart, no big numbers. Two birdies on the closing holes sealed it.", seed: 5015 },
  { courseKey: "ellerston", date: "2025-12-05", targetTotal: 68, notes: "Private course invite. Ball-striking was world-class. Nearly holed out on 7 from 145 yards.", seed: 5016 },
  { courseKey: "millbrook", date: "2025-12-10", targetTotal: 69, notes: "Queenstown magic. Remarkables backdrop, pure strikes. Three under through 12, parred in safely.", seed: 5017 },
  { courseKey: "theHills", date: "2025-12-14", targetTotal: 71, notes: "Queenstown event. Course was set up tough — firm greens, tucked pins. Hung in there.", seed: 5018 },
  { courseKey: "springCreek", date: "2025-12-18", targetTotal: 76, notes: "Disaster round. OB on 6, water on 13. When it rains it pours. Need to reset mentally.", seed: 5019 },
  { courseKey: "royalQueensland", date: "2025-12-22", targetTotal: 70, notes: "Bounce-back round after Spring Creek. Hit fairways, attacked pins. Felt like myself again.", seed: 5020 },
  { courseKey: "gulfHarbour", date: "2025-12-28", targetTotal: 72, notes: "Holiday round with mates. Wind was up over the harbour. Bogey-free back nine was satisfying.", seed: 5021 },

  // January 2026 — Peak form
  { courseKey: "terreyHills", date: "2026-01-03", targetTotal: 67, notes: "New year, new level. Six birdies. Driver was splitting fairways, wedges were laser-guided.", seed: 5022 },
  { courseKey: "peninsulaKingswood", date: "2026-01-07", targetTotal: 70, notes: "Sandbelt classic. Kept it simple — fairways and greens. Two birdies on the par 5s.", seed: 5023 },
  { courseKey: "victoriaGC", date: "2026-01-11", targetTotal: 71, notes: "Beautiful classic layout. Bunker play saved me twice. Need to work on lag putting.", seed: 5024 },
  { courseKey: "metropolitanGC", date: "2026-01-15", targetTotal: 66, notes: "Career round! Eight birdies including four in a row from 5-8. Everything was automatic.", seed: 5025 },
  { courseKey: "kooyonga", date: "2026-01-19", targetTotal: 70, notes: "Adelaide heat didn't bother me. Good course management. Played percentage golf.", seed: 5026 },
  { courseKey: "royalWellington", date: "2026-01-24", targetTotal: 69, notes: "Home course advantage. Know every bounce. Three under through the tough stretch 5-9.", seed: 5027 },
  { courseKey: "paraparaumu", date: "2026-01-28", targetTotal: 68, notes: "Links masterclass in calm conditions. Attacked every pin. Five birdies, one bogey.", seed: 5028 },

  // February 2026 — Grinding season
  { courseKey: "taraIti", date: "2026-02-01", targetTotal: 70, notes: "Wind switched halfway through. Adjusted well. Birdied the two closing par 5s.", seed: 5029 },
  { courseKey: "newPlymouth", date: "2026-02-05", targetTotal: 72, notes: "Mountain views, solid round. Nothing spectacular but no mistakes. Good mental round.", seed: 5030 },
  { courseKey: "muriwai", date: "2026-02-09", targetTotal: 74, notes: "Brutal west coast wind. Double on 9 from OB. Salvaged the back nine with two birdies.", seed: 5031 },
  { courseKey: "whitfordPark", date: "2026-02-13", targetTotal: 69, notes: "Short course but tricky. Drove it great — hit 13/14 fairways. Wedge game was the key today.", seed: 5032 },
  { courseKey: "wainui", date: "2026-02-17", targetTotal: 70, notes: "Nice parkland track. Four birdies offset by two bogeys and a sloppy double. Work to do.", seed: 5033 },
  { courseKey: "royalMelbourne", date: "2026-02-21", targetTotal: 71, notes: "Second crack at the sandbelt. Much better this time. Reading greens well, bunker play improved.", seed: 5034 },
  { courseKey: "kingstonHeath", date: "2026-02-25", targetTotal: 70, notes: "Redemption round at KH. Three under on the front, parred the tough back nine. Progress.", seed: 5035 },
  { courseKey: "capeKidnappers", date: "2026-02-28", targetTotal: 69, notes: "Amazing conditions — no wind! Course played short. Five birdies, the Cape has never been easier.", seed: 5036 },

  // March 2026 — Tournament push, season climax
  { courseKey: "clearwater", date: "2026-03-01", targetTotal: 68, notes: "Tournament qualifier round 1. Dialled in from the start. Hit 16 greens. Putter was hot.", seed: 5037 },
  { courseKey: "clearwater", date: "2026-03-02", targetTotal: 70, notes: "Qualifier round 2. More conservative approach. Bogeyed 17 but birdied 18 to finish two under.", seed: 5038 },
  { courseKey: "royalWellington", date: "2026-03-07", targetTotal: 71, notes: "Practice round for nationals. Testing some new lines off the tee. Approach distances dialled.", seed: 5039 },
  { courseKey: "royalWellington", date: "2026-03-08", targetTotal: 68, notes: "Nationals Round 1. Bogey-free back nine! Five birdies total. Great position going into day 2.", seed: 5040 },
  { courseKey: "royalWellington", date: "2026-03-09", targetTotal: 72, notes: "Nationals Round 2. Grinded. Not my best ball-striking but short game saved par six times.", seed: 5041 },
  { courseKey: "royalWellington", date: "2026-03-10", targetTotal: 69, notes: "Nationals Round 3. Moving day! Four birdies on the back nine. In contention heading into Sunday.", seed: 5042 },
  { courseKey: "royalWellington", date: "2026-03-11", targetTotal: 67, notes: "Nationals Final Round. Best round under pressure. Eagle on 18 to finish T3. Season highlight!", seed: 5043 },
  { courseKey: "gulfHarbour", date: "2026-03-15", targetTotal: 73, notes: "Post-tournament hangover. Mentally drained but still managed one over. Need some rest.", seed: 5044 },
  { courseKey: "titirangi", date: "2026-03-19", targetTotal: 69, notes: "Back to one of my favourites. Smooth swing, controlled flight. Three birdies, all within 10 feet.", seed: 5045 },
  { courseKey: "theAustralian", date: "2026-03-22", targetTotal: 70, notes: "Quick trip to Sydney. Course was in perfect condition. Approach play sharp, putting just okay.", seed: 5046 },
  { courseKey: "newSouthWales", date: "2026-03-23", targetTotal: 71, notes: "Coastal classic. Wind off the Pacific. Loved every minute. Two late birdies made the card respectable.", seed: 5047 },
  { courseKey: "kauriCliffs", date: "2026-03-26", targetTotal: 68, notes: "Back in the north. Drove it beautifully, hit 14 greens. Three birdies on the ocean holes. Pure golf.", seed: 5048 },
  { courseKey: "taraIti", date: "2026-03-28", targetTotal: 66, notes: "Season best! Seven birdies including an eagle on 5. Links golf perfection. Swing has never felt better.", seed: 5049 },
  { courseKey: "royalWellington", date: "2026-03-29", targetTotal: 69, notes: "Season finale at home. Three under — great way to close. Already looking forward to next season.", seed: 5050 },
];

// ── Goals for Tiger ────────────────────────────────────────────

const tigerGoals = [
  {
    id: "tiger-goal-1",
    statCategory: "scoringAverage",
    targetValue: 69.0,
    startValue: 72.0,
    targetDate: "2026-06-01",
    direction: "decrease",
    createdAt: "2025-10-01T08:00:00Z",
    isCompleted: false,
    completedAt: null,
  },
  {
    id: "tiger-goal-2",
    statCategory: "girPercentage",
    targetValue: 72.0,
    startValue: 61.0,
    targetDate: "2026-06-01",
    direction: "increase",
    createdAt: "2025-10-01T08:00:00Z",
    isCompleted: false,
    completedAt: null,
  },
  {
    id: "tiger-goal-3",
    statCategory: "puttsPerRound",
    targetValue: 28.0,
    startValue: 31.0,
    targetDate: "2026-04-01",
    direction: "decrease",
    createdAt: "2025-10-15T08:00:00Z",
    isCompleted: false,
    completedAt: null,
  },
  {
    id: "tiger-goal-4",
    statCategory: "fairwayPercentage",
    targetValue: 70.0,
    startValue: 58.0,
    targetDate: "2026-06-01",
    direction: "increase",
    createdAt: "2025-11-01T08:00:00Z",
    isCompleted: false,
    completedAt: null,
  },
  {
    id: "tiger-goal-5",
    statCategory: "sgApproach",
    targetValue: 1.5,
    startValue: 0.2,
    targetDate: "2026-03-15",
    direction: "increase",
    createdAt: "2025-11-15T08:00:00Z",
    isCompleted: true,
    completedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "tiger-goal-6",
    statCategory: "upAndDownPercentage",
    targetValue: 65.0,
    startValue: 50.0,
    targetDate: "2026-05-01",
    direction: "increase",
    createdAt: "2025-12-01T08:00:00Z",
    isCompleted: false,
    completedAt: null,
  },
  {
    id: "tiger-goal-7",
    statCategory: "sgPutting",
    targetValue: 0.8,
    startValue: -0.3,
    targetDate: "2026-06-01",
    direction: "increase",
    createdAt: "2026-01-01T08:00:00Z",
    isCompleted: false,
    completedAt: null,
  },
];

// ── Main ───────────────────────────────────────────────────────

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client);

  // 1. Create Tiger Hood user
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, TIGER_USER_ID));

  if (existingUser.length > 0) {
    console.log("Tiger Hood already exists — cleaning up old data first...");
    await db.delete(goals).where(eq(goals.userId, TIGER_USER_ID));
    await db.delete(rounds).where(eq(rounds.userId, TIGER_USER_ID));
    await db.delete(users).where(eq(users.id, TIGER_USER_ID));
    console.log("Old data removed.");
  }

  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash("tigerhood123", 12);

  await db.insert(users).values({
    id: TIGER_USER_ID,
    email: "tiger.hood@jolf.app",
    passwordHash,
    name: "Tiger Hood",
    birthdate: "1998-06-15",
    handicap: 1.2,
    homeClub: "Royal Wellington Golf Club",
    city: "Wellington",
    state: "Wellington",
    country: "New Zealand",
    isCollegePlayer: false,
    isTourPlayer: true,
    tourName: "NZ Amateur Tour",
    createdAt: "2025-09-15T08:00:00Z",
    updatedAt: now,
  });

  console.log("Created Tiger Hood user.");

  // 2. Generate and insert 50 rounds
  let roundCount = 0;

  for (let i = 0; i < tigerRounds.length; i++) {
    const def = tigerRounds[i];
    const course = seedCourses[def.courseKey as keyof typeof seedCourses] as CourseInfo;
    if (!course) {
      console.warn(`Unknown course: ${def.courseKey}, skipping.`);
      continue;
    }

    // Generate per-hole scores targeting the desired total
    const scores = generateScores(course, def.targetTotal, def.seed);

    // Build full round with detailed shots, putt misses, etc.
    const roundId = `tiger-round-${String(i + 1).padStart(3, "0")}`;
    const round = buildRoundFromScores(course, scores, def.seed, def.date, def.notes, roundId);

    // Insert into DB (flatten course info for DB schema)
    await db.insert(rounds).values({
      id: round.id,
      userId: TIGER_USER_ID,
      date: round.date,
      courseName: round.course.name,
      courseTees: round.course.tees,
      courseRating: round.course.rating,
      courseSlope: round.course.slope,
      courseTotalPar: round.course.totalPar,
      courseHolePars: round.course.holePars,
      courseHoleDistances: round.course.holeDistances,
      holes: round.holes,
      totalScore: round.totalScore,
      notes: round.notes,
      createdAt: round.createdAt,
      updatedAt: round.updatedAt,
    });

    const toPar = round.totalScore - round.course.totalPar;
    const toParStr = toPar === 0 ? "E" : toPar > 0 ? `+${toPar}` : `${toPar}`;
    console.log(`  Round ${i + 1}: ${round.course.name} — ${round.totalScore} (${toParStr}) on ${round.date}`);
    roundCount++;
  }

  console.log(`\nInserted ${roundCount} rounds.`);

  // 3. Insert goals
  for (const goal of tigerGoals) {
    await db.insert(goals).values({
      id: goal.id,
      userId: TIGER_USER_ID,
      statCategory: goal.statCategory,
      targetValue: goal.targetValue,
      startValue: goal.startValue,
      targetDate: goal.targetDate,
      direction: goal.direction,
      createdAt: goal.createdAt,
      isCompleted: goal.isCompleted,
      completedAt: goal.completedAt,
    });
  }

  console.log(`Inserted ${tigerGoals.length} goals.`);

  // Summary
  const totalScores = tigerRounds.map((r) => r.targetTotal);
  const avg = (totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(1);
  const best = Math.min(...totalScores);
  const worst = Math.max(...totalScores);

  console.log(`\n=== Tiger Hood Summary ===`);
  console.log(`Rounds: ${roundCount}`);
  console.log(`Scoring average: ~${avg}`);
  console.log(`Best: ${best} | Worst: ${worst}`);
  console.log(`Goals: ${tigerGoals.length} (${tigerGoals.filter((g) => g.isCompleted).length} completed)`);
  console.log(`\nLogin: tiger.hood@jolf.app / tigerhood123`);

  await client.end();
  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
