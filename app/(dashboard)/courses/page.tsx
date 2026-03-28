"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { PageBackground } from "@/components/layout/page-background";
import { useCourseStore } from "@/stores/course-store";
import { useRoundStore } from "@/stores/round-store";
import { useHydration } from "@/hooks/use-hydration";
import { Search, MapPin, Loader2, Trophy } from "lucide-react";

export default function CoursesPage() {
  const hydrated = useHydration();
  const searchResults = useCourseStore((s) => s.searchResults);
  const isSearching = useCourseStore((s) => s.isSearching);
  const searchCourses = useCourseStore((s) => s.searchCourses);
  const clearSearch = useCourseStore((s) => s.clearSearch);
  const rounds = useRoundStore((s) => s.rounds);

  const [query, setQuery] = useState("");

  // Build "most played" leaderboard from rounds
  const mostPlayed = useMemo(() => {
    const counts = new Map<
      string,
      { count: number; bestScore: number | null; lastPlayed: string }
    >();
    for (const round of rounds) {
      const name = round.course.name;
      const existing = counts.get(name);
      if (existing) {
        existing.count++;
        if (
          round.totalScore > 0 &&
          (existing.bestScore === null || round.totalScore < existing.bestScore)
        ) {
          existing.bestScore = round.totalScore;
        }
        if (round.date > existing.lastPlayed) {
          existing.lastPlayed = round.date;
        }
      } else {
        counts.set(name, {
          count: 1,
          bestScore: round.totalScore > 0 ? round.totalScore : null,
          lastPlayed: round.date,
        });
      }
    }
    return [...counts.entries()]
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [rounds]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length >= 2) {
      searchCourses(value);
    } else {
      clearSearch();
    }
  };

  if (!hydrated) {
    return (
      <>
        <PageBackground image="/royal-18th.jpg" />
        <div className="relative z-10">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-muted/60 rounded w-48" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted/60 rounded-lg" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBackground image="/royal-18th.jpg" />
      <div className="relative z-10">
      <PageHeader
        title="Courses"
        description="Search courses and track where you play"
      />

      {/* Most Played Courses */}
      {mostPlayed.length > 0 && (
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
            <Trophy className="h-4 w-4" />
            Most Played
          </h2>
          <div className="space-y-2">
            {mostPlayed.map((course, i) => (
              <Card key={course.name}>
                <CardContent className="py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white/60 w-7 text-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base truncate">
                        {course.name}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/60 mt-0.5">
                        <span>
                          {course.count} round{course.count === 1 ? "" : "s"}
                        </span>
                        {course.bestScore !== null && (
                          <span>Best: {course.bestScore}</span>
                        )}
                        <span>
                          Last:{" "}
                          {new Date(course.lastPlayed).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="shrink-0 tabular-nums"
                    >
                      {course.count}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Course Database Search */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
          <Search className="h-4 w-4" />
          Course Database
        </h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for any course..."
            className="pl-9"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-white/60" />
          )}

          {/* Search results dropdown */}
          {searchResults.length > 0 && query.length >= 2 && (
            <div className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto rounded-lg border bg-popover shadow-lg">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="px-3 py-2 text-sm border-b last:border-b-0"
                >
                  <p className="font-medium">{result.name}</p>
                  {(result.city || result.country) && (
                    <div className="flex items-center gap-1 text-xs text-white/60 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {[result.city, result.state, result.country]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {query.length === 0 && (
          <p className="text-sm text-white/70 mt-3">
            Search by course name to browse the database.
          </p>
        )}
      </section>
      </div>
    </>
  );
}
