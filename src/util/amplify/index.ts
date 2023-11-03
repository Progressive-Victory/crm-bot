import { logger } from '@progressive-victory/client';
import { tempRoles } from '@util/database';
import {
	Message, MessageReaction, User 
} from 'discord.js';
import { client } from 'src/index';

const {
	AMPLIFY_ROLE_ID, AMPLIFY_EMOJI, AMPLIFY_CHANNEL_ID 
} = process.env;

/**
 * Function
 * @param message New Message
 */
export async function newAmplifyMessage(message: Message) {
	if (message.channelId === AMPLIFY_CHANNEL_ID) await message.react(AMPLIFY_EMOJI);
}

/**
 * Run function whena new reaction is added
 * @param reaction
 * @param user
 */
export async function newAmplifyMessageReaction(reaction: MessageReaction, user: User) {
	const {
		channelId, guild, author 
	} = reaction.message;
	const member = guild.members.cache.get(author.id);
	if (!user.bot && author !== user && channelId === AMPLIFY_CHANNEL_ID && reaction.emoji.name === AMPLIFY_EMOJI) {
		if (!AMPLIFY_ROLE_ID) {
			logger.error('Missing AMPLIFY_ROLE_ID');
		}
		else {
			const amplifyRole = guild.roles.cache.get(AMPLIFY_ROLE_ID);
			if (amplifyRole) {
				const botMember = await guild.members.fetch(client.user);
				if (!botMember.permissions.has('ManageRoles')) {
					logger.error('Missing MANAGE_ROLES permission');
				}
				else {
					try {
						const recordValue = {
							userID: member.id,
							guildID: guild.id,
							roleID: amplifyRole.id
						};

						const record = await tempRoles.findOne(recordValue);

						if (record) return;

						await member.roles.add(amplifyRole);

						await tempRoles.create(recordValue);
					}
					catch (e) {
						logger.error('Failed to add role', e);
					}
				}
			}
			else {
				logger.error('Amplify role not found');
			}
		}
	}
}
