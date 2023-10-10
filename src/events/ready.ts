import {
	Client, Event, Logger 
} from '@Client';
import { Events, VoiceBasedChannel } from 'discord.js';
import { VCChannelIDs } from 'src/structures/Constants';
import { renameOrganizing } from 'src/structures/helpers';

async function onReady(client: Client) {
	Logger.info(`Ready! Logged in as ${client.user.tag}`);

	if (!process.env.TRACKING_GUILD) {
		Logger.error('Tracking guild not set. Exiting...');
		process.exit(1);
	}

	if (!client.guilds.cache.has(process.env.TRACKING_GUILD)) {
		Logger.error('Tracking guild not found. Exiting...');
		process.exit(1);
	}

	const guild = client.guilds.cache.get(process.env.TRACKING_GUILD);
	await guild.members.fetch();
	if (!guild) {
		Logger.error('Tracking guild not found. Exiting...');
		process.exit(1);
	}

	if (VCChannelIDs.length) {
		const channels = guild.channels.cache.filter((c) => VCChannelIDs.includes(c.id) && c.isVoiceBased());
		if (!channels.size || channels.size !== VCChannelIDs.length) {
			Logger.error('One or more channels not found. Exiting...');
			process.exit(1);
		}

		for (const channel of channels.values()) {
			await renameOrganizing(channel as VoiceBasedChannel);
		}
	}

	if (!process.env.API_ENDPOINT) {
		Logger.warn('API endpoint not set at API_ENDPOINT.');
	}
	else {
		try {
			await fetch(process.env.API_ENDPOINT);
		}
		catch (e) {
			if (e.code === 'ECONNREFUSED') {
				Logger.error(`API endpoint (${process.env.API_ENDPOINT}) not reachable. Exiting...`);
				process.exit(1);
			}

			Logger.error(`API (${process.env.API_ENDPOINT}) returned an error`, e);
		}
	}
}

export default new Event().setName(Events.ClientReady).setOnce(true).setExecute(onReady);
