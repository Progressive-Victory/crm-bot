import { Events, VoiceBasedChannel } from 'discord.js';
import { VCChannelIDs } from '../structures/Constants';
import { renameOrganizing } from '../structures/helpers';
import CustomClient from '../structures/Client';
import Event from '../structures/Event';
import Logger from '../structures/Logger';

async function onReady(this: CustomClient) {
	Logger.info(`Ready! Logged in as ${this.user.tag}`);

	if (!process.env.TRACKING_GUILD) {
		Logger.error('Tracking guild not set. Exiting...');
		process.exit(1);
	}

	if (!this.guilds.cache.has(process.env.TRACKING_GUILD)) {
		Logger.error('Tracking guild not found. Exiting...');
		process.exit(1);
	}

	const guild = this.guilds.cache.get(process.env.TRACKING_GUILD);
	if (!guild) {
		Logger.error('Tracking guild not found. Exiting...');
		process.exit(1);
	}

	if (VCChannelIDs.length) {
		const channels = guild.channels.cache.filter(
			(c) => VCChannelIDs.includes(c.id) && c.isVoiceBased()
		);
		if (!channels.size || channels.size !== VCChannelIDs.length) {
			Logger.error('One or more channels not found. Exiting...');
			process.exit(1);
		}

		for (const channel of channels.values()) {
			await renameOrganizing(channel as VoiceBasedChannel);
		}
	}
}

export default new Event()
	.setName(Events.MessageReactionAdd)
	.setOnce(true)
	.setExecute(onReady);
