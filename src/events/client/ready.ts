import { Client, Events } from 'discord.js';
import { Event } from '../../Classes/index.js';

/**
 * function to run on the client ready event
 * @param client client object
 */
async function onReady(client: Client<true>) {
	console.log(`Ready! Logged in as ${client.user.tag}`);
}

export default new Event<Events.ClientReady>()
	.setName(Events.ClientReady)
	.setOnce(true)
	.setExecute(onReady);
