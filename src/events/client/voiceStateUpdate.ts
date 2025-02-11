import { Events, VoiceState } from 'discord.js';
import { Event } from '../../Classes/index.js';

export default new Event({
	name: Events.VoiceStateUpdate,
	execute: (oldState: VoiceState, newState: VoiceState) => {
		if (oldState.channelId != newState.channelId) {
			if (oldState.channelId) {
				console.log(`${oldState.member?.user.username} left ${oldState.channel?.name}`);
			}
			if (newState.channelId) {
				console.log(`${oldState.member?.user.username} joined ${newState.channel?.name}`);
			}
		}
	},
});
