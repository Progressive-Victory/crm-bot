import { logger } from 'discord-client';
import {
	EmojiResolvable, Message, MessageReaction, Snowflake, User 
} from 'discord.js';
import { Routes } from './routes';

const {
	API_ENDPOINT, API_AUTH, TRACKING_GUILD, TRACKING_CHANNEL, VERIFY_EMOJI, CONNECT_EMOJI, LINKED_EMOJI, REFUSED_EMOJI 
} = process.env;

export async function onConnect(message: Message, reaction: MessageReaction, user: User, path: string) {
	const { author, guildId } = message;

	const response = await fetch(`${API_ENDPOINT}${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: API_AUTH
		},
		body: JSON.stringify({
			discordUserID: user.id,
			discordGuildID: guildId,
			discordHandle: user.tag,
			searchDiscordUserID: author.id,
			searchDiscordHandle: author.tag
		})
	});

	if (!response.ok) {
		throw Error(`Failed to ${path} user ${author.id} in guild ${guildId}: ${response.statusText}`);
	}
}

export async function checkConnected(discordUserID: Snowflake | Snowflake[], discordGuildID: Snowflake) {
	if (discordGuildID !== TRACKING_GUILD) {
		return Promise.resolve(false);
	}
	if (typeof discordUserID === 'string') {
		const r = await fetch(`${API_ENDPOINT}/users/${discordUserID}`, { headers: { Authorization: API_AUTH } });
		return r.ok ? r.json() : null;
	}

	const r1 = await fetch(`${API_ENDPOINT}/users`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: API_AUTH
		},
		body: JSON.stringify(discordUserID)
	});

	return r1.json();
}

export function isConnectEmoji(emoji: EmojiResolvable) {
	let emojiString: string;

	if (typeof emoji === 'string') emojiString = emoji;
	else emojiString = emoji.name;

	return [VERIFY_EMOJI, CONNECT_EMOJI, LINKED_EMOJI, REFUSED_EMOJI].includes(emojiString);
}

export async function onConnectMessageReaction(reaction: MessageReaction, user: User) {
	const { emoji, message } = reaction;
	const {
		author, guildId, channelId, content 
	} = message;
	if (message.inGuild() && guildId === TRACKING_GUILD && channelId === TRACKING_CHANNEL && isConnectEmoji(emoji) && !content) {
		if (!author) await message.fetch();
		await user.fetch();

		let path: string;

		switch (emoji.name) {
		case process.env.CONNECT_EMOJI:
			path = Routes.connect();
			break;
		case process.env.VERIFY_EMOJI:
			path = Routes.verify();
			break;
		case process.env.LINKED_EMOJI:
			path = Routes.linked();
			break;
		case process.env.REFUSED_EMOJI:
			path = Routes.refused();
			break;
		default:
			throw Error('Unknown path');
		}

		await onConnect(message, reaction, user, path);

		setTimeout(
			async () => {
				await message.fetch();
				if (message.reactions.cache.has(CONNECT_EMOJI)) {
					return;
				}
				try {
					await onConnect(message, reaction, user, path);
					logger.debug(`Connected ${user.tag} (${user.id})`);
				}
				catch (e) {
					logger.error(`Failed to connect ${user.tag} (${user.id})`, e);
				}
			},
			1000 * 60 * 60 * 24
		);
	}
}
