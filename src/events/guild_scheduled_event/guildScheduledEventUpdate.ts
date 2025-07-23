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
				thumbnailUrl: ev.coverImageURL() ?? "https://media.discordapp.net/attachments/1384194259766476841/1397633657946112210/1669652277019.jpeg?ex=68826f46&is=68811dc6&hm=dff46371daebc1d85c8cb4fb4532ce63cfc5c9b08102961f06f35ead34dae35f&=&format=webp&width=300&height=300",
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
		res.thumbnailUrl = ev.coverImageURL() ?? "https://media.discordapp.net/attachments/1384194259766476841/1397633657946112210/1669652277019.jpeg?ex=68826f46&is=68811dc6&hm=dff46371daebc1d85c8cb4fb4532ce63cfc5c9b08102961f06f35ead34dae35f&=&format=webp&width=300&height=300"
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
