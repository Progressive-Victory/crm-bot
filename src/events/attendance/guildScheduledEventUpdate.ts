import { Events, GuildScheduledEventStatus } from 'discord.js';
import { Event } from '../../Classes/index.js';
import { ScheduledEvent, VoiceSession } from '../../models/attendance/index.js';
import dbConnect from "../../util/libmongo.js";

const { LOG_CHANNEL } = process.env;
if (!LOG_CHANNEL) throw new Error("LOG_CHANNEL not set");

/** Records when scheduled events start and stop */
export const guildScheduledEventUpdate = new Event({
	name: Events.GuildScheduledEventUpdate,
	execute: async (oldGuildScheduledEvent, newGuildScheduledEvent) => {
		const { client } = newGuildScheduledEvent;
		await dbConnect();
		// if the event goes from active to something else
		if (oldGuildScheduledEvent?.status == GuildScheduledEventStatus.Active && newGuildScheduledEvent?.status != GuildScheduledEventStatus.Active) {
			const channel = await client.channels.fetch(LOG_CHANNEL);
			const now = new Date();
			// mark older objects as ended (there should only be one)
			for await (const event of ScheduledEvent.find({eventId: oldGuildScheduledEvent.id, endedAt: null})) {
				event.endedAt = now;
				event.save();
				if (channel?.isSendable() && event.logMessage) {
					let message = `\
\`${newGuildScheduledEvent.name}\` ended
<t:${Math.round(event.createdAt.getTime()/1000)}> to <t:${Math.round(event.endedAt.getTime()/1000)}> (${Math.round((event.endedAt.getTime() - event.createdAt.getTime())/1000/60)}m)
Attended by:
`;
					const voiceSessions = new Map<string, number>();
					// for every voice session 
					for await (const voiceSession of VoiceSession.find({
						channelId: newGuildScheduledEvent.channelId,
						$or: [
							{
								createdAt: {$gte: event.endedAt},
								endedAt: {$lte: event.createdAt},
							},
							{
								endedAt: null,
							},
						],
					})) {
						const start = Math.max(voiceSession.createdAt.getTime(), event.createdAt.getTime());
						const end = Math.min(voiceSession.endedAt?.getTime() ?? now.getTime(), event.endedAt.getTime());
						const duration = end - start;
						if (duration <= 0) continue;
						voiceSessions.set(voiceSession.displayName, (voiceSessions.get(voiceSession.displayName) ?? 0) + duration);
					}
					for (const name of Array.from(voiceSessions.keys()).sort()) {
						const duration = voiceSessions.get(name)!;
						message += `${name}: ${Math.round(duration/1000/60)}m\n`;
					}
					(await channel.messages.fetch(event.logMessage)).edit(message);
				}
			}
		}
		// if the event get activated
		if (oldGuildScheduledEvent?.status != GuildScheduledEventStatus.Active && newGuildScheduledEvent?.status == GuildScheduledEventStatus.Active) {
			const channel = await client.channels.fetch(LOG_CHANNEL);
			let message: string | undefined;
			if (channel?.isSendable()) message = (await channel.send(`${newGuildScheduledEvent.name} has started`)).id;
			new ScheduledEvent({
				eventId: newGuildScheduledEvent.id,
				eventName: newGuildScheduledEvent.name,
				logMessage: message,
			}).save();
		}
	},
});
