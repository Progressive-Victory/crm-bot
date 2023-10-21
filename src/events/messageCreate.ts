import { sentMessages } from '@util/Database';
import { Event, Logger } from 'discord-client';
import { Events, Message } from 'discord.js';

async function onMessageCreate(message: Message) {
	if (message.author.bot) return null;

	if (message.inGuild() && message.guildId === process.env.TRACKING_GUILD) {
		if (!message.author) await message.fetch();

		await sentMessages.newFromMessage(message);
		Logger.debug(`Incremented ${message.author.id}'s message count in ${message.guild.id} in ${message.channelId}.`);
	}

	if (!message.partial && !message.content?.length) return null;

	return null;
}

export default new Event().setName(Events.MessageCreate).setExecute(onMessageCreate);
