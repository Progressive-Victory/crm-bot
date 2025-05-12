import { Events } from 'discord.js';
import { Event } from '../../Classes/index.js';

export const debug = new Event({
	name: Events.Debug,
	execute: async (info) => {
		if(info.startsWith('[WS => ') || info.startsWith('[object'))
			return;
		console.debug(info);
	}
});
