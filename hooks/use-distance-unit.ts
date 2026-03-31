import { useAuth } from "@/components/auth-provider";
import {
  displayYards,
  displayFeet,
  inputToYards,
  inputToFeet,
  yardsLabel,
  yardsLabelShort,
  feetLabel,
  type DistanceUnit,
} from "@/lib/distance-utils";

export function useDistanceUnit() {
  const { user } = useAuth();
  const unit: DistanceUnit = user?.distanceUnit ?? "yards";

  return {
    unit,
    dYards: (yards: number) => displayYards(yards, unit),
    dFeet: (feet: number) => displayFeet(feet, unit),
    iYards: (value: number) => inputToYards(value, unit),
    iFeet: (value: number) => inputToFeet(value, unit),
    yLabel: yardsLabel(unit),
    yLabelShort: yardsLabelShort(unit),
    fLabel: feetLabel(unit),
  };
}
