import { Events, GuildScheduledEventEntityType, GuildScheduledEventStatus } from "discord.js";
import Event from "../../Classes/Event.js";
import { GuildEvent, IEventUsers } from "../../models/guildEvent.js";

export const guildScheduledEventUpdate = new Event({
	name: Events.GuildScheduledEventUpdate,
	execute: async (oldGuildScheduledEvent, newGuildScheduledEvent) => {
		if(oldGuildScheduledEvent === null
			|| oldGuildScheduledEvent.status === newGuildScheduledEvent.status
			|| newGuildScheduledEvent.entityType === GuildScheduledEventEntityType.External
			|| newGuildScheduledEvent.scheduledStartAt === null
			|| oldGuildScheduledEvent.partial
			|| !newGuildScheduledEvent.channel
		) return

		if(oldGuildScheduledEvent.status === GuildScheduledEventStatus.Scheduled
			&& newGuildScheduledEvent.status === GuildScheduledEventStatus.Active

		) {
			const now = new Date()
			const channel = newGuildScheduledEvent.channel
			const userIds = channel.members.map(m => new Object({
				userId: m.id,
				voiceSession: {
					sessionId: m.voice.sessionId!,
					joinedAt: now
				}
			}) as IEventUsers)

			GuildEvent.create({
				guildId: oldGuildScheduledEvent.guildId,
				eventId: oldGuildScheduledEvent.id,
				name: oldGuildScheduledEvent.name,
				startAt: now,
				scheduledStart: newGuildScheduledEvent.scheduledStartAt,
				userIds
			})
		 }
		else if(oldGuildScheduledEvent.status === GuildScheduledEventStatus.Active
			&& newGuildScheduledEvent.status === GuildScheduledEventStatus.Scheduled

		){ /* empty */ } else {
			console.log(newGuildScheduledEvent.toJSON())
		}


		// console.log('old update')
		// console.log(oldGuildScheduledEventUpdate.toJSON())
		// console.log('new update')
		// console.log(newGuildScheduledEventUpdate.toJSON())

		
	}
})
