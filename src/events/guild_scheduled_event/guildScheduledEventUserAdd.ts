import { Events, GuildScheduledEvent, PartialGuildScheduledEvent, User } from 'discord.js';
import { Event } from '../../Classes/index.js';
import { ScheduledEventInterest } from '../../features/attendance/index.js';

export default new Event({
	name: Events.GuildScheduledEventUserAdd,
	execute: (guildScheduledEvent: GuildScheduledEvent | PartialGuildScheduledEvent, user: User) => {
		new ScheduledEventInterest({
			userId: user.id,
			displayName: user.displayName,
			eventId: guildScheduledEvent.id,
			eventName: guildScheduledEvent.name,
		}).save();
	},
});
