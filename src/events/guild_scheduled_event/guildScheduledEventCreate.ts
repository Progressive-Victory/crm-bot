import { Events } from 'discord.js';
import { Event } from '../../Classes/Event.js';
import { ScheduledEvent } from '../../models/ScheduledEvent.js';
import dbConnect from '../../util/libmongo.js';

export const guildScheduledEventCreate = new Event({
	name: Events.GuildScheduledEventCreate,
	execute: async (event) => {
		await dbConnect()
		await ScheduledEvent.insertOne({
			thumbnailUrl: event.coverImageURL() ?? "https://media.discordapp.net/attachments/1384194259766476841/1397633657946112210/1669652277019.jpeg?ex=68826f46&is=68811dc6&hm=dff46371daebc1d85c8cb4fb4532ce63cfc5c9b08102961f06f35ead34dae35f&=&format=webp&width=300&height=300",
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
