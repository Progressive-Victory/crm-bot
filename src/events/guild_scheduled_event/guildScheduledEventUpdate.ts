import { Events, GuildScheduledEvent, GuildScheduledEventStatus, PartialGuildScheduledEvent } from 'discord.js';
import { Event } from '../../Classes/index.js';
import { ActivatedEvent } from '../../features/attendance/index.js';

export default new Event({
	name: Events.GuildScheduledEventUpdate,
	execute: async (oldGuildScheduledEvent: GuildScheduledEvent | PartialGuildScheduledEvent | null, newGuildScheduledEvent: GuildScheduledEvent) => {
		if (oldGuildScheduledEvent?.status == GuildScheduledEventStatus.Active && newGuildScheduledEvent?.status != GuildScheduledEventStatus.Active) {
			const now = new Date();
			for await (const e of ActivatedEvent.find({eventId: oldGuildScheduledEvent.id, endedAt: null})) {
				e.endedAt = now;
				e.save();
			}
		}
		if (oldGuildScheduledEvent?.status != GuildScheduledEventStatus.Active && newGuildScheduledEvent?.status == GuildScheduledEventStatus.Active) {
			ActivatedEvent.create({
				eventId: newGuildScheduledEvent.id,
				eventName: newGuildScheduledEvent.name,
			})
		}
	},
});
