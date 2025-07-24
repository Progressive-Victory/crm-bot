import { Events, VoiceBasedChannel } from 'discord.js';
import { Event } from '../../Classes/Event.js';
import { IScheduledEvent, ScheduledEvent } from '../../models/ScheduledEvent.js';
import dbConnect from '../../util/libmongo.js';

export const guildScheduledEventUpdate = new Event({
	name: Events.GuildScheduledEventUpdate,
	execute: async (event) => {
		if (!event) return
		const ev = await event.fetch() //for some reason the argument version is always outdated
		await dbConnect()

		let res = await ScheduledEvent.findOne({ eventId: event.id }).exec() as IScheduledEvent
		
		if(!res){
			res = await ScheduledEvent.insertOne({
				thumbnailUrl: ev.coverImageURL() ?? 'attachment://image.jpg',
				eventUrl: ev.url,
				recurrence: ev.recurrenceRule ? true : false,
				guildId: ev.guildId,
				eventId: ev.id,
				channelId: ev.channelId,
				createdAt: ev.createdAt,
				description: ev.description,
				creatorId: ev.creatorId,
				scheduledEnd: ev.scheduledEndAt,
				scheduledStart: ev.scheduledStartAt,
				name: ev.name,
				status: ev.status
			}) as IScheduledEvent
		}

		if(ev.isActive()) {
			const evChannel: VoiceBasedChannel = ev.channel as VoiceBasedChannel
			const members = evChannel.members.values().toArray()
			members.map((usr) => res.attendees.push(usr.id))
			res.startedAt = new Date(Date.now())
		}

		if(ev.isCompleted()) {
			res.endedAt = new Date(Date.now())
		}

		res.recurrence = ev.recurrenceRule ? true : false
		res.thumbnailUrl = ev.coverImageURL() ?? 'attachment://image.jpg'
		res.channelId = ev.channelId ?? undefined
		res.name = ev.name
		res.description = ev.description ?? ""
		res.scheduledEnd = ev.scheduledEndAt ?? undefined
		res.scheduledStart = ev.scheduledStartAt ?? undefined
		res.status = ev.status
		res.userCount = ev.userCount ?? undefined

		await res.save()
	}
})
