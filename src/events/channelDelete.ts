import { Event, Logger } from '@Client';
import {
	AttachmentBuilder, ChannelType, DMChannel, Events, GuildChannel, TextBasedChannel, TextChannel, VoiceChannel 
} from 'discord.js';
import { printChannel } from 'src/structures/print-channel';

const parentId = process.env.EVENT_CATEGORY_ID;
const eventLogId = process.env.EVENT_LOG_CHANNEL_ID;

async function execute(channel: DMChannel | GuildChannel) {
	if (channel.isDMBased()) return;
	const files: AttachmentBuilder[] = [];
	const {
		type, guild, id 
	} = channel;

	if (type === ChannelType.GuildText && channel.parentId === parentId) {
		const textChannel = channel as TextChannel;
		const event = guild.scheduledEvents.cache.find((_e, k) => k === textChannel.topic.split(':')[1]);
		files.push(await printChannel(channel as TextChannel));
		try {
			if (event && event.channel) {
				files.push(await printChannel(event.channel as VoiceChannel));
				event.channel.delete('Event channel deleted');
			}
		}
		catch (error) {
			Logger.error(error, 'Event was Deleted');
		}
	}
	if (type === ChannelType.GuildVoice && channel.parentId === parentId) {
		const event = guild.scheduledEvents.cache.find((e) => e.channelId === id);
		files.push(await printChannel(channel as VoiceChannel));
		if (event) {
			const textChannel = guild.channels.cache.find(
				(c) => c.parentId === parentId && c.type === ChannelType.GuildText && (c as TextChannel).topic.split(':')[1] === event.id
			);
			if (textChannel) {
				files.push(await printChannel(textChannel as TextChannel));
				textChannel.delete('Event Deleted');
			}
		}
	}
	if (files) {
		const eventLogChannel = guild.channels.cache.find(
			(c, k) => k === eventLogId && (c.type === ChannelType.GuildText || c.type === ChannelType.PublicThread)
		) as TextBasedChannel;
		eventLogChannel.send({});
	}
}

export default new Event().setName(Events.ChannelDelete).setExecute(execute);
