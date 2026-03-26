/**
 * Seed script for live events (tournaments) data.
 * Run: npx tsx scripts/seed-live-events.ts
 *
 * Requires DATABASE_URL environment variable.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { liveEvents, livePlayers, liveScores } from "../lib/db/schema";
import { getSeedLiveEvents } from "../lib/seed-data";
import { eq } from "drizzle-orm";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client);

  const seedData = getSeedLiveEvents();

  for (const { event, players, scores } of seedData) {
    // Check if event already exists
    const existing = await db
      .select({ id: liveEvents.id })
      .from(liveEvents)
      .where(eq(liveEvents.id, event.id));

    if (existing.length > 0) {
      console.log(`Event "${event.name}" (${event.id}) already exists, skipping.`);
      continue;
    }

    // Insert event (add organizerSecret required by schema)
    await db.insert(liveEvents).values({
      id: event.id,
      name: event.name,
      courseName: event.courseName,
      joinCode: event.joinCode,
      organizerSecret: "seed-secret-" + event.id,
      holePars: event.holePars,
      status: event.status,
      createdAt: event.createdAt,
    });

    // Insert players
    for (const player of players) {
      await db.insert(livePlayers).values({
        id: player.id,
        eventId: player.eventId,
        name: player.name,
        groupNumber: player.groupNumber,
        createdAt: player.createdAt,
      });
    }

    // Insert scores
    for (const score of scores) {
      await db.insert(liveScores).values({
        id: score.id,
        eventId: score.eventId,
        playerId: score.playerId,
        holeNumber: score.holeNumber,
        strokes: score.strokes,
        createdAt: score.createdAt,
      });
    }

    console.log(`Seeded event "${event.name}" with ${players.length} players and ${scores.length} scores.`);
  }

  await client.end();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
