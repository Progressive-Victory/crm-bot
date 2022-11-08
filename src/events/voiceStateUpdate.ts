import { VoiceState } from 'discord.js';
import Database from '../structures/Database';

export default async function onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
	if (newState.guild.id === process.env.TRACKING_GUILD) {
		if (!oldState.channel && newState.channel) {
			await Database.addVCJoin(newState.member.id, newState.guild.id, newState.channel.id);
		}
		else if (oldState.channel && !newState.channel) {
			await Database.addVCLeave(newState.member.id, newState.guild.id, oldState.channel.id);
		}
	}
}
