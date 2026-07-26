export interface WeeklyIntention {
  id: string;
  userId: string;
  weekStartDate: string;
  targetSessions: number;
}

export class WeeklyIntentionModel {
  private data: WeeklyIntention;

  constructor(data: WeeklyIntention) {
    this.data = data;
  }

  get id() {
    return this.data.id;
  }

  get userId() {
    return this.data.userId;
  }

  get weekStartDate() {
    return this.data.weekStartDate;
  }

  get targetSessions() {
    return this.data.targetSessions;
  }

  setTargetSessions(count: number) {
    this.data.targetSessions = count;
    return this;
  }

  toJSON(): WeeklyIntention {
    return { ...this.data };
  }
}
