export type BodyPart = "chest" | "back" | "legs" | "shoulders" | "arms" | "core" | "full_body";

export type SplitFlavor = "full_body" | "upper_lower" | "push_pull_legs";

export type TimeBudget = 30 | 45 | 60 | null;

export type GoalType = "strength" | "hypertrophy" | "endurance" | "fat_loss";

export type Equipment = "barbell" | "dumbbell" | "machine" | "bodyweight" | "cable";

export type SessionStatus = "in_progress" | "completed" | "skipped";

export type Unit = "kg" | "lb";

export interface Goal {
  type: GoalType;
  notes?: string;
}
