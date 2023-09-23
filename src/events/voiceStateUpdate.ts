import { Event, Logger } from '@Client';
import { vc } from '@util/Database';
import { Events, VoiceState } from 'discord.js';
import { renameOrganizing } from 'src/structures/helpers';

async function onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
	if (newState.guild.id === process.env.TRACKING_GUILD) {
		if (!oldState.channel && newState.channel) {
			await vc.join(newState.member, newState.channel);
			Logger.debug(`Added ${newState.member.id} to the VC join database.`);
		}
		else if (oldState.channel && !newState.channel) {
			await vc.leave(newState.member, oldState.channel);
			Logger.debug(`Added ${newState.member.id} to the VC leave database.`);
		}

		await renameOrganizing(newState.channel || oldState.channel);
	}
}

export default new Event().setName(Events.VoiceStateUpdate).setExecute(onVoiceStateUpdate);
