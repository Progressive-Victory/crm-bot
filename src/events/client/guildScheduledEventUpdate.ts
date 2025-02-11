import { Events, GuildScheduledEvent, GuildScheduledEventStatus, PartialGuildScheduledEvent } from 'discord.js';
import { Event } from '../../Classes/index.js';

export default new Event({
	name: Events.GuildScheduledEventUpdate,
	execute: (oldGuildScheduledEvent: GuildScheduledEvent | PartialGuildScheduledEvent | null, newGuildScheduledEvent: GuildScheduledEvent) => {
		if (oldGuildScheduledEvent?.status == GuildScheduledEventStatus.Active && newGuildScheduledEvent?.status != GuildScheduledEventStatus.Active) {
			console.log(`${newGuildScheduledEvent.name} has stopped`)
		}
		if (oldGuildScheduledEvent?.status != GuildScheduledEventStatus.Active && newGuildScheduledEvent?.status == GuildScheduledEventStatus.Active) {
			console.log(`${newGuildScheduledEvent.name} has started`)
		}
	},
});
