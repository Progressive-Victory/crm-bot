import {
	Events, GuildMember, Message, MessageReaction, User 
} from 'discord.js';
import { Event } from '../Client';
import Logger from '../structures/Logger';
import { isConnectEmoji, onConnect } from '../structures/helpers';

function proposalsChannelReaction(reaction: MessageReaction, member: GuildMember, message: Message<true>) {
	const mentionedRoles = message.mentions.roles;
	let hasRole = false;

	mentionedRoles.forEach((_r, k) => {
		if (hasRole === false && member.roles.cache.has(k)) {
			hasRole = true;
		}
	});
	if (!hasRole) {
		reaction.remove();
	}
}

async function onMessageReactionAdd(reaction: MessageReaction, user: User) {
	if (!reaction.message.inGuild()) return;
	const member = await reaction.message.guild.members.fetch(user);

	if (isConnectEmoji(reaction.emoji.name) && !reaction.message.content) {
		if (!reaction.message.author) await reaction.message.fetch();
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

		await onConnect(
			reaction.message.author.id,
			reaction.message.author.tag,
			otherUser.id,
			otherUser.tag,
			reaction.message.guildId,
			reaction.message.channelId,
			path
		);

		setTimeout(async () => {
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
				Logger.debug(`Connected ${otherUser.tag} (${otherUser.id})`);
			}
			catch (e) {
				Logger.error(`Failed to connect ${otherUser.tag} (${otherUser.id})`, e);
			}
		}, 1000 * 60 * 60 * 24);
	}
	if (reaction.message.channelId === process.env.PROPOSALS_CHANNEL_ID) {
		proposalsChannelReaction(reaction, member, reaction.message);
	}
}

export default new Event().setName(Events.MessageReactionAdd).setExecute(onMessageReactionAdd);
