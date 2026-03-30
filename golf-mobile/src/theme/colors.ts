export const colors = {
  // Primary – matches web oklch(0.77 0.08 245)
  primary: "#6BA3D6",
  primaryLight: "#89B8E3",
  primaryDark: "#4A7FB5",

  // Accent – matches web golden/warm accent
  accent: "#F4A261",
  accentLight: "#F7BD8A",
  accentDark: "#E08A3E",

  // Background – dark theme matching web
  background: "#1a1a1a",       // near-black base
  surface: "#2a2a2a",          // slightly lighter for cards/surfaces
  surfaceGlass: "rgba(42,42,42,0.80)", // glassmorphic card bg
  border: "rgba(255,255,255,0.10)",    // soft ring like web

  // Text – white hierarchy matching web
  text: "#f5f5f5",             // primary text (near-white)
  textSecondary: "rgba(255,255,255,0.70)", // secondary
  textMuted: "rgba(255,255,255,0.45)",     // muted/labels

  // Score colors (unchanged – these pop on dark)
  eagle: "#b91c1c",
  birdie: "#ef4444",
  par: "#9ca3af",              // lighter gray for dark bg
  bogey: "#0ea5e9",
  doublePlus: "#1d4ed8",

  // Pill active colors
  emerald: "#0d9488",
  blue: "#6BA3D6",
  violet: "#7c3aed",
  amber: "#F4A261",
  slate: "#64748b",            // lighter slate for dark bg

  // Semantic
  success: "#22c55e",          // fixed: was mapped to primary
  danger: "#dc2626",
  warning: "#d97706",
  info: "#2563eb",

  // Utility
  white: "#ffffff",
  black: "#000000",
  overlay: "rgba(0,0,0,0.55)",

  // Dark input/interactive surfaces
  inputBg: "rgba(255,255,255,0.08)",
  inputBorder: "rgba(255,255,255,0.15)",
  pillInactiveBg: "rgba(255,255,255,0.08)",
  pillInactiveBorder: "rgba(255,255,255,0.15)",
  pillInactiveText: "rgba(255,255,255,0.60)",
  disabledBg: "rgba(255,255,255,0.10)",
  disabledText: "rgba(255,255,255,0.30)",
} as const;
