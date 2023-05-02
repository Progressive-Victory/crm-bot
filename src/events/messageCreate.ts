import { Message } from 'discord.js';
import Logger from '../structures/Logger';
import Database from '../structures/Database';

export default async function onMessageCreate(message: Message) {
	if (message.author.bot) return null;

	if (message.guildId === process.env.TRACKING_GUILD) {
		if (!message.author) await message.fetch();
		await Database.incrementMessages(
			message.author.id,
			message.guild.id,
			message.channelId
		);
		Logger.debug(
			`Incremented ${message.author.id}'s message count in ${message.guild.id} in ${message.channelId}.`
		);
	}

	if (!message.partial && !message.content?.length) return null;

	return null;
}
