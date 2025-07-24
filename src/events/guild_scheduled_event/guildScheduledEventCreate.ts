import { Events } from 'discord.js';
import { Event } from '../../Classes/Event.js';
import { ScheduledEvent } from '../../models/ScheduledEvent.js';
import dbConnect from '../../util/libmongo.js';

export const guildScheduledEventCreate = new Event({
	name: Events.GuildScheduledEventCreate,
	execute: async (event) => {
		await dbConnect()
		await ScheduledEvent.insertOne({
			thumbnailUrl: event.coverImageURL() ?? 'attachment://image.jpg',
			eventUrl: event.url,
			recurrence: event.recurrenceRule ? true : false,
			guildId: event.guildId,
			eventId: event.id,
			channelId: event.channelId,
			createdAt: event.createdAt,
			description: event.description,
			creatorId: event.creatorId,
			scheduledEnd: event.scheduledEndAt,
			scheduledStart: event.scheduledStartAt,
			name: event.name,
			status: event.status
		})
	}
})
