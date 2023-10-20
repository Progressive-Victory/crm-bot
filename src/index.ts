/* pettier-ignore-start */
import 'module-alias/register';
import 'source-map-support/register';
import './structures/prototypes';
/* prettier-ignore-end */

import { Client } from '@Client';
import { init } from '@i18n';
import {
	GatewayIntentBits as Intents, Locale, Partials 
} from 'discord.js';
import { config } from 'dotenv';
import { connect } from 'mongoose';
import { join } from 'path';

// Load .env file contents
config();

// i18n Initialization
init(join(__dirname, '../locales'), { fallback: Locale.EnglishUS, hasGlobal: true });

// Initialization (specify intents and partials)
export const client = new Client({
	intents: [
		Intents.Guilds,
		Intents.GuildMessages,
		Intents.GuildVoiceStates,
		Intents.MessageContent,
		Intents.GuildMembers,
		Intents.GuildModeration,
		Intents.GuildScheduledEvents,
		Intents.GuildMessageReactions
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.GuildScheduledEvent],
	receiveMessageComponents: true,
	receiveModals: true,
	receiveAutocomplete: true,
	replyOnError: true,
	splitCustomID: true,
	splitCustomIDOn: '_',
	useGuildCommands: false
});

(async function start() {
	await Promise.all([
		client.init({
			eventPath: join(__dirname, 'events'),
			buttonPath: join(__dirname, 'interactions', 'buttons'),
			selectMenuPath: join(__dirname, 'interactions', 'select_menus'),
			modalPath: join(__dirname, 'interactions', 'modals'),
			commandPath: join(__dirname, 'commands', 'chat', 'builders'),
			contextMenuPath: join(__dirname, 'commands', 'context_menu')
		}),
		connect(process.env.DB_URI)
	]);

	await client.login(process.env.TOKEN);

	// Skip if no-deployment flag is set, else deploys commands
	if (!process.argv.includes('--no-deployment')) {
		await client.deploy();
	}
})();
