import { Events, VoiceState } from 'discord.js';
import { Event } from '../../Classes/index.js';
import { VoiceSession } from '../../features/attendance/index.js';
import dbConnect from "../../util/libmongo.js";

/** Records when people enter and leave channels */
export default new Event({
	name: Events.VoiceStateUpdate,
	execute: async (oldState: VoiceState, newState: VoiceState) => {
		// if the user changes channel
		if (oldState.channelId != newState.channelId) {
			await dbConnect();
			// if the user left a channel
			if (oldState.channelId) {
				const now = new Date();
				// mark all older objects as ended
				for await (const e of VoiceSession.find({userId: oldState.member!.id, endedAt: null})) {
					e.endedAt = now;
					e.save();
				}
			}
			// if the user entered a channel
			if (newState.channelId) {
				new VoiceSession({
					userId: newState.member!.id,
					displayName: newState.member?.displayName,
				}).save();
			}
		}
	},
});
