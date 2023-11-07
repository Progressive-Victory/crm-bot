import { Event, logger } from '@progressive-victory/client';
import { newAmplifyMessage } from '@util/amplify';
import { sentMessages } from '@util/database';
import { Events, Message } from 'discord.js';

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
