"use client";

import { Club, ShotLie, Round } from "@/lib/types";
import { RoundSelection } from "@/lib/stats/dispersion";
import { CLUBS, SHOT_LIES, CLUB_COLORS } from "@/lib/constants-clubs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RoundPickerPopover } from "./round-picker-popover";
import { cn } from "@/lib/utils";

interface DispersionFiltersProps {
  rounds: Round[];
  selectedClubs: Club[];
  onClubsChange: (clubs: Club[]) => void;
  selectedLies: ShotLie[];
  onLiesChange: (lies: ShotLie[]) => void;
  selectedCourses: string[];
  onCoursesChange: (courses: string[]) => void;
  roundSelection: RoundSelection;
  onRoundSelectionChange: (sel: RoundSelection) => void;
  showLieFilter: boolean;
  availableClubs: Club[];
  availableLies: ShotLie[];
  uniqueCourseNames: string[];
}

export function DispersionFilters({
  rounds,
  selectedClubs,
  onClubsChange,
  selectedLies,
  onLiesChange,
  selectedCourses,
  onCoursesChange,
  roundSelection,
  onRoundSelectionChange,
  showLieFilter,
  availableClubs,
  availableLies,
  uniqueCourseNames,
}: DispersionFiltersProps) {
  const toggleClub = (club: Club) => {
    if (selectedClubs.includes(club)) {
      onClubsChange(selectedClubs.filter((c) => c !== club));
    } else {
      onClubsChange([...selectedClubs, club]);
    }
  };

  const toggleLie = (lie: ShotLie) => {
    if (selectedLies.includes(lie)) {
      onLiesChange(selectedLies.filter((l) => l !== lie));
    } else {
      onLiesChange([...selectedLies, lie]);
    }
  };

  const toggleCourse = (name: string) => {
    if (selectedCourses.includes(name)) {
      onCoursesChange(selectedCourses.filter((c) => c !== name));
    } else {
      onCoursesChange([...selectedCourses, name]);
    }
  };

  return (
    <Card>
      <CardContent className="py-4 space-y-3">
        {/* Club Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Clubs</label>
          <div className="flex flex-wrap gap-1.5">
            {CLUBS.filter((c) => availableClubs.includes(c.value)).map((c) => {
              const active = selectedClubs.includes(c.value);
              return (
                <button
                  key={c.value}
                  onClick={() => toggleClub(c.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
                    active
                      ? "bg-primary/20 text-foreground border-primary"
                      : "bg-card/60 text-muted-foreground border-border hover:bg-card/80"
                  )}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: CLUB_COLORS[c.value] }}
                  />
                  {c.label}
                </button>
              );
            })}
          </div>
          {selectedClubs.length === 0 && (
            <p className="text-xs text-amber-400/80">Select at least one club</p>
          )}
        </div>

        {/* Lie Filter (approach only) */}
        {showLieFilter && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Lie</label>
            <div className="flex flex-wrap gap-1.5">
              {SHOT_LIES.filter(
                (l) => l.value !== "tee" && availableLies.includes(l.value)
              ).map((l) => {
                const active = selectedLies.includes(l.value);
                return (
                  <button
                    key={l.value}
                    onClick={() => toggleLie(l.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card/60 text-muted-foreground border-border hover:bg-card/80"
                    )}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Course Filter */}
        {uniqueCourseNames.length > 1 && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Course</label>
            <Popover>
              <PopoverTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-7 text-xs font-medium hover:bg-accent hover:text-accent-foreground">
                  {selectedCourses.length === 0
                    ? "All Courses"
                    : `${selectedCourses.length} course${selectedCourses.length !== 1 ? "s" : ""}`}
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                {uniqueCourseNames.map((name) => {
                  const checked = selectedCourses.includes(name);
                  return (
                    <label
                      key={name}
                      className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-foreground/5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCourse(name)}
                        className="accent-[hsl(var(--primary))] h-3.5 w-3.5 rounded"
                      />
                      <span className="text-xs text-foreground">{name}</span>
                    </label>
                  );
                })}
                {selectedCourses.length > 0 && (
                  <button
                    onClick={() => onCoursesChange([])}
                    className="text-xs text-primary/80 hover:text-primary mt-1 px-2"
                  >
                    Clear
                  </button>
                )}
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Round Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Rounds</label>
          <RoundPickerPopover
            rounds={rounds}
            selection={roundSelection}
            onChange={onRoundSelectionChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
