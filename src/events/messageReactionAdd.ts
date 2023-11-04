import { newAmplifyMessageReaction } from '@util/amplify';
import { onConnectMessageReaction } from '@util/backend';
import {
	Events, MessageReaction, User 
} from 'discord.js';

import { Event } from '@progressive-victory/client';

const { PROPOSALS_CHANNEL_ID } = process.env;

async function onMessageReactionAdd(reaction: MessageReaction, user: User) {
	const { message } = reaction;

	const member = message.guild.members.cache.get(user.id);

	if (message.channelId === PROPOSALS_CHANNEL_ID) {
		if (message.mentions.roles.every((r) => !member.roles.cache.has(r.id))) {
			await reaction.remove();
		}
	}
	await Promise.all([newAmplifyMessageReaction(reaction, user), onConnectMessageReaction(reaction, user)]);
}

export default new Event().setName(Events.MessageReactionAdd).setExecute(onMessageReactionAdd);
