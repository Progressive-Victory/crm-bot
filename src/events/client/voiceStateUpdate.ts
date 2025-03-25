import { Events, VoiceState } from 'discord.js';
import { Event } from '../../Classes/index.js';
import { VoiceSession } from '../../features/attendence/index.js';
import dbConnect from "../../util/libmongo.js";

export default new Event({
	name: Events.VoiceStateUpdate,
	execute: async (oldState: VoiceState, newState: VoiceState) => {
		if (oldState.channelId != newState.channelId) {
			await dbConnect();
			if (oldState.channelId) {
				const now = new Date();
				for await (const e of VoiceSession.find({userId: oldState.member?.id, endedAt: null})) {
					e.endedAt = now;
					e.save();
				}
			}
			if (newState.channelId) {
				new VoiceSession({
					userId: newState.member?.id,
					displayName: newState.member?.displayName,
				}).save();
			}
		}
	},
});
