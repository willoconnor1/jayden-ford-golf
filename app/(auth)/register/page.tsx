"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { COUNTRIES } from "@/lib/data/countries";
import { GOLF_TOURS } from "@/lib/data/golf-tours";
import { COLLEGE_GOLF_TEAMS } from "@/lib/data/colleges";
import { BENCHMARK_LEVELS, BENCHMARK_LABELS, BenchmarkLevel } from "@/lib/types";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [handicap, setHandicap] = useState("");
  const [homeClub, setHomeClub] = useState("");
  const [isCollegePlayer, setIsCollegePlayer] = useState(false);
  const [collegeName, setCollegeName] = useState("");
  const [isTourPlayer, setIsTourPlayer] = useState(false);
  const [tourName, setTourName] = useState("");
  const [distanceUnit, setDistanceUnit] = useState<"yards" | "meters">("yards");
  const [benchmarkLevel, setBenchmarkLevel] = useState<BenchmarkLevel>("pga-tour");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, {
        birthdate,
        city,
        state: state || undefined,
        country,
        handicap: handicap ? parseFloat(handicap) : undefined,
        homeClub: homeClub || undefined,
        isCollegePlayer,
        collegeName: isCollegePlayer ? collegeName || undefined : undefined,
        isTourPlayer,
        tourName: isTourPlayer ? tourName || undefined : undefined,
        distanceUnit,
        benchmarkLevel,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold">
          J
        </div>
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>
          Start tracking your game
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {/* Account fields */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Profile fields */}
          <div className="border-t border-border pt-4 mt-4">
            <p className="text-sm font-medium text-white/60 mb-3">Profile Info</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="birthdate">Date of Birth</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Wellington"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">
                    State <span className="text-white/40 font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="Oregon"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Country</Label>
                <Combobox
                  options={COUNTRIES}
                  value={country}
                  onValueChange={setCountry}
                  placeholder="Select country"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Handicap <span className="text-white/40 font-normal">(optional)</span>
                </Label>
                <Select value={handicap} onValueChange={(v) => setHandicap(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select handicap" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 56 }, (_, i) => {
                      const db = i - 10; // -10 to 45
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
                <Label htmlFor="home-club">
                  Home Golf Club <span className="text-white/40 font-normal">(optional)</span>
                </Label>
                <Input
                  id="home-club"
                  type="text"
                  placeholder="Your home course"
                  value={homeClub}
                  onChange={(e) => setHomeClub(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Distance Units</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={distanceUnit === "yards" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setDistanceUnit("yards")}
                  >
                    Yards / Feet
                  </Button>
                  <Button
                    type="button"
                    variant={distanceUnit === "meters" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setDistanceUnit("meters")}
                  >
                    Meters
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Compare your stats against</Label>
                <div className="grid grid-cols-3 gap-2">
                  {BENCHMARK_LEVELS.map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={benchmarkLevel === level ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setBenchmarkLevel(level)}
                    >
                      {BENCHMARK_LABELS[level]}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-white/40">
                  You can change this later in Settings as your game improves.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="college-toggle" className="cursor-pointer">Do you play college golf?</Label>
                  <Switch
                    id="college-toggle"
                    checked={isCollegePlayer}
                    onCheckedChange={setIsCollegePlayer}
                  />
                </div>
                {isCollegePlayer && (
                  <Combobox
                    options={COLLEGE_GOLF_TEAMS}
                    value={collegeName}
                    onValueChange={setCollegeName}
                    placeholder="Search college / university..."
                    freeSolo
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tour-toggle" className="cursor-pointer">Are you on a golf tour?</Label>
                  <Switch
                    id="tour-toggle"
                    checked={isTourPlayer}
                    onCheckedChange={setIsTourPlayer}
                  />
                </div>
                {isTourPlayer && (
                  <Combobox
                    options={GOLF_TOURS}
                    value={tourName}
                    onValueChange={setTourName}
                    placeholder="Search tour..."
                    freeSolo
                  />
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
