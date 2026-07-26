export type BodyPart = "chest" | "back" | "legs" | "shoulders" | "arms" | "core" | "full_body";

export type SplitFlavor = "full_body" | "upper_lower" | "push_pull_legs";

export type TimeBudget = 30 | 45 | 60 | null;

export interface Goal {
  type: "strength" | "hypertrophy" | "endurance" | "fat_loss";
  notes?: string;
}
