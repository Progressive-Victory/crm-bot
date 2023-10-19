import { Event, Logger } from '@Client';
import { sentMessages } from '@util/Database';
import { Events, Message } from 'discord.js';

async function onMessageCreate(message: Message) {
	if (message.author.bot) return null;

	if (message.inGuild() && message.guildId === process.env.TRACKING_GUILD) {
		if (!message.author) await message.fetch();

		Logger.debug(`Incremented ${message.author.id}'s message count in ${message.guild.id} in ${message.channelId}.`);
		await sentMessages.newFromMessage(message);
	}

	if (!message.partial && !message.content?.length) return null;

	return null;
}

export default new Event().setName(Events.MessageCreate).setExecute(onMessageCreate);
