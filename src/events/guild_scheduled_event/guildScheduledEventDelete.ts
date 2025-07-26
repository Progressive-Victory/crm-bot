import { Events, GuildScheduledEventStatus } from 'discord.js';
import { Event } from '../../Classes/Event.js';
import { logScheduledEvent } from '../../features/logging/scheduledEvent.js';
import { IScheduledEvent, ScheduledEvent } from '../../models/ScheduledEvent.js';
import dbConnect from '../../util/libmongo.js';

export const guildScheduledEventDelete = new Event({
	name: Events.GuildScheduledEventDelete,
	execute: async (event) => {
		console.log("deleting")
		await dbConnect()
		const res: IScheduledEvent = (await ScheduledEvent.find({ eventId: event.id }).sort({ '_id': -1 }).exec())[0] as IScheduledEvent
		res.status = GuildScheduledEventStatus.Canceled
		res.save()
		await logScheduledEvent(res)
	}
})
