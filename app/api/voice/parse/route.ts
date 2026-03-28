import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthUser } from "@/lib/auth";
import type { TemplateType } from "@/lib/voice/voice-templates";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

// Golf vocabulary prompt for Whisper — dramatically improves accuracy for domain terms
const WHISPER_PROMPT =
  "Golf round data entry. Terms: dogleg left, dogleg right, straight, " +
  "driver, 3 wood, 5 wood, 7 wood, 2 hybrid, 3 hybrid, 4 hybrid, 5 hybrid, " +
  "2 iron, 3 iron, 4 iron, 5 iron, 6 iron, 7 iron, 8 iron, 9 iron, " +
  "pitching wedge, gap wedge, sand wedge, lob wedge, PW, GW, SW, LW, " +
  "fairway, rough, bunker, sand, green, holed, out of bounds, OB, " +
  "penalty area, water, trees, tree trouble, " +
  "uphill, downhill, flat, left to right, right to left, " +
  "made, missed, short, long, pulled, pushed, high side, low side, " +
  "lay up, recovery, on the green, in the hole, " +
  "feet, yards, away, out, remaining.";

// ── GPT system prompts per template ────────────────────────────

const CLUBS_LIST =
  '"driver", "3-wood", "5-wood", "7-wood", ' +
  '"2-hybrid", "3-hybrid", "4-hybrid", "5-hybrid", ' +
  '"2-iron", "3-iron", "4-iron", "5-iron", "6-iron", ' +
  '"7-iron", "8-iron", "9-iron", "pw", "gw", "sw", "lw"';

const RESULTS_LIST =
  '"fairway", "rough", "sand", "green", "holed", "penalty-area", "out-of-bounds", "tree-trouble"';

const BASE_INSTRUCTIONS =
  "You are a golf data extraction assistant. Parse the transcript and return a JSON object. " +
  "Only include fields that are clearly mentioned or implied. Return {} if nothing is parseable. " +
  "Be flexible with phrasing — the user may use abbreviated, casual, or out-of-order speech.";

function getSystemPrompt(templateType: TemplateType, phase: "shot" | "putt"): string {
  if (phase === "putt") {
    return (
      BASE_INSTRUCTIONS +
      "\n\nExtract putt data. Return JSON with these optional fields:\n" +
      '- distance: number (feet) — putt length\n' +
      '- puttBreak: one of "straight", "left-to-right", "right-to-left", "multiple"\n' +
      '- puttSlope: one of "uphill", "downhill", "flat", "multiple"\n' +
      '- made: boolean — true if made/sank/drained/holed, false if missed\n' +
      '- missDirection: one of "left", "right", "good-line" — only if missed. "good-line" means the read was correct but speed was off (high side, low side, pro side, on line)\n' +
      '- speed: one of "short", "too-firm", "good-speed" — only if missed. "too-firm" includes long, past, by, blew by\n' +
      '- missX: number (feet, negative=left, positive=right) — numeric miss distance laterally\n' +
      '- missY: number (feet, negative=short, positive=long) — numeric miss distance in depth'
    );
  }

  switch (templateType) {
    case "tee-par45":
      return (
        BASE_INSTRUCTIONS +
        "\n\nExtract tee shot data for a par 4 or 5. Return JSON with these optional fields:\n" +
        `- club: one of ${CLUBS_LIST}\n` +
        `- result: one of ${RESULTS_LIST}\n` +
        '- direction: array of "left" | "right" — shot direction(s). Infer from "left rough", "right bunker", etc.\n' +
        '- missX: number (feet, negative=left, positive=right) — convert yards to feet by multiplying by 3. E.g. "20 yards left" = -60\n' +
        '- distanceRemaining: number (yards) — distance to green after shot\n' +
        '- holeShape: one of "straight", "dogleg-left", "dogleg-right"'
      );
    case "tee-par3":
      return (
        BASE_INSTRUCTIONS +
        "\n\nExtract tee shot data for a par 3. Return JSON with these optional fields:\n" +
        `- club: one of ${CLUBS_LIST}\n` +
        `- result: one of ${RESULTS_LIST}\n` +
        '- direction: array of "left" | "right" | "short" | "long"\n' +
        '- missX: number (feet, negative=left, positive=right) — miss distance laterally\n' +
        '- missY: number (feet, negative=short, positive=long) — miss distance in depth'
      );
    case "approach":
      return (
        BASE_INSTRUCTIONS +
        "\n\nExtract approach shot data. Return JSON with these optional fields:\n" +
        `- club: one of ${CLUBS_LIST}\n` +
        `- result: one of ${RESULTS_LIST}\n` +
        '- intent: one of "green", "lay-up", "recovery"\n' +
        '- direction: array of "left" | "right" | "short" | "long"\n' +
        '- missX: number (feet, negative=left, positive=right)\n' +
        '- missY: number (feet, negative=short, positive=long)\n' +
        '- distanceRemaining: number (yards or feet from hole — use feet if < 50, else yards)'
      );
    case "chip":
      return (
        BASE_INSTRUCTIONS +
        "\n\nExtract chip/short game shot data. Return JSON with these optional fields:\n" +
        '- lie: one of "tee", "fairway", "rough", "sand", "penalty-area"\n' +
        `- club: one of ${CLUBS_LIST}\n` +
        `- result: one of ${RESULTS_LIST}\n` +
        '- distanceRemaining: number (feet from hole after chip)'
      );
    case "penalty-drop":
      return (
        BASE_INSTRUCTIONS +
        "\n\nExtract penalty drop data. Return JSON with these optional fields:\n" +
        '- distanceRemaining: number (yards to green after drop)\n' +
        '- lie: one of "tee", "fairway", "rough", "sand", "penalty-area"'
      );
    default:
      return BASE_INSTRUCTIONS + "\n\nExtract any golf shot data you can identify from the transcript.";
  }
}

// ── Route handler ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const templateType = (formData.get("templateType") as TemplateType) || "tee-par45";
    const phase = (formData.get("phase") as "shot" | "putt") || "shot";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Step 1: Whisper transcription
    const openai = getOpenAI();

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
      language: "en",
      prompt: WHISPER_PROMPT,
    });

    const transcript = transcription.text.trim();
    if (!transcript) {
      return NextResponse.json({ transcript: "", data: {} });
    }

    // Step 2: GPT-4o-mini structured extraction
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 300,
      messages: [
        { role: "system", content: getSystemPrompt(templateType, phase) },
        { role: "user", content: transcript },
      ],
    });

    const rawJson = completion.choices[0]?.message?.content || "{}";
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawJson);
    } catch {
      data = {};
    }

    return NextResponse.json({ transcript, data });
  } catch (error) {
    console.error("Voice parse failed:", error);
    return NextResponse.json(
      { error: "Voice parsing failed" },
      { status: 500 }
    );
  }
}
