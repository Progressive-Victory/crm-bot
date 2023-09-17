import { Event, Logger } from '@Client';
import {
	ChannelType, DMChannel, Events, GuildChannel, TextChannel 
} from 'discord.js';

const parentId = process.env.EVENT_CATEGORY_ID;

async function execute(channel: DMChannel | GuildChannel) {
	if (channel.isDMBased()) return;
	const {
		type, guild, id 
	} = channel;

	if (type === ChannelType.GuildText && channel.parentId === parentId) {
		const textChannel = channel as TextChannel;
		const event = guild.scheduledEvents.cache.find((_e, k) => k === textChannel.topic.split(':')[1]);
		try {
			if (event && event.channel) {
				event.channel.delete('Event channel deleted');
			}
		}
		catch (error) {
			Logger.error(error, 'Event was Deleted');
		}
	}
	if (type === ChannelType.GuildVoice && channel.parentId === parentId) {
		const event = guild.scheduledEvents.cache.find((e) => e.channelId === id);
		if (event) {
			const textChannel = guild.channels.cache.find(
				(c) => c.parentId === parentId && c.type === ChannelType.GuildText && (c as TextChannel).topic.split(':')[1] === event.id
			);
			if (textChannel) {
				textChannel.delete('Event Deleted');
			}
		}
	}
}

export default new Event().setName(Events.ChannelDelete).setExecute(execute);
