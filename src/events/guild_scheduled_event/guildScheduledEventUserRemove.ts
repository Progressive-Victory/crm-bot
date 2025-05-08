import { Events } from 'discord.js';
import { Event } from '../../Classes/index.js';
import { ScheduledEventInterest } from '../../models/attendance/index.js';
import dbConnect from "../../util/libmongo.js";

/** Records when users remove their interest in the scheduled event */
export const guildScheduledEventUserRemove = new Event({
	name: Events.GuildScheduledEventUserRemove,
	execute: async (guildScheduledEvent, user) => {
		await dbConnect();
		// mark all ScheduledEventInterests associated with this eventId/userId and pair as ended
		ScheduledEventInterest.updateMany({ eventId: guildScheduledEvent.id, userId: user.id, endedAt: null }, { endedAt: new Date() }).exec();
	},
});
