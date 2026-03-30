"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { PageHeader } from "@/components/layout/page-header";
import { PageBackground } from "@/components/layout/page-background";
import { useAuth } from "@/components/auth-provider";
import { COUNTRIES } from "@/lib/data/countries";
import { GOLF_TOURS } from "@/lib/data/golf-tours";
import { COLLEGE_GOLF_TEAMS } from "@/lib/data/colleges";
import { useStats } from "@/hooks/use-stats";
import { useStrokesGained } from "@/hooks/use-strokes-gained";
import { useHydration } from "@/hooks/use-hydration";
import { useRoundStore } from "@/stores/round-store";
import { toast } from "sonner";
import { Pencil, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ProfileData {
  name: string;
  email: string;
  birthdate: string | null;
  handicap: number | null;
  homeClub: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  isCollegePlayer: boolean;
  collegeName: string | null;
  isTourPlayer: boolean;
  tourName: string | null;
  createdAt: string;
}

function formatHandicap(value: number | null): string {
  if (value == null) return "—";
  if (value < 0) return `+${Math.abs(value)}`;
  if (value === 0) return "Scratch (0)";
  return String(value);
}

export default function ProfilePage() {
  const hydrated = useHydration();
  const { user, refreshUser } = useAuth();
  const rounds = useRoundStore((s) => s.rounds);
  const { aggregateStats } = useStats();
  const { sgAverages } = useStrokesGained();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formBirthdate, setFormBirthdate] = useState("");
  const [formHandicap, setFormHandicap] = useState("");
  const [formHomeClub, setFormHomeClub] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formCountry, setFormCountry] = useState("");
  const [formCollegeName, setFormCollegeName] = useState("");
  const [formTourName, setFormTourName] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const startEditing = () => {
    if (!profile) return;
    setFormName(profile.name);
    setFormBirthdate(profile.birthdate ?? "");
    setFormHandicap(profile.handicap != null ? String(profile.handicap) : "");
    setFormHomeClub(profile.homeClub ?? "");
    setFormCity(profile.city ?? "");
    setFormState(profile.state ?? "");
    setFormCountry(profile.country ?? "");
    setFormCollegeName(profile.collegeName ?? "");
    setFormTourName(profile.tourName ?? "");
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveProfile = async () => {
    if (!formCity.trim() || !formCountry.trim()) {
      toast.error("City and Country are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          birthdate: formBirthdate || null,
          handicap: formHandicap ? parseFloat(formHandicap) : null,
          homeClub: formHomeClub || null,
          city: formCity,
          state: formState || null,
          country: formCountry,
          isCollegePlayer: !!formCollegeName.trim(),
          collegeName: formCollegeName.trim() || null,
          isTourPlayer: !!formTourName.trim(),
          tourName: formTourName.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      await fetchProfile();
      await refreshUser();
      setEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <>
        <PageBackground image="/kinloch.jpg" />
        <div className="relative z-10 animate-pulse h-96 bg-muted/60 rounded-lg" />
      </>
    );
  }

  return (
    <>
      <PageBackground image="/kinloch.jpg" />
      <div className="relative z-10">
        <PageHeader
          title="Player Profile"
          description={
            profile?.city && profile?.country
              ? [profile.city, profile.state, profile.country].filter(Boolean).join(", ")
              : undefined
          }
        />

        <div className="space-y-4 sm:space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Profile</CardTitle>
              {!editing ? (
                <Button variant="ghost" size="sm" onClick={startEditing}>
                  <Pencil className="h-4 w-4 mr-1.5" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={saving}>
                    <X className="h-4 w-4 mr-1.5" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveProfile} disabled={saving}>
                    <Save className="h-4 w-4 mr-1.5" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!editing && profile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ProfileField label="Name" value={profile.name} />
                  <ProfileField label="Email" value={profile.email} />
                  <ProfileField
                    label="Date of Birth"
                    value={profile.birthdate ? format(new Date(profile.birthdate + "T00:00:00"), "MMM d, yyyy") : "—"}
                  />
                  <ProfileField label="Handicap" value={formatHandicap(profile.handicap)} />
                  <ProfileField label="Home Club" value={profile.homeClub ?? "—"} />
                  <ProfileField
                    label="Location"
                    value={
                      profile.city && profile.country
                        ? [profile.city, profile.state, profile.country].filter(Boolean).join(", ")
                        : "—"
                    }
                  />
                  {profile.collegeName && (
                    <ProfileField label="College Team" value={profile.collegeName} />
                  )}
                  {profile.tourName && (
                    <ProfileField label="Golf Tour" value={profile.tourName} />
                  )}
                </div>
              ) : editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Name</Label>
                      <Input
                        id="edit-name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-birthdate">Date of Birth</Label>
                      <Input
                        id="edit-birthdate"
                        type="date"
                        value={formBirthdate}
                        onChange={(e) => setFormBirthdate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-city">City</Label>
                      <Input
                        id="edit-city"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-state">State / Region</Label>
                      <Input
                        id="edit-state"
                        value={formState}
                        onChange={(e) => setFormState(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Combobox
                        options={COUNTRIES}
                        value={formCountry}
                        onValueChange={setFormCountry}
                        placeholder="Select country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Handicap</Label>
                      <Select value={formHandicap} onValueChange={(v) => setFormHandicap(v ?? "")}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select handicap" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 56 }, (_, i) => {
                            const db = i - 10;
                            const label = db < 0 ? `+${Math.abs(db)}` : db === 0 ? "Scratch (0)" : String(db);
                            return (
                              <SelectItem key={db} value={String(db)}>
                                {label}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-club">Home Club</Label>
                      <Input
                        id="edit-club"
                        value={formHomeClub}
                        onChange={(e) => setFormHomeClub(e.target.value)}
                        placeholder="Your home course"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        College Team <span className="text-white/40 font-normal">(optional)</span>
                      </Label>
                      <Combobox
                        options={COLLEGE_GOLF_TEAMS}
                        value={formCollegeName}
                        onValueChange={setFormCollegeName}
                        placeholder="Search college / university..."
                        freeSolo
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Golf Tour <span className="text-white/40 font-normal">(optional)</span>
                      </Label>
                      <Combobox
                        options={GOLF_TOURS}
                        value={formTourName}
                        onValueChange={setFormTourName}
                        placeholder="Search tour..."
                        freeSolo
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Stats Summary */}
          {rounds.length > 0 && aggregateStats && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg">Stats Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <StatItem label="Rounds" value={String(aggregateStats.roundCount)} />
                  <StatItem
                    label="Scoring Avg"
                    value={aggregateStats.scoringAverage.toFixed(1)}
                  />
                  <StatItem
                    label="Fairways"
                    value={`${aggregateStats.fairwayPercentage.toFixed(0)}%`}
                  />
                  <StatItem
                    label="GIR"
                    value={`${aggregateStats.girPercentage.toFixed(0)}%`}
                  />
                  <StatItem
                    label="Putts / Round"
                    value={aggregateStats.puttsPerRound.toFixed(1)}
                  />
                  <StatItem
                    label="Scrambling"
                    value={`${aggregateStats.scramblingPercentage.toFixed(0)}%`}
                  />
                  {sgAverages && (
                    <>
                      <StatItem
                        label="SG: Total"
                        value={`${sgAverages.sgTotal >= 0 ? "+" : ""}${sgAverages.sgTotal.toFixed(2)}`}
                        positive={sgAverages.sgTotal >= 0}
                      />
                      <StatItem
                        label="SG: Putting"
                        value={`${sgAverages.sgPutting >= 0 ? "+" : ""}${sgAverages.sgPutting.toFixed(2)}`}
                        positive={sgAverages.sgPutting >= 0}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ProfileField label="Email" value={user?.email ?? "—"} />
                <ProfileField
                  label="Member Since"
                  value={
                    profile?.createdAt
                      ? format(new Date(profile.createdAt), "MMM yyyy")
                      : "—"
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}

function StatItem({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg bg-foreground/5 border border-border px-3 py-2.5">
      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p
        className={cn(
          "text-lg font-bold tabular-nums mt-0.5",
          positive !== undefined
            ? positive
              ? "text-green-500"
              : "text-red-500"
            : ""
        )}
      >
        {value}
      </p>
    </div>
  );
}
