import { Events } from 'discord.js';
import { Event } from '../../Classes/index.js';
import { ScheduledEventInterest } from '../../models/attendance/index.js';
import dbConnect from "../../util/libmongo.js";

/** Records when users remove their interest in the scheduled event */
export const guildScheduledEventUserRemove = new Event({
	name: Events.GuildScheduledEventUserRemove,
	execute: async (guildScheduledEvent, user) => {
		await dbConnect();
		const now = new Date();
		// mark all ScheduledEventInterests associated with this eventId/userId and pair as ended
		for await (const e of ScheduledEventInterest.find({eventId: guildScheduledEvent.id, userId: user.id, endedAt: null})) {
			e.endedAt = now;
			e.save();
		}
	},
});
