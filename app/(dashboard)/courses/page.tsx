"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { useCourseStore } from "@/stores/course-store";
import { useHydration } from "@/hooks/use-hydration";
import {
  Search,
  MapPin,
  Star,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { SavedCourse } from "@/lib/types";

export default function CoursesPage() {
  const hydrated = useHydration();
  const courses = useCourseStore((s) => s.courses);
  const searchResults = useCourseStore((s) => s.searchResults);
  const isSearching = useCourseStore((s) => s.isSearching);
  const searchCourses = useCourseStore((s) => s.searchCourses);
  const clearSearch = useCourseStore((s) => s.clearSearch);
  const fetchCourseDetail = useCourseStore((s) => s.fetchCourseDetail);
  const toggleFavorite = useCourseStore((s) => s.toggleFavorite);
  const removeCourse = useCourseStore((s) => s.removeCourse);

  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length >= 2) {
      searchCourses(value);
    } else {
      clearSearch();
    }
  };

  const handleAddCourse = async (result: SavedCourse) => {
    if (!result.externalId) return;
    setLoadingId(result.id);
    await fetchCourseDetail(result.externalId);
    setLoadingId(null);
    setQuery("");
    clearSearch();
  };

  // Sort: favorites first, then alphabetical
  const sorted = [...courses].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return a.name.localeCompare(b.name);
  });

  const favorites = sorted.filter((c) => c.isFavorite);
  const others = sorted.filter((c) => !c.isFavorite);

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-muted rounded w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Courses"
        description={`${courses.length} saved course${courses.length === 1 ? "" : "s"}`}
      />

      {/* Search to add courses */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search courses to add..."
          className="pl-9"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}

        {/* Search results dropdown */}
        {searchResults.length > 0 && query.length >= 2 && (
          <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border bg-popover shadow-lg">
            {searchResults.map((result) => {
              const alreadySaved = courses.some(
                (c) => c.externalId === result.externalId
              );
              return (
                <button
                  key={result.id}
                  onClick={() => !alreadySaved && handleAddCourse(result)}
                  disabled={alreadySaved || loadingId === result.id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate">{result.name}</div>
                    {(result.city || result.country) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {[result.city, result.state, result.country]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                  </div>
                  {alreadySaved ? (
                    <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                      Saved
                    </Badge>
                  ) : loadingId === result.id ? (
                    <Loader2 className="h-4 w-4 animate-spin shrink-0 ml-2" />
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Saved courses list */}
      {courses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No saved courses yet. Search above to add courses.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">
                Favorites
              </h2>
              <div className="space-y-2">
                {favorites.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    expanded={expandedId === course.id}
                    onToggleExpand={() =>
                      setExpandedId(expandedId === course.id ? null : course.id)
                    }
                    onToggleFavorite={() => toggleFavorite(course.id)}
                    onRemove={() => removeCourse(course.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div>
              {favorites.length > 0 && (
                <h2 className="text-sm font-medium text-muted-foreground mb-2">
                  All Courses
                </h2>
              )}
              <div className="space-y-2">
                {others.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    expanded={expandedId === course.id}
                    onToggleExpand={() =>
                      setExpandedId(expandedId === course.id ? null : course.id)
                    }
                    onToggleFavorite={() => toggleFavorite(course.id)}
                    onRemove={() => removeCourse(course.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function CourseCard({
  course,
  expanded,
  onToggleExpand,
  onToggleFavorite,
  onRemove,
}: {
  course: SavedCourse;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
  onRemove: () => void;
}) {
  return (
    <Card>
      <CardContent className="py-3 px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <button onClick={onToggleExpand} className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base truncate">
                  {course.name}
                </p>
                {(course.city || course.state || course.country) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {[course.city, course.state, course.country]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}
                <div className="flex gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span>{course.numberOfHoles} holes</span>
                  <span>{course.tees.length} tee{course.tees.length === 1 ? "" : "s"}</span>
                </div>
              </div>
              <div className="shrink-0">
                {expanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-9 w-9"
            onClick={onToggleFavorite}
          >
            <Star
              className={`h-4 w-4 ${
                course.isFavorite
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Expanded tee details */}
        {expanded && course.tees.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="grid gap-2">
              {course.tees.map((tee) => (
                <div
                  key={tee.name}
                  className="flex items-center justify-between text-sm bg-muted/50 rounded-md px-3 py-2"
                >
                  <span className="font-medium">{tee.name}</span>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{tee.totalDistance}y</span>
                    <span>Par {tee.totalPar}</span>
                    <span>Rating {tee.rating}</span>
                    <span>Slope {tee.slope}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {expanded && course.tees.length === 0 && (
          <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
            No tee data available for this course.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
