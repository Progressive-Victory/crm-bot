import { Events } from 'discord.js';
import { Event } from '../../Classes/index.js';

export const warn = new Event({
	name: Events.Warn,
	execute: (info: string) => console.warn(info)
});
