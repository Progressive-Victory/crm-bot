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
				VoiceSession.updateMany({ userId: oldState.member?.id, endedAt: null }, { endedAt: new Date() }).exec();
			}
			// if the user entered a channel
			if (newState.channelId) {
				VoiceSession.create({
					channelId: newState.channelId,
					userId: newState.member?.id,
					displayName: newState.member?.displayName,
				});
			}
		}
	},
});
