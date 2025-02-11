import { Events, GuildScheduledEvent, PartialGuildScheduledEvent, User } from 'discord.js';
import { Event } from '../../Classes/index.js';

export default new Event({
	name: Events.GuildScheduledEventUserAdd,
	execute: (guildScheduledEvent: GuildScheduledEvent | PartialGuildScheduledEvent, user: User) => {
		console.log(`${user.username} has registered interest in ${guildScheduledEvent.name}`)
	},
});
