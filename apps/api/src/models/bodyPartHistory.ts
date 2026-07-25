import { BodyPart } from "./types";

export interface BodyPartHistory {
  userId: string;
  bodyPart: BodyPart;
  lastTrainedDate: string;
  lastSessionId: string;
}

export class BodyPartHistoryModel {
  private data: BodyPartHistory;

  constructor(data: BodyPartHistory) {
    this.data = data;
  }

  get userId() {
    return this.data.userId;
  }

  get bodyPart() {
    return this.data.bodyPart;
  }

  get lastTrainedDate() {
    return this.data.lastTrainedDate;
  }

  get lastSessionId() {
    return this.data.lastSessionId;
  }

  setLastTrainedDate(date: string) {
    this.data.lastTrainedDate = date;
    return this;
  }

  setLastSessionId(sessionId: string) {
    this.data.lastSessionId = sessionId;
    return this;
  }

  toJSON(): BodyPartHistory {
    return { ...this.data };
  }
}
