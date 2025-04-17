import { Events, GuildScheduledEvent, GuildScheduledEventStatus, PartialGuildScheduledEvent } from 'discord.js';
import { Event } from '../../Classes/index.js';
import { ActivatedEvent } from '../../features/attendance/index.js';
import dbConnect from "../../util/libmongo.js";

/** Records when scheduled events start and stop */
export default new Event({
	name: Events.GuildScheduledEventUpdate,
	execute: async (oldGuildScheduledEvent: GuildScheduledEvent | PartialGuildScheduledEvent | null, newGuildScheduledEvent: GuildScheduledEvent) => {
		await dbConnect();
		// if the event goes from active to something else
		if (oldGuildScheduledEvent?.status == GuildScheduledEventStatus.Active && newGuildScheduledEvent?.status != GuildScheduledEventStatus.Active) {
			const now = new Date();
			// mark older objects as ended (there should only be one)
			for await (const e of ActivatedEvent.find({eventId: oldGuildScheduledEvent.id, endedAt: null})) {
				e.endedAt = now;
				e.save();
			}
		}
		// if the event get activated
		if (oldGuildScheduledEvent?.status != GuildScheduledEventStatus.Active && newGuildScheduledEvent?.status == GuildScheduledEventStatus.Active) {
			new ActivatedEvent({
				eventId: newGuildScheduledEvent.id,
				eventName: newGuildScheduledEvent.name,
			}).save();
		}
	},
});
