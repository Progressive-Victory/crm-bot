import {
	Guild, Message, TextBasedChannel, User 
} from 'discord.js';
import { FilterQuery } from 'mongoose';
import { ISentMessages, sentMessages } from './Schema';

export const messages = {
	new(message: Message<true>) {
		return sentMessages.findOneAndUpdate(
			{
				userID: message.author.id,
				guildID: message.guildId,
				channelID: message.channelId
			},
			{ $inc: { count: 1 } },
			{ upsert: true }
		);
	},
	getMetric(guild: Guild, user?: User, channel?: TextBasedChannel) {
		const query: FilterQuery<ISentMessages> = { guildID: guild.id };
		if (user) query.userID = user.id;
		if (channel) query.channelID = channel.id;

		return sentMessages.count(query);
	}
};
