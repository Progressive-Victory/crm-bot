import { Events, VoiceBasedChannel } from 'discord.js';
import { Event } from '../../Classes/Event.js';
import { logScheduledEvent } from '../../features/logging/scheduledEvent.js';
import { IScheduledEvent, ScheduledEvent } from '../../models/ScheduledEvent.js';
import dbConnect from '../../util/libmongo.js';

export const guildScheduledEventUpdate = new Event({
	name: Events.GuildScheduledEventUpdate,
	execute: async (oldEvent, newEvent) => {
		console.log("updating")
		if (!oldEvent) return
		await dbConnect()

		let res = await ScheduledEvent.findOne({ eventId: newEvent.id }).exec() as IScheduledEvent
		
		if(!res){
			res = await ScheduledEvent.insertOne({
				thumbnailUrl: newEvent.coverImageURL() ?? 'attachment://image.jpg',
				eventUrl: newEvent.url,
				recurrence: newEvent.recurrenceRule ? true : false,
				guildId: newEvent.guildId,
				eventId: newEvent.id,
				channelId: newEvent.channelId,
				createdAt: newEvent.createdAt,
				description: newEvent.description,
				creatorId: newEvent.creatorId,
				scheduledEnd: newEvent.scheduledEndAt,
				scheduledStart: newEvent.scheduledStartAt,
				name: newEvent.name,
				status: newEvent.status
			}) as IScheduledEvent
		}

		if(oldEvent.isScheduled() && newEvent.isActive()) {
			const evChannel: VoiceBasedChannel = newEvent.channel as VoiceBasedChannel
			const members = evChannel.members.values().toArray()
			members.map((usr) => res.attendees.push(usr.id))
			res.startedAt = new Date(Date.now())
		}

		if(!res.recurrence) {
			if(oldEvent.isActive() && newEvent.isCompleted())
				res.endedAt = new Date(Date.now())
		} else {
			if(oldEvent.isActive() && newEvent.isScheduled())
				res.endedAt = new Date(Date.now())
		}

		res.recurrence = newEvent.recurrenceRule ? true : false
		res.thumbnailUrl = newEvent.coverImageURL() ?? 'attachment://image.jpg'
		res.channelId = newEvent.channelId ?? undefined
		res.name = newEvent.name
		res.description = newEvent.description ?? ""
		res.scheduledEnd = newEvent.scheduledEndAt ?? undefined
		res.scheduledStart = newEvent.scheduledStartAt ?? undefined
		res.status = newEvent.status
		res.userCount = newEvent.userCount ?? undefined

		await res.save()

		await logScheduledEvent(res)
	}
})
