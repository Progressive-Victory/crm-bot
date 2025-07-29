import { GuildScheduledEventStatus, time } from "discord.js";
import { client } from "../index.js";
import { IScheduledEvent } from "../models/ScheduledEvent.js";

export class ScheduledEventWrapper {
  event: IScheduledEvent;

  statusColor = () => {
    let color: number;
    switch (this.event.status) {
      case 1:
        color = 0x57F386;
        break;
      case 2:
        color = 0x3498DB;
        break;
      case 3:
        color = 0x57F386;
        break;
      case 4:
        color = 0xED4245;
        break;
      default:
        color = 0xffffff;
    }

    return color;
  };

  duration = () => {
    if (!this.event.startedAt) {
      return "N/A";
    } else {
      if (!this.event.endedAt) {
        return "N/A";
      } else {
        return Math.round(
          (this.event.endedAt.getTime() - this.event.startedAt.getTime()) /
            60000,
        );
      }
    }
  };

  guild = async () => {
    return await client.guilds.fetch(this.event.guildId);
  };

  guildEvent = async () => {
    return await (await this.guild()).scheduledEvents.fetch(this.event.id);
  };

  channel = async () => {
    return this.event.channelId
      ? await (await this.guild()).channels.fetch(this.event.channelId)
      : null;
  };

  createdAt = () => {
    return time(this.event.createdAt);
  };

  description = () => {
    return this.event.description ? this.event.description : "None";
  };

  creator = async () => {
    return (await this.guild()).members.fetch(this.event.creatorId);
  };

  scheduledEnd = () => {
    return this.event.scheduledEnd ? time(this.event.scheduledEnd) : "None";
  };

  scheduledStart = () => {
    return this.event.scheduledStart ? time(this.event.scheduledStart) : "None";
  };

  scheduledStartDate = () => {
    return this.event.scheduledStart
      ? time(this.event.scheduledStart, "D")
      : "None";
  };

  scheduledStartTime = () => {
    return this.event.scheduledStart
      ? time(this.event.scheduledStart, "t")
      : "None";
  };

  scheduledEndTime = () => {
    return this.event.scheduledEnd
      ? time(this.event.scheduledEnd, "t")
      : "None";
  };

  startDate = () => {
    return this.event.startedAt ? time(this.event.startedAt, "D") : "None";
  };

  startTime = () => {
    return this.event.startedAt ? time(this.event.startedAt, "t") : "None";
  };

  endTime = () => {
    return this.event.endedAt ? time(this.event.endedAt, "t") : "None";
  };

  name = () => {
    return this.event.name;
  };

  status = () => {
    return GuildScheduledEventStatus[this.event.status];
  };

  startedAt = () => {
    return this.event.startedAt ? time(this.event.startedAt) : "N/A";
  };

  endedAt = () => {
    return this.event.endedAt ? time(this.event.endedAt) : "N/A";
  };

  attendees = async () => {
    const users = await (
      await this.guild()
    ).members.fetch({ user: this.event.attendees, withPresences: true });
    return users.values().toArray();
  };

  userCount = () => {
    return this.event.userCount;
  };

  recurrence = () => {
    return this.event.recurrence ? "Recurring" : "One Time";
  };

  thumbnail = () => {
    return this.event.thumbnailUrl;
  };

  eventLink = () => {
    return this.event.eventUrl;
  };

  constructor(ev: IScheduledEvent) {
    this.event = ev;
  }
}
