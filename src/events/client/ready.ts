import { Events } from 'discord.js';
import { Client, Event } from '../../Classes/index.js';

/**
 * fuction to run on the client ready event
 * @param client client object
 */
async function onReady(client: Client) {
	console.log(`Ready! Logged in as ${client.user.tag}`);
}

export default new Event()
	.setName(Events.ClientReady)
	.setOnce(true)
	.setExecute(onReady);
