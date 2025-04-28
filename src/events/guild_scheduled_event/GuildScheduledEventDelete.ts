import { Events, GuildScheduledEventEntityType } from "discord.js";
import Event from "../../Classes/Event.js";

export const guildScheduledEventDelete = new Event({
	name: Events.GuildScheduledEventDelete,
	execute: (guildScheduledEvent) => {
		if(guildScheduledEvent.partial || guildScheduledEvent.entityType !== GuildScheduledEventEntityType.Voice) return
		console.log('deleted')
		console.log(guildScheduledEvent.toJSON())
	}
})
