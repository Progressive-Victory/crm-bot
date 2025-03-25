import { Events, GuildScheduledEvent, PartialGuildScheduledEvent, User } from 'discord.js';
import { Event } from '../../Classes/index.js';
import { ScheduledEventInterest } from '../../features/attendence/index.js';
import dbConnect from "../../util/libmongo.js";

export default new Event({
	name: Events.GuildScheduledEventUserAdd,
	execute: async (guildScheduledEvent: GuildScheduledEvent | PartialGuildScheduledEvent, user: User) => {
		await dbConnect();
		new ScheduledEventInterest({
			userId: user.id,
			displayName: user.displayName,
			eventId: guildScheduledEvent.id,
			eventName: guildScheduledEvent.name,
		}).save();
	},
});
