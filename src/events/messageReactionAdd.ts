import { MessageReaction, User } from 'discord.js';
import { isConnectEmoji, onConnect } from '../structures/helpers';

export default async function onMessageReactionAdd(reaction: MessageReaction, user: User) {
	if (reaction.message.inGuild() && isConnectEmoji(reaction.emoji.name) && !reaction.message.content) {
		if (!reaction.message.author) await reaction.message.fetch();
		const users = await reaction.users.fetch();
		const otherUser = users.find(u => u.id !== user.id) || user;

		let path: string;
		switch (reaction.emoji.name) {
			case process.env.CONNECT_EMOJI:
				path = 'connect'
				break;
			case process.env.VERIFY_EMOJI:
				path = 'verify'
				break;
			case process.env.LINKED_EMOJI:
				path = 'linked'
				break;
			case process.env.REFUSED_EMOJI:
				path = 'refused'
				break;
		}

		await onConnect(reaction.message.author.id, reaction.message.author.tag, otherUser.id, otherUser.tag, reaction.message.guildId, reaction.message.channelId, path);
	}
}
