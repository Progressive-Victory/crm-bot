import { Snowflake } from 'discord.js';
import { Routes } from './routes';

const {
	API_ENDPOINT, API_AUTH, TRACKING_GUILD 
} = process.env;

export async function onJoin(discordUserID: Snowflake, discordHandle: string, discordGuildID: Snowflake) {
	if (discordGuildID !== TRACKING_GUILD) return;

	const response = await fetch(`${API_ENDPOINT}${Routes.join()}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: API_AUTH
		},
		body: JSON.stringify({
			discordUserID,
			discordGuildID,
			discordHandle
		})
	});

	if (!response.ok) {
		throw Error(`Failed to join user ${discordUserID} in guild ${discordGuildID}: ${response.statusText}`);
	}
}

export { checkConnected, onConnectMessageReaction } from './connect';
