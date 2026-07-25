import { BodyPart, Equipment } from "./types";

export interface Exercise {
  id: string;
  name: string;
  bodyPart: BodyPart;
  secondaryBodyParts: BodyPart[];
  equipment: Equipment;
  youtubeVideoId: string;
  youtubeTitle: string;
  youtubeChannel: string;
  source: "AI_generated" | "manual_override";
  alternatives: string[];
}

export class ExerciseModel {
  private data: Exercise;

  constructor(data: Exercise) {
    this.data = data;
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get bodyPart() {
    return this.data.bodyPart;
  }

  get secondaryBodyParts() {
    return this.data.secondaryBodyParts;
  }

  get equipment() {
    return this.data.equipment;
  }

  get youtubeVideoId() {
    return this.data.youtubeVideoId;
  }

  get youtubeTitle() {
    return this.data.youtubeTitle;
  }

  get youtubeChannel() {
    return this.data.youtubeChannel;
  }

  get source() {
    return this.data.source;
  }

  get alternatives() {
    return this.data.alternatives;
  }

  setYoutubeVideoId(videoId: string) {
    this.data.youtubeVideoId = videoId;
    return this;
  }

  setYoutubeTitle(title: string) {
    this.data.youtubeTitle = title;
    return this;
  }

  setYoutubeChannel(channel: string) {
    this.data.youtubeChannel = channel;
    return this;
  }

  toJSON(): Exercise {
    return { ...this.data };
  }
}
