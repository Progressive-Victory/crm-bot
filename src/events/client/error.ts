import { Events } from 'discord.js';
import { Event } from '../../Classes/index.js';

export const error = new Event({
	name: Events.Error,
	execute: (error: Error) => console.error(error)
});
