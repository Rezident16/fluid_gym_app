import { TimeBudget, SessionStatus, BodyPart, Unit } from "./types";

export interface SetLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
  unit: Unit;
  completedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  date: string;
  timeBudgetMinutes: TimeBudget;
  plannedBodyParts: BodyPart[];
  status: SessionStatus;
  setLogs: SetLog[];
}

export class SessionModel {
  private data: Session;

  constructor(data: Session) {
    this.data = data;
  }

  get id() {
    return this.data.id;
  }

  get userId() {
    return this.data.userId;
  }

  get date() {
    return this.data.date;
  }

  get timeBudgetMinutes() {
    return this.data.timeBudgetMinutes;
  }

  get plannedBodyParts() {
    return this.data.plannedBodyParts;
  }

  get status() {
    return this.data.status;
  }

  get setLogs() {
    return this.data.setLogs;
  }

  setStatus(status: SessionStatus) {
    this.data.status = status;
    return this;
  }

  addSetLog(setLog: SetLog) {
    this.data.setLogs.push(setLog);
    return this;
  }

  toJSON(): Session {
    return { ...this.data, setLogs: [...this.data.setLogs] };
  }
}
