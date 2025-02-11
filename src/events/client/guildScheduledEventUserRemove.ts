import { Events, GuildScheduledEvent, PartialGuildScheduledEvent, User } from 'discord.js';
import { Event } from '../../Classes/index.js';

export default new Event({
	name: Events.GuildScheduledEventUserRemove,
	execute: (guildScheduledEvent: GuildScheduledEvent | PartialGuildScheduledEvent, user: User) => {
		console.log(`${user.username} has rescinded interest in ${guildScheduledEvent.name}`)
	},
});
