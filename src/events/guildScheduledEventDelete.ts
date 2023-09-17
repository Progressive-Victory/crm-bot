import { Event, Logger } from '@Client';
import {
	AttachmentBuilder, ChannelType, Events, GuildScheduledEvent, TextBasedChannel, TextChannel, VoiceChannel 
} from 'discord.js';
import { printChannel } from 'src/structures/print-channel';

const parentId = process.env.EVENT_CATEGORY_ID;
const eventLogId = process.env.EVENT_LOG_CHANNEL_ID;

async function execute(guildScheduledEvent: GuildScheduledEvent) {
	const eventTextChannel = guildScheduledEvent.guild.channels.cache.find(
		(c) => c.parentId === parentId && c.type === ChannelType.GuildText && (c as TextChannel).topic.split(':')[1] === guildScheduledEvent.id
	);

	const eventLogChannel = guildScheduledEvent.guild.channels.cache.find(
		(c, k) => k === eventLogId && (c.type === ChannelType.GuildText || c.type === ChannelType.PublicThread)
	) as TextBasedChannel;
	const files: AttachmentBuilder[] = [];
	try {
		if (eventTextChannel) {
			files.push(await printChannel(eventTextChannel as TextChannel));
			eventTextChannel.delete('Event Deleted');
		}
		if (guildScheduledEvent.channel.parentId === parentId) {
			files.push(await printChannel(guildScheduledEvent.channel as VoiceChannel));
			guildScheduledEvent.channel.delete('Event Deleted');
		}
		if (files) {
			eventLogChannel.send({
				content: 'Log for meesages sent during event',
				files
			});
		}
	}
	catch (error) {
		Logger.error(error);
	}
}

export default new Event().setName(Events.GuildScheduledEventDelete).setExecute(execute);
