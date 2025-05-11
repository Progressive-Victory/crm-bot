import { Events, GuildScheduledEventStatus, MessageFlags, TextDisplayBuilder, time } from 'discord.js';
import { Event } from '../../Classes/index.js';
import { ScheduledEvent, VoiceSession } from '../../models/attendance/index.js';
import { GuildSetting } from "../../models/Setting.js";
import dbConnect from "../../util/libmongo.js";

/** Records when scheduled events start and stop */
export const guildScheduledEventUpdate = new Event({
	name: Events.GuildScheduledEventUpdate,
	execute: async (oldGuildScheduledEvent, newGuildScheduledEvent) => {
		const { client } = newGuildScheduledEvent;
		await dbConnect();
		// if the event goes from active to something else
		if (oldGuildScheduledEvent?.status == GuildScheduledEventStatus.Active && newGuildScheduledEvent?.status != GuildScheduledEventStatus.Active) {
			const now = new Date();
			// mark older objects as ended (there should only be one)
			const event = await ScheduledEvent.findOneAndUpdate({ eventId: oldGuildScheduledEvent.id, endedAt: null }, { endedAt: now }, { returnDocument: 'after' }).exec();
			// take care of left over rows
			ScheduledEvent.updateMany({ eventId: oldGuildScheduledEvent.id, endedAt: null }, { endedAt: now }).exec();
			const settings = await GuildSetting.findOne({guildId: newGuildScheduledEvent.guildId})
			if (!settings?.logging?.eventUpdatesChannelId) {
				console.error("eventUpdatesChannelId not set");
				return;
			}
			const channel = await client.channels.fetch(settings?.logging?.eventUpdatesChannelId);
			if (!event?.endedAt) throw new Error("event had a null endedAt time which should have been set in the query I just ran");
			if (!newGuildScheduledEvent.channelId) {
				console.error("newGuildScheduledEvent had a null channelId");
				return;
			}
			if (!channel?.isSendable()) {
				console.error("eventUpdatesChannelId is not sendable");
				return;
			}
			// the goal is to update the log message with attendance information
			let message = `\
\`${newGuildScheduledEvent.name}\` ended
${time(event.createdAt)} to ${time(event.endedAt)} (${Math.round((event.endedAt.getTime() - event.createdAt.getTime()) / 1000 / 60)}m)
Attended by:
`;
			const voiceSessions = new Map<string, number>();
			// for every voice session during the event
			for await (const voiceSession of VoiceSession.find({
				channelId: event.channelId,
				createdAt: { $lte: event.endedAt }, // joins before the event end
				$or: [
					{
						endedAt: { $gte: event.createdAt }, // leaves after the event begin
					},
					{
						endedAt: null, // still in voice channel
					},
				],
			})) {
				// the start millisecond both the event and user are in the channel
				const start = Math.max(voiceSession.createdAt.getTime(), event.createdAt.getTime());
				// end millisecond both the event and the user are in the channel
				const end = Math.min(voiceSession.endedAt?.getTime() ?? now.getTime(), event.endedAt.getTime());
				const duration = end - start;
				if (duration < 0) {
					// ???
					message += `${voiceSession.displayName} visited from ${time(voiceSession.createdAt)} to ${time(voiceSession.endedAt ?? undefined)} which was skipped.\n`;
				}
				// sum the durations for this displayName
				voiceSessions.set(voiceSession.displayName, (voiceSessions.get(voiceSession.displayName) ?? 0) + duration);
			}
			for (const name of Array.from(voiceSessions.keys()).sort()) {
				const duration = voiceSessions.get(name)!;
				// print out sorted total duration in minutes
				message += `${name}: ${Math.round(duration / 1000 / 60)}m\n`;
			}
			const components = [
				new TextDisplayBuilder().setContent(message),
			];
			(await channel.messages.fetch(event.logMessageId)).edit({ flags: MessageFlags.IsComponentsV2, components });
		}
		// if the event get activated
		if (oldGuildScheduledEvent?.status != GuildScheduledEventStatus.Active && newGuildScheduledEvent?.status == GuildScheduledEventStatus.Active) {
			const settings = await GuildSetting.findOne({guildId: newGuildScheduledEvent.guildId})
			if (!settings?.logging?.eventUpdatesChannelId) {
				console.error("eventUpdatesChannelId not set");
				return;
			}
			const channel = await client.channels.fetch(settings?.logging?.eventUpdatesChannelId);
			let messageId: string | undefined;
			if (channel?.isSendable()) {
				const components = [
					new TextDisplayBuilder().setContent(`${newGuildScheduledEvent.name} has started`),
				];
				// log that this event has started
				messageId = (await channel.send({ flags: MessageFlags.IsComponentsV2, components })).id;
			}
			ScheduledEvent.create({
				eventId: newGuildScheduledEvent.id,
				eventName: newGuildScheduledEvent.name,
				scheduledStartTime: newGuildScheduledEvent.scheduledStartAt,
				channelId: newGuildScheduledEvent.channelId,
				logMessageId: messageId,
			});
		}
	},
});
