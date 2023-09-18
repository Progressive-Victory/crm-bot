import { Event } from '@Client';
import { channelMessgesToAttachmentBuilder } from '@util/channel';
import {
	AttachmentBuilder,
	ChannelType,
	Events,
	GuildScheduledEvent,
	GuildScheduledEventStatus,
	PublicThreadChannel,
	TextBasedChannel,
	TextChannel
} from 'discord.js';

const parentId = process.env.EVENT_CATEGORY_ID;
const eventLogId = process.env.EVENT_LOG_CHANNEL_ID;

async function execute(guildScheduledEvent: GuildScheduledEvent) {
	const {
		guild, channel, id 
	} = guildScheduledEvent;
	const eventTextChannel = guild.channels.cache.find(
		(c) => c.parentId === parentId && c.type === ChannelType.GuildText && (c as TextChannel).topic.split(':')[1] === id
	);

	const eventLogChannel = guild.channels.cache.find(
		(c, k) => k === eventLogId && (c.type === ChannelType.GuildText || c.type === ChannelType.PublicThread)
	) as TextBasedChannel;
	const files: AttachmentBuilder[] = [];

	if (eventTextChannel && channel.parentId === parentId && channel.type === ChannelType.GuildVoice) {
		files.push(
			await channelMessgesToAttachmentBuilder(eventTextChannel as TextChannel | PublicThreadChannel),
			await channelMessgesToAttachmentBuilder(channel)
		);
		await Promise.all([eventTextChannel.delete('Event Deleted'), channel.delete('Event Deleted')]);
	}
	if (files && guildScheduledEvent.status === GuildScheduledEventStatus.Canceled) {
		await eventLogChannel.send({
			content: 'Log of messages',
			files
		});
	}
}

export default new Event().setName(Events.GuildScheduledEventDelete).setExecute(execute);
