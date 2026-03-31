"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCourseStore } from "@/stores/course-store";
import { useRoundStore } from "@/stores/round-store";
import type { CourseInfo, SavedCourse } from "@/lib/types";
import { Search, Loader2, MapPin, ChevronDown, X } from "lucide-react";
import { useDistanceUnit } from "@/hooks/use-distance-unit";

interface CourseSearchInputProps {
  course: CourseInfo;
  onCourseSelect: (course: CourseInfo) => void;
  onManualEntry: () => void;
}

export function CourseSearchInput({
  course,
  onCourseSelect,
  onManualEntry,
}: CourseSearchInputProps) {
  const { dYards, yLabelShort } = useDistanceUnit();
  const [query, setQuery] = useState(course.name);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<SavedCourse | null>(null);
  const [selectedTee, setSelectedTee] = useState("");
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const searchResults = useCourseStore((s) => s.searchResults);
  const isSearching = useCourseStore((s) => s.isSearching);
  const searchCourses = useCourseStore((s) => s.searchCourses);
  const clearSearch = useCourseStore((s) => s.clearSearch);
  const fetchCourseDetail = useCourseStore((s) => s.fetchCourseDetail);
  const getCourseInfo = useCourseStore((s) => s.getCourseInfo);
  const savedCourses = useCourseStore((s) => s.courses);

  const rounds = useRoundStore((s) => s.rounds);
  const recentCourseNames = [...new Set(rounds.map((r) => r.course.name))].slice(0, 5);

  // Debounced search
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      setSelectedCourse(null);
      setSelectedTee("");

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length >= 2) {
        setIsOpen(true);
        debounceRef.current = setTimeout(() => {
          searchCourses(value);
        }, 300);
      } else {
        setIsOpen(value.length > 0);
        clearSearch();
      }
    },
    [searchCourses, clearSearch]
  );

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

  // Handle selecting a course from search results
  const handleSelectCourse = async (result: SavedCourse) => {
    setQuery(result.name);
    setIsOpen(false);
    setIsLoadingDetail(true);

    // Fetch full detail (with tee data) if we have an externalId
    const externalId = result.externalId;
    if (externalId) {
      const detail = await fetchCourseDetail(externalId);
      if (detail && detail.tees.length > 0) {
        setSelectedCourse(detail);
        // Auto-select first tee
        setSelectedTee(detail.tees[0].name);
        const info = getCourseInfo(detail.id, detail.tees[0].name);
        if (info) onCourseSelect(info);
        setIsLoadingDetail(false);
        return;
      }
    }

    // No tee data available — treat as manual entry with name pre-filled
    setSelectedCourse(null);
    onCourseSelect({ ...course, name: result.name });
    setIsLoadingDetail(false);
  };

  // Handle selecting a course from recent rounds
  const handleSelectRecent = (name: string) => {
    // Find the most recent round for this course to copy its course info
    const recentRound = rounds.find((r) => r.course.name === name);
    if (recentRound) {
      setQuery(name);
      setIsOpen(false);
      onCourseSelect(recentRound.course);
    }
  };

  // Handle tee change
  const handleTeeChange = (teeName: string) => {
    setSelectedTee(teeName);
    if (selectedCourse) {
      const info = getCourseInfo(selectedCourse.id, teeName);
      if (info) onCourseSelect(info);
    }
  };

  // Clear selection
  const handleClear = () => {
    setQuery("");
    setSelectedCourse(null);
    setSelectedTee("");
    clearSearch();
    onManualEntry();
  };

  // Filter saved courses for showing favorites
  const favoriteCourses = savedCourses.filter((c) => c.isFavorite);

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div ref={containerRef} className="relative">
        <Label>Course Name</Label>
        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (query.length >= 2 || recentCourseNames.length > 0) setIsOpen(true);
            }}
            placeholder="Search courses worldwide..."
            className="pl-9 pr-9"
          />
          {query && (
            <button
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

        {/* Dropdown results */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border bg-popover shadow-lg">
            {/* Recent courses */}
            {recentCourseNames.length > 0 && query.length < 2 && (
              <div>
                <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  Recent Courses
                </div>
                {recentCourseNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleSelectRecent(name)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {/* Favorite courses */}
            {favoriteCourses.length > 0 && query.length < 2 && (
              <div>
                <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-t">
                  Favorites
                </div>
                {favoriteCourses.map((c) => (
                  <button
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
                  query.length >= 2 && (
                    <div className="border-t" />
                  )}
                <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  Search Results
                </div>
                {searchResults.map((result) => (
                  <button
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
            {query.length >= 2 && !isSearching && searchResults.length === 0 && (
              <div className="px-3 py-4 text-sm text-center text-muted-foreground">
                No courses found. You can enter details manually below.
              </div>
            )}

            {/* Manual entry link */}
            <div className="border-t">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onManualEntry();
                }}
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
              >
                Enter course manually...
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tee selector (shown when a course with tees is selected) */}
      {selectedCourse && selectedCourse.tees.length > 0 && (
        <div className="space-y-2">
          <Label>Select Tees</Label>
          <div className="flex flex-wrap gap-2">
            {selectedCourse.tees.map((tee) => (
              <Button
                key={tee.name}
                variant={selectedTee === tee.name ? "default" : "outline"}
                size="sm"
                onClick={() => handleTeeChange(tee.name)}
                className="text-xs"
              >
                {tee.name}
                <span className="ml-1 text-[10px] opacity-70">
                  {tee.totalDistance > 0 ? `${dYards(tee.totalDistance)}${yLabelShort}` : ""}
                </span>
              </Button>
            ))}
          </div>
          {selectedTee && (
            <div className="text-xs text-muted-foreground">
              Rating: {course.rating} | Slope: {course.slope} | Par: {course.totalPar}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
