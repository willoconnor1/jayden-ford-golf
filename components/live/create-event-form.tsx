"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLiveSession } from "@/hooks/use-live-session";
import { useCourseStore } from "@/stores/course-store";
import { useRoundStore } from "@/stores/round-store";
import { Search, Loader2, MapPin, X } from "lucide-react";
import type { SavedCourse } from "@/lib/types";

const DEFAULT_PARS = [4, 4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5];

export function CreateEventForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [holePars, setHolePars] = useState<number[]>(DEFAULT_PARS);
  const [submitting, setSubmitting] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const { setOrganizer } = useLiveSession(createdEventId);

  // Course search state
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const searchResults = useCourseStore((s) => s.searchResults);
  const isSearching = useCourseStore((s) => s.isSearching);
  const searchCourses = useCourseStore((s) => s.searchCourses);
  const clearSearch = useCourseStore((s) => s.clearSearch);
  const fetchCourseDetail = useCourseStore((s) => s.fetchCourseDetail);
  const savedCourses = useCourseStore((s) => s.courses);
  const rounds = useRoundStore((s) => s.rounds);

  const recentCourseNames = [...new Set(rounds.map((r) => r.course.name))].slice(0, 5);
  const favoriteCourses = savedCourses.filter((c) => c.isFavorite);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setCourseName(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length >= 2) {
        setIsOpen(true);
        debounceRef.current = setTimeout(() => {
          searchCourses(value);
        }, 300);
      } else {
        setIsOpen(value.length > 0 || recentCourseNames.length > 0 || favoriteCourses.length > 0);
        clearSearch();
      }
    },
    [searchCourses, clearSearch, recentCourseNames.length, favoriteCourses.length]
  );

  const handleSelectCourse = async (result: SavedCourse) => {
    setCourseName(result.name);
    setIsOpen(false);
    setIsLoadingDetail(true);

    if (result.externalId) {
      const detail = await fetchCourseDetail(result.externalId);
      if (detail && detail.tees.length > 0) {
        const pars = detail.tees[0].holePars;
        if (pars && pars.length === 18) {
          setHolePars(pars);
          toast.success("Pars loaded from course data");
        }
        setIsLoadingDetail(false);
        return;
      }
    }

    // Check if any saved course has tee data
    if (result.tees && result.tees.length > 0) {
      const pars = result.tees[0].holePars;
      if (pars && pars.length === 18) {
        setHolePars(pars);
        toast.success("Pars loaded from course data");
      }
    }

    setIsLoadingDetail(false);
  };

  const handleSelectRecent = (recentName: string) => {
    setCourseName(recentName);
    setIsOpen(false);

    // Pull holePars from the most recent round at this course
    const recentRound = rounds.find((r) => r.course.name === recentName);
    if (recentRound?.course.holePars && recentRound.course.holePars.length === 18) {
      setHolePars(recentRound.course.holePars);
      toast.success("Pars loaded from recent round");
    }
  };

  const handleClear = () => {
    setCourseName("");
    clearSearch();
    setHolePars(DEFAULT_PARS);
  };

  function updatePar(index: number, value: number) {
    const next = [...holePars];
    next[index] = Math.max(3, Math.min(6, value));
    setHolePars(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !courseName.trim()) {
      toast.error("Please fill in event name and course name");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/live/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), courseName: courseName.trim(), holePars }),
      });

      if (!res.ok) throw new Error("Failed to create event");
      const { event, organizerSecret } = await res.json();

      // Store organizer secret before navigating
      setCreatedEventId(event.id);
      localStorage.setItem(
        `live-organizer-${event.id}`,
        JSON.stringify({ organizerSecret })
      );

      toast.success(`Event created! Join code: ${event.joinCode}`);
      router.push(`/live/${event.id}`);
    } catch {
      toast.error("Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="event-name">Event Name</Label>
        <Input
          id="event-name"
          placeholder="Saturday Comp"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Course search */}
      <div className="space-y-2">
        <Label>Course Name</Label>
        <div ref={containerRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={courseName}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (courseName.length >= 2 || recentCourseNames.length > 0 || favoriteCourses.length > 0) {
                  setIsOpen(true);
                }
              }}
              placeholder="Search courses..."
              className="pl-9 pr-9"
            />
            {courseName && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {(isSearching || isLoadingDetail) && (
              <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border bg-popover shadow-lg">
              {/* Recent courses */}
              {recentCourseNames.length > 0 && courseName.length < 2 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    Recent Courses
                  </div>
                  {recentCourseNames.map((rName) => (
                    <button
                      type="button"
                      key={rName}
                      onClick={() => handleSelectRecent(rName)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      {rName}
                    </button>
                  ))}
                </div>
              )}

              {/* Favorite courses */}
              {favoriteCourses.length > 0 && courseName.length < 2 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-t">
                    Favorites
                  </div>
                  {favoriteCourses.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => handleSelectCourse(c)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <div>{c.name}</div>
                      {c.city && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {[c.city, c.state, c.country].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Search results */}
              {searchResults.length > 0 && (
                <div>
                  {(recentCourseNames.length > 0 || favoriteCourses.length > 0) &&
                    courseName.length >= 2 && <div className="border-t" />}
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    Search Results
                  </div>
                  {searchResults.map((result) => (
                    <button
                      type="button"
                      key={result.id}
                      onClick={() => handleSelectCourse(result)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <div>{result.name}</div>
                      {(result.city || result.country) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {[result.city, result.state, result.country]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {courseName.length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="px-3 py-4 text-sm text-center text-muted-foreground">
                  No courses found. You can type any name and set pars manually.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Hole Pars</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Front 9 */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Front 9</p>
              <div className="grid grid-cols-9 gap-1">
                {holePars.slice(0, 9).map((par, i) => (
                  <div key={i} className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">{i + 1}</p>
                    <button
                      type="button"
                      className="w-full h-8 rounded border text-sm font-medium bg-background hover:bg-muted transition-colors"
                      onClick={() => updatePar(i, par === 5 ? 3 : par + 1)}
                    >
                      {par}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Back 9 */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Back 9</p>
              <div className="grid grid-cols-9 gap-1">
                {holePars.slice(9, 18).map((par, i) => (
                  <div key={i + 9} className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">{i + 10}</p>
                    <button
                      type="button"
                      className="w-full h-8 rounded border text-sm font-medium bg-background hover:bg-muted transition-colors"
                      onClick={() => updatePar(i + 9, par === 5 ? 3 : par + 1)}
                    >
                      {par}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-right">
              Total Par: {holePars.reduce((a, b) => a + b, 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? "Creating..." : "Create Event"}
      </Button>
    </form>
  );
}
