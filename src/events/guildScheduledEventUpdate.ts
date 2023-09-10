import { Event } from '@Client';
import {
	ChannelType, Events, GuildScheduledEvent, TextChannel 
} from 'discord.js';

async function execute(oldGuildScheduledEvent: GuildScheduledEvent, newGuildScheduledEvent: GuildScheduledEvent) {
	const parentId = process.env.EVENT_CATEGORY_ID;
	const textChannel = newGuildScheduledEvent.guild.channels.cache.find(
		(c) => c.parentId === parentId && c.type === ChannelType.GuildText && (c as TextChannel).topic.split(':')[1] === newGuildScheduledEvent.id
	);
	if (textChannel) {
		textChannel.setName(newGuildScheduledEvent.name);
	}
	if (newGuildScheduledEvent.channel.parentId === parentId) {
		newGuildScheduledEvent.channel.setName(newGuildScheduledEvent.name);
	}
}

export default new Event().setName(Events.GuildScheduledEventUpdate).setExecute(execute);
