import { Client, Event } from 'Classes/index.js';
import { Events } from 'discord.js';
import { logger } from 'logger.js';

/**
 * fuction to run on the client ready event
 * @param client client object
 */
async function onReady(client: Client) {
	logger.log(`Ready! Logged in as ${client.user.tag}`);
}

export default new Event()
	.setName(Events.ClientReady)
	.setOnce(true)
	.setExecute(onReady);
