import { Events, VoiceState } from 'discord.js';
import { Event } from '../Classes/index.js';
import { VoiceSession } from '../features/attendance/index.js';

export default new Event({
	name: Events.VoiceStateUpdate,
	execute: async (oldState: VoiceState, newState: VoiceState) => {
		if (oldState.channelId != newState.channelId) {
			if (oldState.channelId) {
				const now = new Date();
				for await (const e of VoiceSession.find({userId: oldState.member?.id, endedAt: null})) {
					e.endedAt = now;
					e.save();
				}
			}
			if (newState.channelId) {
				VoiceSession.create({
					userId: newState.member?.id,
					displayName: newState.member?.displayName,
				})
			}
		}
	},
});
