import { Event } from 'Classes/index.js';
import { Events } from 'discord.js';
import { logger } from 'logger.js';

export default new Event({
	name: Events.Warn,
	execute: async (m) => logger.warn(m)
});
