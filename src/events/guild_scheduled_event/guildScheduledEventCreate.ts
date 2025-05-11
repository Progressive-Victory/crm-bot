import { Events } from "discord.js";
import { Event } from '../../Classes/index.js';
import { ScheduledEvent } from "../../models/attendance/ScheduledEvent.js";

export const guildScheduledEventUpdate = new Event({
	name: Events.GuildScheduledEventCreate,
	execute: async (guildScheduledEvent) => {
		
		const {id , name, scheduledStartAt, channelId} = guildScheduledEvent
		
		ScheduledEvent.create({
			eventId: id,
			eventName: name,
			scheduledStartTime: scheduledStartAt,
			channelId: channelId,
		})
	}})
