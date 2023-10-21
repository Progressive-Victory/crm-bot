import { Event, logger } from 'discord-client';
import {
	Events, MessageReaction, User 
} from 'discord.js';
import { newAmplifyMessageReaction } from '../features/amplify';
import { isConnectEmoji, onConnect } from '../structures/helpers';

async function onMessageReactionAdd(reaction: MessageReaction, user: User) {
	const { message } = reaction;

	if (!message.inGuild()) return;

	const member = await message.guild.members.fetch(user);

	if (isConnectEmoji(reaction.emoji.name) && !reaction.message.content) {
		if (!message.author) await message.fetch();
		const users = await reaction.users.fetch();
		const otherUser = users.find((u) => u.id !== user.id) || user;

		let path: string;
		switch (reaction.emoji.name) {
		case process.env.CONNECT_EMOJI:
			path = 'connect';
			break;
		case process.env.VERIFY_EMOJI:
			path = 'verify';
			break;
		case process.env.LINKED_EMOJI:
			path = 'linked';
			break;
		case process.env.REFUSED_EMOJI:
			path = 'refused';
			break;
		default:
			throw Error('Unknown path');
		}

		await onConnect(message.author.id, message.author.tag, otherUser.id, otherUser.tag, message.guildId, message.channelId, path);

		setTimeout(
			async () => {
				await reaction.message.fetch();
				if (reaction.message.reactions.cache.has(process.env.CONNECT_EMOJI)) {
					return;
				}
				try {
					await onConnect(
						reaction.message.author.id,
						reaction.message.author.tag,
						otherUser.id,
						otherUser.tag,
						reaction.message.guildId,
						reaction.message.channelId,
						'timeout'
					);
					logger.debug(`Connected ${otherUser.tag} (${otherUser.id})`);
				}
				catch (e) {
					logger.error(`Failed to connect ${otherUser.tag} (${otherUser.id})`, e);
				}
			},
			1000 * 60 * 60 * 24
		);
	}

	if (message.channelId === process.env.PROPOSALS_CHANNEL_ID) {
		if (message.mentions.roles.every((r) => !member.roles.cache.has(r.id))) {
			await reaction.remove();
		}
	}
	await newAmplifyMessageReaction(reaction, user);
}

export default new Event().setName(Events.MessageReactionAdd).setExecute(onMessageReactionAdd);
