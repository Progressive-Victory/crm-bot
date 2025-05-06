import { Events } from 'discord.js';
import { Event } from '../../Classes/index.js';
import { VoiceSession } from '../../models/attendance/index.js';
import dbConnect from "../../util/libmongo.js";

/** Records when people enter and leave channels */
export const voiceStateUpdate = new Event({
	name: Events.VoiceStateUpdate,
	execute: async (oldState, newState) => {
		// if the user changes channel
		if (oldState.channelId != newState.channelId) {
			await dbConnect();
			// if the user left a channel
			if (oldState.channelId) {
				const now = new Date();
				// mark all older objects as ended
				for await (const e of VoiceSession.find({userId: oldState.member?.id, endedAt: null})) {
					e.endedAt = now;
					e.save();
				}
			}
			// if the user entered a channel
			if (newState.channelId) {
				new VoiceSession({
					channelId: newState.channelId,
					userId: newState.member?.id,
					displayName: newState.member?.displayName,
				}).save();
			}
		}
	},
});
