import 'source-map-support/register';

import { config } from 'dotenv';
import path from 'path';

import './i18n.js';
import prototypes from './structures/prototypes';
import ExtendedClient from './structures/Client';
import Logger from './structures/Logger';

// We need to call the prototypes file before any discord.js structures get imported
/* eslint-disable import/order */
// @ts-ignore
import {
	DiscordjsError,
	GatewayIntentBits as Intents,
	Partials
} from 'discord.js';
/* eslint-enable import/order */

// Load .env file contents
config();
prototypes();

// Initialization (specify intents and partials)
const client = new ExtendedClient({
	intents: [
		Intents.Guilds,
		Intents.GuildMessages,
		Intents.GuildVoiceStates,
		Intents.MessageContent,
		Intents.GuildMembers,
		Intents.GuildModeration
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction,
		Partials.GuildMember
	],
	eventsPath: path.join(__dirname, 'events'),
	commandPath: path.join(__dirname, 'commands'),
	contextMenuPath: path.join(__dirname, 'context_menus'),
	buttonPath: path.join(__dirname, 'interactions', 'buttons'),
	selectMenuPath: path.join(__dirname, 'interactions', 'select_menus'),
	modalPath: path.join(__dirname, 'interactions', 'modals'),
	restVersion: '10',
	receiveMessageComponents: true,
	receiveModals: true,
	receiveAutocomplete: true,
	replyOnError: true,
	splitCustomID: true,
	splitCustomIDOn: '_',
	useGuildCommands: false
});

client.init().then(() => {
	client.login(process.env.TOKEN).catch((err: unknown) => {
		if (err instanceof DiscordjsError) {
			if (err.code === 'TokenMissing') {
				Logger.warn(
					`${err.name}: ${err.message} Did you create a .env file?\n`
				);
			}
			else if (err.code === 'TokenInvalid') {
				Logger.warn(
					`${err.name}: ${err.message} Check your .env file\n`
				);
			}
			else throw err;
		}
		else {
			throw err;
		}
	});
});
