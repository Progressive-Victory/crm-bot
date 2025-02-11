import { Events, GuildScheduledEvent, PartialGuildScheduledEvent, User } from 'discord.js';
import { Event } from '../../Classes/index.js';
import { ScheduledEventInterest } from '../../features/attendence/index.js';

export default new Event({
	name: Events.GuildScheduledEventUserRemove,
	execute: async (guildScheduledEvent: GuildScheduledEvent | PartialGuildScheduledEvent, user: User) => {
		const now = new Date();
		for await (const e of ScheduledEventInterest.find({eventId: oldGuildScheduledEvent.id, endedAt: null})) {
			e.endedAt = now;
			e.save();
		}
	},
});
