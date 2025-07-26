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

		let _new = false
		let res

		if(oldEvent.isScheduled() && newEvent.isActive()) {
			console.log("starting event")
			const evChannel = (await newEvent.channel?.fetch()) as VoiceBasedChannel
			_new = true
			res = await ScheduledEvent.insertOne({
				thumbnailUrl: newEvent.coverImageURL() ?? 'attachment://image.jpg',
				eventUrl: newEvent.url,
				recurrence: newEvent.recurrenceRule ? true : false,
				guildId: newEvent.guildId,
				eventId: newEvent.id,
				channelId: newEvent.channelId,
				createdAt: newEvent.createdAt,
				startedAt: new Date(Date.now()),
				description: newEvent.description,
				creatorId: newEvent.creatorId,
				scheduledEnd: newEvent.scheduledEndAt,
				scheduledStart: newEvent.scheduledStartAt,
				name: newEvent.name,
				status: newEvent.status,
				attendees: evChannel.members.map((usr) => {return usr.id})
			}) as IScheduledEvent
		} else {
			res = await ScheduledEvent.findOne({ eventId: newEvent.id }, {}, { sort: {'started_at' : -1}}).exec() as IScheduledEvent
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
			} else {
				res.recurrence = newEvent.recurrenceRule ? true : false
				res.thumbnailUrl = newEvent.coverImageURL() ?? 'attachment://image.jpg'
				res.channelId = newEvent.channelId ?? undefined
				res.name = newEvent.name
				res.description = newEvent.description ?? ""
				res.scheduledEnd = newEvent.scheduledEndAt ?? undefined
				res.scheduledStart = newEvent.scheduledStartAt ?? undefined
				res.status = newEvent.status
				res.userCount = newEvent.userCount ?? undefined
			}
		}

		if(!res.recurrence) {
			if(oldEvent.isActive() && newEvent.isCompleted()){
				console.log("ending one time event")
				res.endedAt = new Date(Date.now())
			}
		} else {
			if(oldEvent.isActive() && newEvent.isScheduled()){
				console.log("ending recurring event")
				res.endedAt = new Date(Date.now())
			}
		}

		await res.save()

		await logScheduledEvent(res, _new)
	}
})
