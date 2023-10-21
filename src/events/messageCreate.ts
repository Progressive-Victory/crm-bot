import { sentMessages } from '@util/Database';
import { Event, logger } from 'discord-client';
import { Events, Message } from 'discord.js';
import { newAmplifyMessage } from 'src/features/amplify';

async function onMessageCreate(message: Message) {
	if (message.author.bot) return;

	if (message.inGuild() && message.guildId === process.env.TRACKING_GUILD) {
		if (!message.author) await message.fetch();

		await sentMessages.newFromMessage(message);
		logger.debug(`Incremented ${message.author.id}'s message count in ${message.guild.id} in ${message.channelId}.`);
	}

	await newAmplifyMessage(message);
}

export default new Event().setName(Events.MessageCreate).setExecute(onMessageCreate);
