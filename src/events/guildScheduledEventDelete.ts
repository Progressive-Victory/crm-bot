import { channelMessagesToAttachmentBuilder } from '@util/channel';
import { EventsDB } from '@util/database';
import { Event, logger } from 'discord-client';
import {
	AttachmentBuilder, ChannelType, Events, GuildScheduledEvent, PublicThreadChannel, TextBasedChannel, TextChannel 
} from 'discord.js';

const eventID = process.env.EVENT_CATEGORY_ID;
const eventLogID = process.env.EVENT_LOG_CHANNEL_ID;

async function execute(guildScheduledEvent: GuildScheduledEvent) {
	const {
		guild, channel, id, status 
	} = guildScheduledEvent;
	const eventTextChannel = guild.channels.cache.find(
		(c) => c.parentId === eventID && c.type === ChannelType.GuildText && (c as TextChannel).topic.split(':')[1] === id
	);

	const eventLogChannel = guild.channels.cache.find(
		(c, k) => k === eventLogID && (c.type === ChannelType.GuildText || c.type === ChannelType.PublicThread)
	) as TextBasedChannel;
	const files: AttachmentBuilder[] = [];

	if (eventLogChannel) {
		if (eventTextChannel && channel.parentId === eventID) {
			files.push(
				await channelMessagesToAttachmentBuilder(eventTextChannel as TextChannel | PublicThreadChannel),
				await channelMessagesToAttachmentBuilder(channel)
			);
			await Promise.all([eventTextChannel.delete('Event Deleted'), channel.delete('Event Deleted')]);
		}

		if (files.filter((e) => !!e).length) {
			await eventLogChannel.send({
				content: `Logs for channel **${eventTextChannel.name}**`,
				files: files.filter((e) => !!e)
			});
		}
	}

	await EventsDB.findOneAndDelete({ eventID: id });
	logger.debug(status, 'Event has been Canceled and deleted from DB');
}

export default new Event().setName(Events.GuildScheduledEventDelete).setExecute(execute);
