import { Events } from "discord.js";
import Event from "../../Classes/Event.js";

export const guildScheduledEventCreate = new Event({
	name: Events.GuildScheduledEventCreate,
	execute: (guildScheduledEvent) => {
		if(guildScheduledEvent.partial) return
		console.log('created')
		console.log(guildScheduledEvent.toJSON())
	}
})
