import { Event, Logger } from '@Client';
import { EventsDB } from '@util/Database';
import { channelMessagesToAttachmentBuilder } from '@util/channel';
import {
	AttachmentBuilder, ChannelType, Events, GuildScheduledEvent, GuildScheduledEventStatus, TextBasedChannel, TextChannel 
} from 'discord.js';

const parentId = process.env.EVENT_CATEGORY_ID;
const eventLogId = process.env.EVENT_LOG_CHANNEL_ID;

async function execute(oldGuildScheduledEvent: GuildScheduledEvent, newGuildScheduledEvent: GuildScheduledEvent) {
	const {
		guild, channel, status, name, id 
	} = newGuildScheduledEvent;
	await channel.fetch();
	const textChannel = guild.channels.cache.find(
		(c) => c.parentId === parentId && c.type === ChannelType.GuildText && (c as TextChannel).topic.split(':')[1] === id
	);

	const files: AttachmentBuilder[] = [];

	const eventLogChannel = guild.channels.cache.find(
		(c, k) => k === eventLogId && (c.type === ChannelType.GuildText || c.type === ChannelType.PublicThread)
	) as TextBasedChannel;
	switch (status) {
	case GuildScheduledEventStatus.Completed:
	case GuildScheduledEventStatus.Canceled:
		if (textChannel) {
			files.push(await channelMessagesToAttachmentBuilder(textChannel as TextChannel));
			await textChannel.delete('Event Complete');
		}
		if (channel.parentId === parentId) {
			files.push(await channelMessagesToAttachmentBuilder(channel));
			await channel.delete('Event Complete');
		}
		break;
	case GuildScheduledEventStatus.Scheduled:
	case GuildScheduledEventStatus.Active:
		if (textChannel) {
			await textChannel.setName(name);
		}
		if (channel.parentId === parentId) {
			await channel.setName(name);
		}
		break;
	default:
		break;
	}
	if (files && status === GuildScheduledEventStatus.Completed) {
		await eventLogChannel.send({
			content: `Log for messages sent during event: ${name}`,
			files
		});
	}
	await EventsDB.findOneAndUpdate(
		{ eventID: newGuildScheduledEvent.id },
		{
			name: newGuildScheduledEvent.name,
			description: newGuildScheduledEvent.description,
			status: newGuildScheduledEvent.status,
			vcID: newGuildScheduledEvent.channelId
		},
		{ upsert: true }
	);
	Logger.debug('Event has been updated');
}

export default new Event().setName(Events.GuildScheduledEventUpdate).setExecute(execute);
