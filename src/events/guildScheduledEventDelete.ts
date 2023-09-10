import { Event, Logger } from '@Client';
import {
	ChannelType, Events, GuildScheduledEvent, TextChannel 
} from 'discord.js';

async function execute(guildScheduledEvent: GuildScheduledEvent) {
	const parentId = process.env.EVENT_CATEGORY_ID;
	const eventTextChannel = guildScheduledEvent.guild.channels.cache.find(
		(c) => c.parentId === parentId && c.type === ChannelType.GuildText && (c as TextChannel).topic.split(':')[1] === guildScheduledEvent.id
	);
	try {
		if (eventTextChannel) {
			eventTextChannel.delete('Event Deleted');
		}
		if (guildScheduledEvent.channel.parentId === parentId) {
			guildScheduledEvent.channel.delete('Event Deleted');
		}
	}
	catch (error) {
		Logger.error(error);
	}
}

export default new Event().setName(Events.GuildScheduledEventDelete).setExecute(execute);
