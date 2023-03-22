import {
	Collection, Snowflake, VoiceBasedChannel, VoiceState
} from 'discord.js';
import Logger from '../structures/Logger';
import Database from '../structures/Database';

const orgchannels = process.env.STATE_LEAD_RENAMEABLE_CHANNELIDS.split(', ');
const VCChannels = new Collection<Snowflake, string>()
	.set(orgchannels[0], 'Organizing VC 1')
	.set(orgchannels[1], 'Organizing VC 2')
	.set(orgchannels[2], 'Organizing VC 3');
async function renameOrganizing(channel:VoiceBasedChannel) {
	if (VCChannels.has(channel.id) && channel.members.size === 0) {
		channel.setName(VCChannels.find((id) => id === channel.id)).catch((err) => console.error(err));
	}
}

export default async function onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
	if (newState.guild.id === process.env.TRACKING_GUILD) {
		if (!oldState.channel && newState.channel) {
			await Database.addVCJoin(newState.member.id, newState.guild.id, newState.channel.id);
			Logger.debug(`Added ${newState.member.id} to the VC join database.`);
		}
		else if (oldState.channel && !newState.channel) {
			await Database.addVCLeave(newState.member.id, newState.guild.id, oldState.channel.id);
			Logger.debug(`Added ${newState.member.id} to the VC leave database.`);
		}
	}
	renameOrganizing(newState.channel);
}
