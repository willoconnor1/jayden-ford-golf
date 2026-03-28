import type { CourseTeeData, SavedCourse } from "./types";

const API_BASE = "https://api.golfcourseapi.com/v1";

// ── Raw API response types ──────────────────────────────────────

interface APITeeHole {
  par: number;
  yardage: number;
  handicap?: number;
}

interface APITee {
  tee_name: string;
  course_rating: number;
  slope_rating: number;
  bogey_rating?: number;
  total_yards: number;
  total_meters?: number;
  number_of_holes: number;
  par_total: number;
  holes: APITeeHole[];
}

// Tees are grouped by gender: { male: APITee[], female: APITee[] }
type APITees = Record<string, APITee[]>;

interface APICourse {
  id: number;
  club_name: string;
  course_name: string;
  location: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  tees: APITees;
}

// ── Search courses ──────────────────────────────────────────────

export async function searchCourses(
  query: string,
  options?: { country?: string; limit?: number }
): Promise<APICourse[]> {
  const apiKey = process.env.GOLF_COURSE_API_KEY;
  if (!apiKey) throw new Error("GOLF_COURSE_API_KEY is not configured");

  const params = new URLSearchParams({ course_name: query });
  if (options?.country) params.set("country", options.country);

  const res = await fetch(`${API_BASE}/courses?${params}`, {
    headers: { Authorization: `Key ${apiKey}` },
  });
  if (!res.ok) throw new Error(`GolfCourseAPI search failed: ${res.status}`);

  const data = await res.json();
  const courses: APICourse[] = data.courses ?? [];
  const limit = options?.limit ?? 20;
  return courses.slice(0, limit);
}

// ── Get course detail ───────────────────────────────────────────

export async function getCourseDetail(
  externalId: string
): Promise<APICourse> {
  const apiKey = process.env.GOLF_COURSE_API_KEY;
  if (!apiKey) throw new Error("GOLF_COURSE_API_KEY is not configured");

  const res = await fetch(`${API_BASE}/courses/${externalId}`, {
    headers: { Authorization: `Key ${apiKey}` },
  });
  if (!res.ok)
    throw new Error(`GolfCourseAPI detail failed: ${res.status}`);

  const data = await res.json();
  return data.course ?? data;
}

// ── Transform API tees → our CourseTeeData[] ─────────────────────

function extractTees(apiTees: APITees): CourseTeeData[] {
  // Use male tees if available, otherwise fall back to female
  const teeList = apiTees.male ?? apiTees.female ?? Object.values(apiTees)[0];
  if (!Array.isArray(teeList)) return [];

  const tees: CourseTeeData[] = [];

  for (const apiTee of teeList) {
    if (!apiTee.holes || apiTee.holes.length === 0) continue;

    const holePars = apiTee.holes.map((h) => h.par);
    const holeDistances = apiTee.holes.map((h) => h.yardage);

    tees.push({
      name: apiTee.tee_name,
      rating: apiTee.course_rating ?? 72,
      slope: apiTee.slope_rating ?? 113,
      totalPar: apiTee.par_total ?? holePars.reduce((a, b) => a + b, 0),
      totalDistance:
        apiTee.total_yards ??
        holeDistances.reduce((a, b) => a + b, 0),
      holePars,
      holeDistances,
    });
  }

  return tees;
}

// ── Transform API course → SavedCourse ──────────────────────────

export function apiCourseToSavedCourse(
  course: APICourse
): Omit<SavedCourse, "createdAt" | "updatedAt"> {
  const tees = extractTees(course.tees ?? {});
  const numberOfHoles = tees.length > 0 ? tees[0].holePars.length : 18;

  return {
    id: crypto.randomUUID(),
    externalId: String(course.id),
    apiSource: "golfcourseapi",
    name: course.course_name || course.club_name,
    clubName: course.club_name,
    city: course.location?.city,
    state: course.location?.state,
    country: course.location?.country,
    latitude: course.location?.latitude,
    longitude: course.location?.longitude,
    numberOfHoles,
    tees,
    lastFetchedAt: tees.length > 0 ? new Date().toISOString() : undefined,
    isFavorite: false,
  };
}
