import { Client, Events } from 'discord.js';
import { Event } from '../../Classes/index.js';

export const ready = new Event({
	name:Events.ClientReady,
	once: true,
	/**
	 * function to run on the client ready event
	 * @param client client object
	 */
	execute: (client: Client) => {
		console.log(`Ready! Logged in as ${client.user?.username}`);
	}
})
