import { Events } from 'discord.js';
import { Event } from '../../Classes/index.js';
import { ScheduledEventInterest } from '../../features/attendance/index.js';
import dbConnect from "../../util/libmongo.js";

/** Records when a user presses the interested button on the scheduled event */
export const guildScheduledEventUserAdd = new Event({
	name: Events.GuildScheduledEventUserAdd,
	execute: async (guildScheduledEvent, user) => {
		await dbConnect();
		new ScheduledEventInterest({
			userId: user.id,
			displayName: user.displayName,
			eventId: guildScheduledEvent.id,
			eventName: guildScheduledEvent.name,
		}).save();
	},
});
