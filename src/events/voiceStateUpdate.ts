import { Events, VoiceState } from 'discord.js';
import { renameOrganizing } from '../structures/helpers';
import Logger from '../structures/Logger';
import Database from '../structures/Database';
import { Event } from '../Client';

async function onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
	if (newState.guild.id === process.env.TRACKING_GUILD) {
		if (!oldState.channel && newState.channel) {
			await Database.addVCJoin(newState.member.id, newState.guild.id, newState.channel.id);
			Logger.debug(`Added ${newState.member.id} to the VC join database.`);
		}
		else if (oldState.channel && !newState.channel) {
			await Database.addVCLeave(newState.member.id, newState.guild.id, oldState.channel.id);
			Logger.debug(`Added ${newState.member.id} to the VC leave database.`);
		}

		await renameOrganizing(newState.channel || oldState.channel);
	}
}

export default new Event().setName(Events.VoiceStateUpdate).setExecute(onVoiceStateUpdate);
