import { GoalType } from "./types";

export interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  notes?: string;
  updatedAt: string;
}

export class GoalModel {
  private data: Goal;

  constructor(data: Goal) {
    this.data = data;
  }

  get id() {
    return this.data.id;
  }

  get userId() {
    return this.data.userId;
  }

  get type() {
    return this.data.type;
  }

  get notes() {
    return this.data.notes;
  }

  get updatedAt() {
    return this.data.updatedAt;
  }

  setType(type: GoalType) {
    this.data.type = type;
    return this;
  }

  setNotes(notes: string) {
    this.data.notes = notes;
    return this;
  }

  toJSON(): Goal {
    return { ...this.data };
  }
}
